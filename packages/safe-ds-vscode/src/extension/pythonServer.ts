import child_process from 'child_process';
import vscode from 'vscode';
import net from 'net';
import WebSocket from 'ws';
import { ast, SafeDsServices } from '@safe-ds/lang';
import { LangiumDocument, URI } from 'langium';
import path from 'path';
import { ProgramCodeMap, PythonServerMessage, RuntimeErrorBacktraceFrame } from './messages.js';
import { logError, logOutput } from './output.js';
import { SourceMapConsumer } from 'source-map';

let pythonServer: child_process.ChildProcessWithoutNullStreams | undefined = undefined;
let pythonServerPort: number | undefined = undefined;
let pythonServerAcceptsConnections: boolean = false;
let pythonServerConnection: WebSocket | undefined = undefined;
let pythonServerMessageCallbacks: Map<string, ((message: PythonServerMessage) => void)[]> = new Map<
    string,
    ((message: PythonServerMessage) => void)[]
>();

/**
 * Start the python server on the next usable port, starting at 5000.
 * Uses the 'safe-ds.runner.command' setting to execute the process.
 */
export const startPythonServer = async function (): Promise<void> {
    pythonServerAcceptsConnections = false;
    const runnerCommandSetting = vscode.workspace.getConfiguration('safe-ds.runner').get<string>('command')!; // Default is set
    pythonServerPort = await findFirstFreePort(5000);
    logOutput(`Trying to use port ${pythonServerPort} to start python server...`);
    logOutput(`Using command '${runnerCommandSetting}' to start python server...`);
    const runnerCommandParts = runnerCommandSetting.split(/\s/u);
    const runnerCommand = runnerCommandParts.shift()!;
    const runnerArgs = [...runnerCommandParts, '--port', String(pythonServerPort)];
    logOutput(`Running ${runnerCommand}; Args: ${runnerArgs.join(' ')}`);
    pythonServer = child_process.spawn(runnerCommand, runnerArgs);
    manageSubprocessOutputIO(pythonServer);
    await connectToWebSocket();
    logOutput('Started python server successfully');
};

export const stopPythonServer = function (): void {
    pythonServer?.kill();
    // TODO maybe tree-kill sync process? Does not seem to always be reaped, and may remain as a zombie
    pythonServer = undefined;
};

/**
 * @return True if the python server was started and the websocket connection was established, false otherwise.
 */
export const isPythonServerAvailable = function (): boolean {
    return pythonServerAcceptsConnections;
};

/**
 * Register a callback to execute when a message from the python server arrives.
 *
 * @param callback Callback to execute
 * @param messageTypes Message types to register the callback for.
 */
export const addMessageCallback = function (
    callback: (message: PythonServerMessage) => void,
    ...messageTypes: string[]
): void {
    for (const messageType of messageTypes) {
        if (!pythonServerMessageCallbacks.has(messageType)) {
            pythonServerMessageCallbacks.set(messageType, []);
        }
        pythonServerMessageCallbacks.get(messageType)!.push(callback);
    }
};

const importPipeline = async function (services: SafeDsServices, documentUri: URI): Promise<LangiumDocument> {
    const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(documentUri);
    await services.shared.workspace.DocumentBuilder.build([document], { validation: true });

    const errors = (document.diagnostics ?? []).filter((e) => e.severity === 1);

    if (errors.length > 0) {
        let errorString = `The document ${documentUri.fsPath} has errors:`;
        for (const validationError of errors) {
            errorString += `\nline ${validationError.range.start.line + 1}: ${
                validationError.message
            } [${document.textDocument.getText(validationError.range)}]`;
        }
        throw new Error(errorString);
    }
    return document;
};

/**
 * Context containing information about the execution of a pipeline.
 */
interface ExecutionInformation {
    source: string;
    generatedSource: Map<string, string>;
    path: string;
}

/**
 * Map that contains information about an execution keyed by the execution id.
 */
let executionInformation: Map<string, ExecutionInformation> = new Map<string, ExecutionInformation>();

