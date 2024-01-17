import child_process from 'child_process';
import vscode from 'vscode';
import net from 'net';
import WebSocket from 'ws';
import { ast, getModuleMembers, SafeDsServices } from '@safe-ds/lang';
import { LangiumDocument, URI } from 'langium';
import path from 'path';
import {
    createProgramMessage,
    createShutdownMessage,
    ProgramCodeMap,
    PythonServerMessage,
    RuntimeErrorBacktraceFrame,
} from './messages.js';
import { logError, logOutput } from './output.js';
import { BasicSourceMapConsumer, SourceMapConsumer } from 'source-map';
import treeKill from 'tree-kill';

let pythonServer: child_process.ChildProcessWithoutNullStreams | undefined = undefined;
let pythonServerPort: number | undefined = undefined;
let pythonServerAcceptsConnections: boolean = false;
let pythonServerConnection: WebSocket | undefined = undefined;
let pythonServerMessageCallbacks: Map<PythonServerMessage['type'], ((message: PythonServerMessage) => void)[]> =
    new Map<PythonServerMessage['type'], ((message: PythonServerMessage) => void)[]>();

/**
 * Start the python server on the next usable port, starting at 5000.
 * Uses the 'safe-ds.runner.command' setting to execute the process.
 */
export const startPythonServer = async function (): Promise<void> {
    pythonServerAcceptsConnections = false;
    const runnerCommandSetting = vscode.workspace.getConfiguration('safe-ds.runner').get<string>('command')!; // Default is set
    const runnerCommandParts = runnerCommandSetting.split(/\s/u);
    const runnerCommand = runnerCommandParts.shift()!; // After shift, only the actual args are left
    // Test if the python server can actually be started
    try {
        const pythonServerTest = child_process.spawn(runnerCommand, [...runnerCommandParts, '-V']);
        const versionString = await getPythonServerVersion(pythonServerTest);
        logOutput(`Using safe-ds-runner version: ${versionString}`);
    } catch (error) {
        logError(`Could not start runner: ${error}`);
        vscode.window.showErrorMessage('The runner process could not be started.');
        return;
    }
    // Start the runner at the specified port
    pythonServerPort = await findFirstFreePort(5000);
    logOutput(`Trying to use port ${pythonServerPort} to start python server...`);
    logOutput(`Using command '${runnerCommandSetting}' to start python server...`);

    const runnerArgs = [...runnerCommandParts, 'start', '--port', String(pythonServerPort)];
    logOutput(`Running ${runnerCommand}; Args: ${runnerArgs.join(' ')}`);
    pythonServer = child_process.spawn(runnerCommand, runnerArgs);
    manageRunnerSubprocessOutputIO();
    try {
        await connectToWebSocket();
    } catch (error) {
        await stopPythonServer();
        return;
    }
    logOutput('Started python server successfully');
};

/**
 * Stop the python server process, if any currently exist. This will first try a graceful shutdown.
 * If that fails, the whole process tree (starting at the child process spawned by startPythonServer) will get killed.
 */
export const stopPythonServer = async function (): Promise<void> {
    logOutput('Stopping python server...');
    if (pythonServer !== undefined) {
        if (
            (pythonServerAcceptsConnections && !(await requestGracefulShutdown(2500))) ||
            !pythonServerAcceptsConnections
        ) {
            logOutput(`Tree-killing python server process ${pythonServer.pid}...`);
            const pid = pythonServer.pid!;
            // Wait for tree-kill to finish killing the tree
            await new Promise<void>((resolve, _reject) => {
                treeKill(pid, (error) => {
                    resolve();
                    if (error) {
                        logError(`Error while killing runner process tree: ${error}`);
                    }
                });
            });
            // If tree-kill did not work, we don't have any more options
        }
    }
    pythonServer = undefined;
    pythonServerAcceptsConnections = false;
};

