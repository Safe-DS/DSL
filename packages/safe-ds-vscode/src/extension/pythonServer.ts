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
    /*sendMessageToPythonServer({
        type: 'program',
        data: {
            code: {
                '': {
                    gen_b: "import logging\nimport safeds_runner.codegen\n\ndef c():\n\ta1 = 1\n\ta2 = safeds_runner.codegen.eager_or(True, False)\n\tlogging.debug('test')\n\tprint('print test')\n\tlogging.debug('dynamic pipeline output')\n\treturn a1 + a2\n",
                    gen_b_c: "from gen_b import c\n\nif __name__ == '__main__':\n\tc()",
                },
            },
            main: {
                package: 'a.test',
                module: 'b',
                pipeline: 'c',
            },
        },
    });*/
};

export const stopPythonServer = function (): void {
    pythonServer?.kill();
    pythonServer = undefined;
};

export const isPythonServerAvailable = function (): boolean {
    return pythonServerAcceptsConnections;
};

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

let lastExecutedSource: string | undefined = undefined;
let lastGeneratedSource: Map<string, string> | undefined = undefined;

export const tryMapToSafeDSSource = async function (
    frame: RuntimeErrorBacktraceFrame | undefined,
): Promise<RuntimeErrorBacktraceFrame | undefined> {
    if (!frame) {
        return undefined;
    }
    let sourceMapKeys = Array.from(lastGeneratedSource?.keys() || []).filter((value) =>
        value.endsWith(`${frame.file}.py.map`),
    );
    if (sourceMapKeys.length === 0) {
        return undefined;
    }
    let sourceMapKey = sourceMapKeys[0]!;
    const sourceMapObject = JSON.parse(lastGeneratedSource!.get(sourceMapKey)!);
    sourceMapObject.sourcesContent = [lastExecutedSource];
    const consumer = await new SourceMapConsumer(sourceMapObject);
    const outputPosition = consumer.originalPositionFor({
        line: frame.line,
        column: 0,
        bias: SourceMapConsumer.LEAST_UPPER_BOUND,
    });
    return { file: outputPosition.source || '<unknown>', line: outputPosition.line || 0 };
};

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
    lastExecutedSource = document.textDocument.getText();

    const node = document.parseResult.value;
    //
    let mainPipelineName;
    let mainModuleName;
    let mainPackageName;
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
    mainPackageName = '';
    //
    const generatedDocuments = services.generation.PythonGenerator.generate(document, {
        destination: URI.file(''),
        createSourceMaps: true,
    });
    lastGeneratedSource = new Map<string, string>(); // TODO better solution?
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
        const sdsPackageFilePath = path.dirname(fsPath);
        const sdsPackage = sdsPackageFilePath.replaceAll('/', '.');
        if (!codeMap.hasOwnProperty(/*TODO sdsPackage*/ '')) {
            codeMap[/*TODO sdsPackage*/ ''] = {};
        }
        const content = generatedDocument.getText();
        codeMap[/*TODO sdsPackage*/ '']![sdsNoExtFilename] = content;
    }
    sendMessageToPythonServer({
        type: 'program',
        id,
        data: {
            code: codeMap,
            main: { package: /*TODO mainPackageName*/ '', module: mainModuleName, pipeline: mainPipelineName },
        },
    });
};

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

            server.listen(port, () => {
                server.once('close', () => {
                    resolve(port); // Port is free, resolve with the current port number.
                });
                server.close(); // Immediately close the server after it's opened.
            });

            server.on('error', (err: any) => {
                if (err.code === 'EADDRINUSE') {
                    port++;
                    tryNextPort(); // Port is occupied, try the next one.
                } else {
                    reject('Unknown error'); // An unexpected error occurred
                }
            });
        };
        tryNextPort();
    });
};