/**
 * Get information about a pipeline execution.
 *
 * @param id Unique id that identifies a pipeline execution
 * @return Execution context assigned to the provided id.
 */
export const getExecutionContext = function (id: string): ExecutionInformation | undefined {
    return executionInformation.get(id);
};

/**
 * Map a stack frame from python to Safe-DS.
 * Uses generated sourcemaps to do this.
 * If such a mapping does not exist, this function returns undefined.
 *
 * @param executionId Id that uniquely identifies the execution that produced this stack frame
 * @param frame Stack frame from the python execution
 */
export const tryMapToSafeDSSource = async function (
    executionId: string,
    frame: RuntimeErrorBacktraceFrame | undefined,
): Promise<RuntimeErrorBacktraceFrame | undefined> {
    if (!frame) {
        return undefined;
    }
    if (!executionInformation.has(executionId)) {
        return undefined;
    }
    const execInfo = executionInformation.get(executionId)!;
    let sourceMapKeys = Array.from(execInfo.generatedSource.keys() || []).filter((value) =>
        value.endsWith(`${frame.file}.py.map`),
    );
    if (sourceMapKeys.length === 0) {
        return undefined;
    }
    let sourceMapKey = sourceMapKeys[0]!;
    const sourceMapObject = JSON.parse(execInfo.generatedSource.get(sourceMapKey)!);
    sourceMapObject.sourcesContent = [execInfo.source];
    const consumer = await new SourceMapConsumer(sourceMapObject);
    // TODO cache in execInfo??
    const outputPosition = consumer.originalPositionFor({
        line: Number(frame.line),
        column: 0,
        bias: SourceMapConsumer.LEAST_UPPER_BOUND,
    });
    return { file: outputPosition.source || '<unknown>', line: outputPosition.line || 0 };
};

/**
 * Execute a Safe-DS pipeline on the python runner.
 *
 * @param services SafeDsServices object, used to import the pipeline file.
 * @param pipelinePath Path to a Safe-DS pipeline file to execute.
 * @param id A unique id that is used in further communication with this pipeline.
 */
export const executePipeline = async function (services: SafeDsServices, pipelinePath: string, id: string) {
    const documentUri = URI.file(pipelinePath);
    services.shared.workspace.LangiumDocuments.deleteDocument(documentUri);
    let document;
    try {
        document = await importPipeline(services, documentUri);
    } catch (e) {
        if (e instanceof Error) {
            logError(e.message);
            vscode.window.showErrorMessage(e.message);
        }
        return;
    }
    const lastExecutedSource = document.textDocument.getText();

    const node = document.parseResult.value;
    //
    let mainPipelineName;
    let mainModuleName;
    // TODO let mainPackageName;
    if (!ast.isSdsModule(node)) {
        return;
    }
    const pipelines = (node?.members?.filter(ast.isSdsModuleMember) ?? []).filter(ast.isSdsPipeline);
    const firstPipeline = pipelines[0];
    if (firstPipeline === undefined) {
        logOutput('Cannot execute: no pipeline found');
        return;
    }
    mainPipelineName = firstPipeline.name;
    mainModuleName = path.basename(pipelinePath, '.sdspipe').replaceAll('-', '_');
    // TODO mainPackageName = '';
    //
    const generatedDocuments = services.generation.PythonGenerator.generate(document, {
        destination: URI.file(''),
        createSourceMaps: true,
    });
    const lastGeneratedSource = new Map<string, string>();
    let codeMap: ProgramCodeMap = {};
    for (const generatedDocument of generatedDocuments) {
        const fsPath = URI.parse(generatedDocument.uri).fsPath;
        lastGeneratedSource.set(fsPath, generatedDocument.getText());
        if (fsPath.endsWith('.map')) {
            // exclude sourcemaps
            continue;
        }
        const sdsFileName = path.basename(fsPath);
        const sdsNoExtFilename =
            path.extname(sdsFileName).length > 0
                ? sdsFileName.substring(0, sdsFileName.length - path.extname(sdsFileName).length /* - 1 */)
                : sdsFileName;
        // TODO const sdsPackageFilePath = path.dirname(fsPath);
        // TODO const sdsPackage = sdsPackageFilePath.replaceAll('/', '.');
        if (!codeMap.hasOwnProperty(/*TODO sdsPackage*/ '')) {
            codeMap[/*TODO sdsPackage*/ ''] = {};
        }
        const content = generatedDocument.getText();
        codeMap[/*TODO sdsPackage*/ '']![sdsNoExtFilename] = content;
    }
    executionInformation.set(id, {
        generatedSource: lastGeneratedSource,
        path: pipelinePath,
        source: lastExecutedSource,
    });
    sendMessageToPythonServer({
        type: 'program',
        id,
        data: {
            code: codeMap,
            main: { package: /*TODO mainPackageName*/ '', module: mainModuleName, pipeline: mainPipelineName },
        },
    });
};