const requestGracefulShutdown = async function (maxTimeoutMs: number): Promise<boolean> {
    logOutput('Trying graceful shutdown...');
    sendMessageToPythonServer(createShutdownMessage());
    return new Promise((resolve, _reject) => {
        pythonServer?.on('close', () => resolve(true));
        setTimeout(() => {
            if (pythonServer === undefined) {
                resolve(true);
            } else {
                resolve(false);
            }
        }, maxTimeoutMs);
    });
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
 * @param messageType Message type to register the callback for.
 */
export const addMessageCallback = function <M extends PythonServerMessage['type']>(
    callback: (message: Extract<PythonServerMessage, { type: M }>) => void,
    messageType: M,
): void {
    if (!pythonServerMessageCallbacks.has(messageType)) {
        pythonServerMessageCallbacks.set(messageType, []);
    }
    pythonServerMessageCallbacks.get(messageType)!.push(<(message: PythonServerMessage) => void>callback);
};

/**
 * Remove a previously registered callback from being called when a message from the python server arrives.
 *
 * @param callback Callback to remove
 * @param messageType Message type the callback was registered for.
 */
export const removeMessageCallback = function <M extends PythonServerMessage['type']>(
    callback: (message: Extract<PythonServerMessage, { type: M }>) => void,
    messageType: M,
): void {
    if (!pythonServerMessageCallbacks.has(messageType)) {
        return;
    }
    pythonServerMessageCallbacks.set(
        messageType,
        pythonServerMessageCallbacks.get(messageType)!.filter((storedCallback) => storedCallback !== callback),
    );
};

const importPipeline = async function (
    services: SafeDsServices,
    documentUri: URI,
): Promise<LangiumDocument | undefined> {
    const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(documentUri);
    await services.shared.workspace.DocumentBuilder.build([document], { validation: true });

    const errors = (document.diagnostics ?? []).filter((e) => e.severity === 1);

    if (errors.length > 0) {
        logError(`The file ${documentUri.toString()} has errors and cannot be run.`);
        for (const validationError of errors) {
            logError(
                `\tat line ${validationError.range.start.line + 1}: ${
                    validationError.message
                } [${document.textDocument.getText(validationError.range)}]`,
            );
        }
        return undefined;
    }
    return document;
};

/**
 * Context containing information about the execution of a pipeline.
 */
interface ExecutionInformation {
    source: string;
    generatedSource: Map<string, string>;
    sourceMappings: Map<string, BasicSourceMapConsumer>;
    path: string;
    /**
     * Maps placeholder name to placeholder type
     */
    calculatedPlaceholders: Map<string, string>;
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
    if (!execInfo.sourceMappings.has(sourceMapKey)) {
        const sourceMapObject = JSON.parse(execInfo.generatedSource.get(sourceMapKey)!);
        sourceMapObject.sourcesContent = [execInfo.source];
        const consumer = await new SourceMapConsumer(sourceMapObject);
        execInfo.sourceMappings.set(sourceMapKey, consumer);
    }
    const outputPosition = execInfo.sourceMappings.get(sourceMapKey)!.originalPositionFor({
        line: Number(frame.line),
        column: 0,
        bias: SourceMapConsumer.LEAST_UPPER_BOUND,
    });
    return { file: outputPosition.source || '<unknown>', line: outputPosition.line || 0 };
};

/**
 * Execute a Safe-DS pipeline on the python runner.
 * If a valid target placeholder is provided, the pipeline is only executed partially, to calculate the result of the placeholder.
 *
 * @param services SafeDsServices object, used to import the pipeline file.
 * @param pipelinePath Path to a Safe-DS pipeline file to execute.
 * @param id A unique id that is used in further communication with this pipeline.
 * @param targetPlaceholder The name of the target placeholder, used to do partial execution. If no value or undefined is provided, the entire pipeline is run.
 */
export const executePipeline = async function (
    services: SafeDsServices,
    pipelinePath: string,
    id: string,
    targetPlaceholder: string | undefined = undefined,
) {
    if (!isPythonServerAvailable()) {
        await stopPythonServer();
        await startPythonServer();
        // just fail silently, startPythonServer should already display an error
        if (!isPythonServerAvailable()) {
            return;
        }
    }
    // TODO include all relevant files from workspace
    const documentUri = URI.file(pipelinePath);
    const workspaceRoot = path.dirname(documentUri.fsPath); // TODO get actual workspace root
    services.shared.workspace.LangiumDocuments.deleteDocument(documentUri);
    let document = await importPipeline(services, documentUri);
    if (!document) {
        vscode.window.showErrorMessage(`The file ${documentUri.fsPath} has errors and cannot be run.`);
        return;
    }
    const lastExecutedSource = document.textDocument.getText();

    const node = document.parseResult.value;
    //
    let mainPipelineName;
    let mainModuleName;
    if (!ast.isSdsModule(node)) {
        return;
    }
    const mainPythonModuleName = services.builtins.Annotations.getPythonModule(node);
    const mainPackage = mainPythonModuleName === undefined ? node?.name.split('.') : [mainPythonModuleName];
    const firstPipeline = getModuleMembers(node).find(ast.isSdsPipeline);
    if (firstPipeline === undefined) {
        logError('Cannot execute: no pipeline found');
        vscode.window.showErrorMessage('The current file cannot be executed, as no pipeline could be found.');
        return;
    }
    mainPipelineName = services.builtins.Annotations.getPythonName(firstPipeline) || firstPipeline.name;
    if (pipelinePath.endsWith('.sdspipe')) {
        mainModuleName = services.generation.PythonGenerator.sanitizeModuleNameForPython(
            path.basename(pipelinePath, '.sdspipe'),
        );
    } else if (pipelinePath.endsWith('.sdstest')) {
        mainModuleName = services.generation.PythonGenerator.sanitizeModuleNameForPython(
            path.basename(pipelinePath, '.sdstest'),
        );
    } else {
        mainModuleName = services.generation.PythonGenerator.sanitizeModuleNameForPython(path.basename(pipelinePath));
    }
    //
    const generatedDocuments = services.generation.PythonGenerator.generate(document, {
        destination: URI.file(path.dirname(documentUri.fsPath)), // actual directory of main module file
        createSourceMaps: true,
        targetPlaceholder,
    });
    const lastGeneratedSource = new Map<string, string>();
    let codeMap: ProgramCodeMap = {};
    for (const generatedDocument of generatedDocuments) {
        const fsPath = URI.parse(generatedDocument.uri).fsPath;
        const workspaceRelativeFilePath = path.relative(workspaceRoot, path.dirname(fsPath));
        const sdsFileName = path.basename(fsPath);
        const sdsNoExtFilename =
            path.extname(sdsFileName).length > 0
                ? sdsFileName.substring(0, sdsFileName.length - path.extname(sdsFileName).length)
                : sdsFileName;

        lastGeneratedSource.set(
            path.join(workspaceRelativeFilePath, sdsFileName).replaceAll('\\', '/'),
            generatedDocument.getText(),
        );
        // Check for sourcemaps after they are already added to the pipeline context
        // This needs to happen after lastGeneratedSource.set, as errors would not get mapped otherwise
        if (fsPath.endsWith('.map')) {
            // exclude sourcemaps from sending to runner
            continue;
        }
        let modulePath = workspaceRelativeFilePath.replaceAll('/', '.').replaceAll('\\', '.');
        if (!codeMap.hasOwnProperty(modulePath)) {
            codeMap[modulePath] = {};
        }
        const content = generatedDocument.getText();
        codeMap[modulePath]![sdsNoExtFilename] = content;
    }
    executionInformation.set(id, {
        generatedSource: lastGeneratedSource,
        sourceMappings: new Map<string, BasicSourceMapConsumer>(),
        path: pipelinePath,
        source: lastExecutedSource,
        calculatedPlaceholders: new Map<string, string>(),
    });
    sendMessageToPythonServer(
        createProgramMessage(id, {
            code: codeMap,
            main: {
                modulepath: mainPackage.join('.'),
                module: mainModuleName,
                pipeline: mainPipelineName,
            },
        }),
    );
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

const getPythonServerVersion = async function (process: child_process.ChildProcessWithoutNullStreams) {
    process.stderr.on('data', (data: Buffer) => {
        logOutput(`[Runner-Err] ${data.toString().trim()}`);
    });
    return new Promise<string>((resolve, reject) => {
        process.stdout.on('data', (data: Buffer) => {
            const version = data.toString().trim().split(/\s/u)[1];
            if (version !== undefined) {
                resolve(version);
            }
        });
        process.on('close', (code) => {
            reject(new Error(`The subprocess shut down: ${code}`));
        });
    });
};

const manageRunnerSubprocessOutputIO = function () {
    if (!pythonServer) {
        return;
    }
    pythonServer.stdout.on('data', (data: Buffer) => {
        logOutput(`[Runner-Out] ${data.toString().trim()}`);
    });
    pythonServer.stderr.on('data', (data: Buffer) => {
        logOutput(`[Runner-Err] ${data.toString().trim()}`);
    });
    pythonServer.on('close', (code) => {
        logOutput(`[Runner] Exited: ${code}`);
        // when the server shuts down, no connections will be accepted
        pythonServerAcceptsConnections = false;
        pythonServer = undefined;
    });
};

const connectToWebSocket = async function (): Promise<void> {
    const timeoutMs = 200;
    const maxConnectionTries = 8;
    let currentTry = 0;
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
                currentTry += 1;
                if (event.message.includes('ECONNREFUSED')) {
                    if (currentTry > maxConnectionTries) {
                        logError('[Runner] Max retries reached. No further attempt at connecting is made.');
                    } else {
                        logOutput(`[Runner] Server is not yet up. Retrying...`);
                        setTimeout(tryConnect, timeoutMs * (2 ** currentTry - 1)); // use exponential backoff
                        return;
                    }
                }
                logError(`[Runner] An error occurred: ${event.message} (${event.type}) {${event.error}}`);
                if (isPythonServerAvailable()) {
                    return;
                }
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
            pythonServerConnection.onclose = (_event) => {
                if (isPythonServerAvailable()) {
                    // The connection was interrupted
                    pythonServerAcceptsConnections = false;
                    logError('[Runner] Connection was unexpectedly closed');
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
