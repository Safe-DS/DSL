import child_process from 'child_process';
import net from 'net';
import WebSocket from 'ws';
import { SafeDsServices } from '../safe-ds-module.js';
import { LangiumDocument, URI } from 'langium';
import path from 'path';
import {
    createProgramMessage,
    createShutdownMessage,
    ProgramCodeMap,
    PythonServerMessage,
    RuntimeErrorBacktraceFrame,
} from './messages.js';
import { BasicSourceMapConsumer, SourceMapConsumer } from 'source-map';
import treeKill from 'tree-kill';
import { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import { SafeDsPythonGenerator } from '../generation/safe-ds-python-generator.js';
import { isSdsModule, isSdsPipeline } from '../generated/ast.js';
import { getModuleMembers } from '../helpers/nodeProperties.js';

export class SafeDsRunner {
    private readonly annotations: SafeDsAnnotations;
    private readonly generator: SafeDsPythonGenerator;

    private logging: RunnerLoggingOutput;
    private runnerCommand: string = 'safe-ds-runner';
    private runnerProcess: child_process.ChildProcessWithoutNullStreams | undefined = undefined;
    private port: number | undefined = undefined;
    private acceptsConnections: boolean = false;
    private serverConnection: WebSocket | undefined = undefined;
    private messageCallbacks: Map<PythonServerMessage['type'], ((message: PythonServerMessage) => void)[]> = new Map<
        PythonServerMessage['type'],
        ((message: PythonServerMessage) => void)[]
    >();

    /**
     * Map that contains information about an execution keyed by the execution id.
     */
    private executionInformation: Map<string, PipelineExecutionInformation> = new Map<
        string,
        PipelineExecutionInformation
    >();

    constructor(services: SafeDsServices) {
        this.annotations = services.builtins.Annotations;
        this.generator = services.generation.PythonGenerator;
        this.logging = {
            outputError(_value: string) {},
            outputInfo(_value: string) {},
            displayError(_value: string) {},
        };
    }

    /**
     * Change the command to start the runner process. This will not cause the runner process to restart, if it is already running.
     *
     * @param command New Runner Command.
     */
    /* c8 ignore start */
    public updateRunnerCommand(command: string): void {
        this.runnerCommand = command;
    }
    /* c8 ignore stop */

    /**
     * Change the output functions for runner logging and error information to those provided.
     *
     * @param logging New Runner output functions.
     */
    /* c8 ignore start */
    public updateRunnerLogging(logging: RunnerLoggingOutput): void {
        this.logging = logging;
    }
    /* c8 ignore stop */

    /**
     * Start the python server on the next usable port, starting at 5000.
     * Uses the 'safe-ds.runner.command' setting to execute the process.
     */
    /* c8 ignore start */
    public async startPythonServer(): Promise<void> {
        this.acceptsConnections = false;
        const runnerCommandParts = this.runnerCommand.split(/\s/u);
        const runnerCommand = runnerCommandParts.shift()!; // After shift, only the actual args are left
        // Test if the python server can actually be started
        try {
            const pythonServerTest = child_process.spawn(runnerCommand, [...runnerCommandParts, '-V']);
            const versionString = await this.getPythonServerVersion(pythonServerTest);
            this.logging.outputInfo(`Using safe-ds-runner version: ${versionString}`);
        } catch (error) {
            this.logging.outputError(`Could not start runner: ${error}`);
            this.logging.displayError('The runner process could not be started.');
            return;
        }
        // Start the runner at the specified port
        this.port = await this.findFirstFreePort(5000);
        this.logging.outputInfo(`Trying to use port ${this.port} to start python server...`);
        this.logging.outputInfo(`Using command '${this.runnerCommand}' to start python server...`);

        const runnerArgs = [...runnerCommandParts, 'start', '--port', String(this.port)];
        this.logging.outputInfo(`Running ${runnerCommand}; Args: ${runnerArgs.join(' ')}`);
        this.runnerProcess = child_process.spawn(runnerCommand, runnerArgs);
        this.manageRunnerSubprocessOutputIO();
        try {
            await this.connectToWebSocket();
        } catch (error) {
            await this.stopPythonServer();
            return;
        }
        this.logging.outputInfo('Started python server successfully');
    }
    /* c8 ignore stop */

    /**
     * Stop the python server process, if any currently exist. This will first try a graceful shutdown.
     * If that fails, the whole process tree (starting at the child process spawned by startPythonServer) will get killed.
     */
    /* c8 ignore start */
    async stopPythonServer(): Promise<void> {
        this.logging.outputInfo('Stopping python server...');
        if (this.runnerProcess !== undefined) {
            if ((this.acceptsConnections && !(await this.requestGracefulShutdown(2500))) || !this.acceptsConnections) {
                this.logging.outputInfo(`Tree-killing python server process ${this.runnerProcess.pid}...`);
                const pid = this.runnerProcess.pid!;
                // Wait for tree-kill to finish killing the tree
                await new Promise<void>((resolve, _reject) => {
                    treeKill(pid, (error) => {
                        resolve();
                        if (error) {
                            this.logging.outputError(`Error while killing runner process tree: ${error}`);
                        }
                    });
                });
                // If tree-kill did not work, we don't have any more options
            }
        }
        this.runnerProcess = undefined;
        this.acceptsConnections = false;
    }
    /* c8 ignore stop */

    /* c8 ignore start */
    private async requestGracefulShutdown(maxTimeoutMs: number): Promise<boolean> {
        this.logging.outputInfo('Trying graceful shutdown...');
        this.sendMessageToPythonServer(createShutdownMessage());
        return new Promise((resolve, _reject) => {
            this.runnerProcess?.on('close', () => resolve(true));
            setTimeout(() => {
                if (this.runnerProcess === undefined) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, maxTimeoutMs);
        });
    }
    /* c8 ignore stop */

    /**
     * @return True if the python server was started and the websocket connection was established, false otherwise.
     */
    /* c8 ignore start */
    public isPythonServerAvailable(): boolean {
        return this.acceptsConnections;
    }
    /* c8 ignore stop */

    /**
     * Register a callback to execute when a message from the python server arrives.
     *
     * @param callback Callback to execute
     * @param messageType Message type to register the callback for.
     */
    /* c8 ignore start */
    public addMessageCallback<M extends PythonServerMessage['type']>(
        callback: (message: Extract<PythonServerMessage, { type: M }>) => void,
        messageType: M,
    ): void {
        if (!this.messageCallbacks.has(messageType)) {
            this.messageCallbacks.set(messageType, []);
        }
        this.messageCallbacks.get(messageType)!.push(<(message: PythonServerMessage) => void>callback);
    }
    /* c8 ignore stop */

    /**
     * Remove a previously registered callback from being called when a message from the python server arrives.
     *
     * @param callback Callback to remove
     * @param messageType Message type the callback was registered for.
     */
    /* c8 ignore start */
    public removeMessageCallback<M extends PythonServerMessage['type']>(
        callback: (message: Extract<PythonServerMessage, { type: M }>) => void,
        messageType: M,
    ): void {
        if (!this.messageCallbacks.has(messageType)) {
            return;
        }
        this.messageCallbacks.set(
            messageType,
            this.messageCallbacks.get(messageType)!.filter((storedCallback) => storedCallback !== callback),
        );
    }
    /* c8 ignore stop */

    /**
     * Get information about a pipeline execution.
     *
     * @param pipelineId Unique id that identifies a pipeline execution
     * @return Execution context assigned to the provided id.
     */
    /* c8 ignore start */
    public getExecutionContext(pipelineId: string): PipelineExecutionInformation | undefined {
        return this.executionInformation.get(pipelineId);
    }
    /* c8 ignore stop */

    /**
     * Remove information from a pipeline execution, when it is no longer needed.
     *
     * @param pipelineId Unique id that identifies a pipeline execution
     */
    /* c8 ignore start */
    public dropPipelineExecutionContext(pipelineId: string) {
        this.executionInformation.delete(pipelineId);
    }
    /* c8 ignore stop */

    /**
     * Remove information from all previous pipeline executions.
     */
    /* c8 ignore start */
    public dropAllPipelineExecutionContexts() {
        this.executionInformation.clear();
    }
    /* c8 ignore stop */

    /**
     * Map a stack frame from python to Safe-DS.
     * Uses generated sourcemaps to do this.
     * If such a mapping does not exist, this function returns undefined.
     *
     * @param executionId Id that uniquely identifies the execution that produced this stack frame
     * @param frame Stack frame from the python execution
     */
    /* c8 ignore start */
    public async tryMapToSafeDSSource(
        executionId: string,
        frame: RuntimeErrorBacktraceFrame | undefined,
    ): Promise<RuntimeErrorBacktraceFrame | undefined> {
        if (!frame) {
            return undefined;
        }
        if (!this.executionInformation.has(executionId)) {
            return undefined;
        }
        const execInfo = this.executionInformation.get(executionId)!;
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
    }
    /* c8 ignore stop */

    /**
     * Execute a Safe-DS pipeline on the python runner.
     * If a valid target placeholder is provided, the pipeline is only executed partially, to calculate the result of the placeholder.
     *
     * @param pipelineDocument Document containing the main Safe-DS pipeline to execute.
     * @param id A unique id that is used in further communication with this pipeline.
     * @param targetPlaceholder The name of the target placeholder, used to do partial execution. If no value or undefined is provided, the entire pipeline is run.
     */
    /* c8 ignore start */
    public async executePipeline(
        pipelineDocument: LangiumDocument,
        id: string,
        targetPlaceholder: string | undefined = undefined,
    ) {
        if (!this.isPythonServerAvailable()) {
            await this.stopPythonServer();
            await this.startPythonServer();
            // just fail silently, startPythonServer should already display an error
            if (!this.isPythonServerAvailable()) {
                return;
            }
        }
        const node = pipelineDocument.parseResult.value;
        if (!isSdsModule(node)) {
            return;
        }
        // Pipeline / Module name handling
        const mainPythonModuleName = this.annotations.getPythonModule(node);
        const mainPackage = mainPythonModuleName === undefined ? node.name.split('.') : [mainPythonModuleName];
        const firstPipeline = getModuleMembers(node).find(isSdsPipeline);
        if (firstPipeline === undefined) {
            this.logging.outputError('Cannot execute: no pipeline found');
            this.logging.displayError('The current file cannot be executed, as no pipeline could be found.');
            return;
        }
        const mainPipelineName = this.annotations.getPythonName(firstPipeline) || firstPipeline.name;
        const mainModuleName = this.getMainModuleName(pipelineDocument);
        // Code generation
        const [codeMap, lastGeneratedSources] = this.generateCodeForRunner(pipelineDocument, targetPlaceholder);
        // Store information about the run
        this.executionInformation.set(id, {
            generatedSource: lastGeneratedSources,
            sourceMappings: new Map<string, BasicSourceMapConsumer>(),
            path: pipelineDocument.uri.fsPath,
            source: pipelineDocument.textDocument.getText(),
            calculatedPlaceholders: new Map<string, string>(),
        });
        // Code execution
        this.sendMessageToPythonServer(
            createProgramMessage(id, {
                code: codeMap,
                main: {
                    modulepath: mainPackage.join('.'),
                    module: mainModuleName,
                    pipeline: mainPipelineName,
                },
            }),
        );
    }
    /* c8 ignore stop */

    public generateCodeForRunner(
        pipelineDocument: LangiumDocument,
        targetPlaceholder: string | undefined,
    ): [ProgramCodeMap, Map<string, string>] {
        const rootGenerationDir = path.parse(pipelineDocument.uri.fsPath).dir;
        const generatedDocuments = this.generator.generate(pipelineDocument, {
            destination: URI.file(rootGenerationDir), // actual directory of main module file
            createSourceMaps: true,
            targetPlaceholder,
            disableRunnerIntegration: false,
        });
        const lastGeneratedSources = new Map<string, string>();
        let codeMap: ProgramCodeMap = {};
        for (const generatedDocument of generatedDocuments) {
            const fsPath = URI.parse(generatedDocument.uri).fsPath;
            const workspaceRelativeFilePath = path.relative(rootGenerationDir, path.dirname(fsPath));
            const sdsFileName = path.basename(fsPath);
            const sdsNoExtFilename =
                path.extname(sdsFileName).length > 0
                    ? sdsFileName.substring(0, sdsFileName.length - path.extname(sdsFileName).length)
                    /* c8 ignore next */
                    : sdsFileName;
            // Put code in map for further use in the extension (e.g. to remap errors)
            lastGeneratedSources.set(
                path.join(workspaceRelativeFilePath, sdsFileName).replaceAll('\\', '/'),
                generatedDocument.getText(),
            );
            // Check for sourcemaps after they are already added to the pipeline context
            // This needs to happen after lastGeneratedSources.set, as errors would not get mapped otherwise
            if (fsPath.endsWith('.map')) {
                // exclude sourcemaps from sending to runner
                continue;
            }
            let modulePath = workspaceRelativeFilePath.replaceAll('/', '.').replaceAll('\\', '.');
            if (!codeMap.hasOwnProperty(modulePath)) {
                codeMap[modulePath] = {};
            }
            // Put code in object for runner
            codeMap[modulePath]![sdsNoExtFilename] = generatedDocument.getText();
        }
        return [codeMap, lastGeneratedSources];
    }

    public getMainModuleName(pipelineDocument: LangiumDocument): string {
        if (pipelineDocument.uri.fsPath.endsWith('.sdspipe')) {
            return this.generator.sanitizeModuleNameForPython(path.basename(pipelineDocument.uri.fsPath, '.sdspipe'));
        } else if (pipelineDocument.uri.fsPath.endsWith('.sdstest')) {
            return this.generator.sanitizeModuleNameForPython(path.basename(pipelineDocument.uri.fsPath, '.sdstest'));
        } else {
            return this.generator.sanitizeModuleNameForPython(path.basename(pipelineDocument.uri.fsPath));
        }
    }

    /**
     * Send a message to the python server using the websocket connection.
     *
     * @param message Message to be sent to the python server. This message should be serializable to JSON.
     */
    /* c8 ignore start */
    public sendMessageToPythonServer(message: PythonServerMessage): void {
        const messageString = JSON.stringify(message);
        this.logging.outputInfo(`Sending message to python server: ${messageString}`);
        this.serverConnection!.send(messageString);
    }
    /* c8 ignore stop */

    /* c8 ignore start */
    private async getPythonServerVersion(process: child_process.ChildProcessWithoutNullStreams) {
        process.stderr.on('data', (data: Buffer) => {
            this.logging.outputInfo(`[Runner-Err] ${data.toString().trim()}`);
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
    }
    /* c8 ignore stop */

    /* c8 ignore start */
    private manageRunnerSubprocessOutputIO() {
        if (!this.runnerProcess) {
            return;
        }
        this.runnerProcess.stdout.on('data', (data: Buffer) => {
            this.logging.outputInfo(`[Runner-Out] ${data.toString().trim()}`);
        });
        this.runnerProcess.stderr.on('data', (data: Buffer) => {
            this.logging.outputInfo(`[Runner-Err] ${data.toString().trim()}`);
        });
        this.runnerProcess.on('close', (code) => {
            this.logging.outputInfo(`[Runner] Exited: ${code}`);
            // when the server shuts down, no connections will be accepted
            this.acceptsConnections = false;
            this.runnerProcess = undefined;
        });
    }
    /* c8 ignore stop */

    /* c8 ignore start */
    private async connectToWebSocket(): Promise<void> {
        const timeoutMs = 200;
        const maxConnectionTries = 8;
        let currentTry = 0;
        // Attach WS
        return new Promise<void>((resolve, reject) => {
            const tryConnect = () => {
                this.serverConnection = new WebSocket(`ws://127.0.0.1:${this.port}/WSMain`, {
                    handshakeTimeout: 10 * 1000,
                });
                this.serverConnection.onopen = (event) => {
                    this.acceptsConnections = true;
                    this.logging.outputInfo(`[Runner] Now accepting connections: ${event.type}`);
                    resolve();
                };
                this.serverConnection.onerror = (event) => {
                    currentTry += 1;
                    if (event.message.includes('ECONNREFUSED')) {
                        if (currentTry > maxConnectionTries) {
                            this.logging.outputInfo(
                                '[Runner] Max retries reached. No further attempt at connecting is made.',
                            );
                        } else {
                            this.logging.outputInfo(`[Runner] Server is not yet up. Retrying...`);
                            setTimeout(tryConnect, timeoutMs * (2 ** currentTry - 1)); // use exponential backoff
                            return;
                        }
                    }
                    this.logging.outputError(
                        `[Runner] An error occurred: ${event.message} (${event.type}) {${event.error}}`,
                    );
                    if (this.isPythonServerAvailable()) {
                        return;
                    }
                    reject();
                };
                this.serverConnection.onmessage = (event) => {
                    if (typeof event.data !== 'string') {
                        this.logging.outputInfo(
                            `[Runner] Message received: (${event.type}, ${typeof event.data}) ${event.data}`,
                        );
                        return;
                    }
                    this.logging.outputInfo(
                        `[Runner] Message received: '${
                            event.data.length > 128 ? event.data.substring(0, 128) + '<truncated>' : event.data
                        }'`,
                    );
                    const pythonServerMessage: PythonServerMessage = JSON.parse(<string>event.data);
                    if (!this.messageCallbacks.has(pythonServerMessage.type)) {
                        this.logging.outputInfo(`[Runner] Message type '${pythonServerMessage.type}' is not handled`);
                        return;
                    }
                    for (const callback of this.messageCallbacks.get(pythonServerMessage.type)!) {
                        callback(pythonServerMessage);
                    }
                };
                this.serverConnection.onclose = (_event) => {
                    if (this.isPythonServerAvailable()) {
                        // The connection was interrupted
                        this.acceptsConnections = false;
                        this.logging.outputError('[Runner] Connection was unexpectedly closed');
                    }
                };
            };
            tryConnect();
        });
    }
    /* c8 ignore stop */

    public async findFirstFreePort(startPort: number): Promise<number> {
        return new Promise((resolve, reject) => {
            let port = startPort;

            const tryNextPort = function () {
                const server = net.createServer();
                server.on('error', (err: any) => {
                    if (err.code === 'EADDRINUSE') {
                        port++;
                        tryNextPort(); // Port is occupied, try the next one.
                    } else {
                        /* c8 ignore next 2 */
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
    }
}

/**
 * Runner Logging interface
 */
export interface RunnerLoggingOutput {
    outputInfo: (value: string) => void;
    outputError: (value: string) => void;
    displayError: (value: string) => void;
}

/**
 * Context containing information about the execution of a pipeline.
 */
export interface PipelineExecutionInformation {
    source: string;
    generatedSource: Map<string, string>;
    sourceMappings: Map<string, BasicSourceMapConsumer>;
    path: string;
    /**
     * Maps placeholder name to placeholder type
     */
    calculatedPlaceholders: Map<string, string>;
}