/**
 * Send a message to the python server using the websocket connection.
 *
 * @param message Message to be sent to the python server. This message should be serializable to JSON.
 */
export const sendMessageToPythonServer = function (message: PythonServerMessage): void {
    const messageString = JSON.stringify(message);
    logOutput(`Sending message to python server: ${messageString}`);
    pythonServerConnection!.send(messageString);
};

const manageSubprocessOutputIO = function (process: child_process.ChildProcessWithoutNullStreams) {
    process.stdout.on('data', (data: Buffer) => {
        logOutput(`[Runner-Out] ${data.toString().trim()}`);
    });
    process.stderr.on('data', (data: Buffer) => {
        logOutput(`[Runner-Err] ${data.toString().trim()}`);
    });
    process.on('close', (code) => {
        logOutput(`[Runner] Exited: ${code}`);
    });
};

const connectToWebSocket = async function (): Promise<void> {
    // Attach WS
    return new Promise<void>((resolve, reject) => {
        const tryConnect = function () {
            pythonServerConnection = new WebSocket(`ws://127.0.0.1:${pythonServerPort}/WSMain`, {
                handshakeTimeout: 10 * 1000,
            });
            pythonServerConnection.onopen = (event) => {
                pythonServerAcceptsConnections = true;
                logOutput(`[Runner] Now accepting connections: ${event.type}`);
                resolve();
            };
            pythonServerConnection.onerror = (event) => {
                if (event.message.includes('ECONNREFUSED')) {
                    logOutput(`[Runner] Server is not yet up. Retrying...`);
                    setTimeout(tryConnect, 50);
                    return;
                }
                logError(`[Runner] An error occurred: ${event.message} (${event.type}) {${event.error}}`);
                reject();
            };
            pythonServerConnection.onmessage = (event) => {
                if (typeof event.data !== 'string') {
                    logOutput(`[Runner] Message received: (${event.type}, ${typeof event.data}) ${event.data}`);
                    return;
                }
                logOutput(`[Runner] Message received: '${event.data}'`);
                const pythonServerMessage: PythonServerMessage = JSON.parse(<string>event.data);
                if (!pythonServerMessageCallbacks.has(pythonServerMessage.type)) {
                    logOutput(`[Runner] Message type '${pythonServerMessage.type}' is not handled`);
                    return;
                }
                for (const callback of pythonServerMessageCallbacks.get(pythonServerMessage.type)!) {
                    callback(pythonServerMessage);
                }
            };
        };
        tryConnect();
    });
};

const findFirstFreePort = async function (startPort: number): Promise<number> {
    return new Promise((resolve, reject) => {
        let port = startPort;

        const tryNextPort = function () {
            const server = net.createServer();
            server.on('error', (err: any) => {
                if (err.code === 'EADDRINUSE') {
                    port++;
                    tryNextPort(); // Port is occupied, try the next one.
                } else {
                    reject('Unknown error'); // An unexpected error occurred
                }
            });
            server.listen(port, '127.0.0.1', () => {
                server.once('close', () => {
                    resolve(port); // Port is free, resolve with the current port number.
                });
                server.close(); // Immediately close the server after it's opened.
            });
        };
        tryNextPort();
    });
};