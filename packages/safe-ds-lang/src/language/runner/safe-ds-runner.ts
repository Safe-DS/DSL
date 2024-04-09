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
    RuntimeErrorMessage,
} from './messages.js';
import { SourceMapConsumer } from 'source-map-js';
import treeKill from 'tree-kill';
import { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import { SafeDsPythonGenerator } from '../generation/safe-ds-python-generator.js';
import { isSdsModule } from '../generated/ast.js';
import semver from 'semver';
import { SafeDsMessagingProvider } from '../lsp/safe-ds-messaging-provider.js';

// Most of the functionality cannot be tested automatically as a functioning runner setup would always be required

export const RPC_RUNNER_STARTED = 'runner/started';

const LOWEST_SUPPORTED_VERSION = '0.9.0';
const LOWEST_UNSUPPORTED_VERSION = '0.10.0';
const npmVersionRange = `>=${LOWEST_SUPPORTED_VERSION} <${LOWEST_UNSUPPORTED_VERSION}`;
const pipVersionRange = `>=${LOWEST_SUPPORTED_VERSION},<${LOWEST_UNSUPPORTED_VERSION}`;

const RUNNER_TAG = 'Runner';

export class SafeDsRunner {
    private readonly annotations: SafeDsAnnotations;
    private readonly generator: SafeDsPythonGenerator;
    private readonly messaging: SafeDsMessagingProvider;

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

    /* c8 ignore start */
    constructor(services: SafeDsServices) {
        this.annotations = services.builtins.Annotations;
        this.generator = services.generation.PythonGenerator;
        this.messaging = services.lsp.MessagingProvider;

        // Register listeners
        this.registerMessageLoggingCallbacks();

        services.workspace.SettingsProvider.onRunnerCommandUpdate(async (newValue) => {
            await this.updateRunnerCommand(newValue);
        });

        services.shared.lsp.Connection?.onShutdown(async () => {
            await this.stopPythonServer();
        });
    }

    private registerMessageLoggingCallbacks() {
        this.addMessageCallback((message) => {
            this.info(
                `Placeholder value is (${message.id}): ${message.data.name} of type ${message.data.type} = ${message.data.value}`,
            );
        }, 'placeholder_value');
        this.addMessageCallback((message) => {
            this.info(`Placeholder was calculated (${message.id}): ${message.data.name} of type ${message.data.type}`);
            const execInfo = this.getExecutionContext(message.id);
            execInfo?.calculatedPlaceholders.set(message.data.name, message.data.type);
            // this.sendMessageToPythonServer(
            //    messages.createPlaceholderQueryMessage(message.id, message.data.name),
            //);
        }, 'placeholder_type');
        this.addMessageCallback((message) => {
            this.info(`Runner-Progress (${message.id}): ${message.data}`);
        }, 'runtime_progress');
        this.addMessageCallback(async (message) => {
            let readableStacktraceSafeDs: string[] = [];
            const execInfo = this.getExecutionContext(message.id)!;
            const readableStacktracePython = await Promise.all(
                (<RuntimeErrorMessage>message).data.backtrace.map(async (frame) => {
                    const mappedFrame = await this.tryMapToSafeDSSource(message.id, frame);
                    if (mappedFrame) {
                        readableStacktraceSafeDs.push(
                            `\tat ${URI.file(execInfo.path)}#${mappedFrame.line} (${execInfo.path} line ${
                                mappedFrame.line
                            })`,
                        );
                        return `\tat ${frame.file} line ${frame.line} (mapped to '${mappedFrame.file}' line ${mappedFrame.line})`;
                    }
                    return `\tat ${frame.file} line ${frame.line}`;
                }),
            );
            this.error(
                `Runner-RuntimeError (${message.id}): ${
                    (<RuntimeErrorMessage>message).data.message
                } \n${readableStacktracePython.join('\n')}`,
            );
            this.error(
                `Safe-DS Error (${message.id}): ${(<RuntimeErrorMessage>message).data.message} \n${readableStacktraceSafeDs
                    .reverse()
                    .join('\n')}`,
            );
        }, 'runtime_error');
    }

    async connectToPort(port: number): Promise<void> {
        if (this.isPythonServerAvailable()) {
            return;
        }

        this.port = port;
        try {
            await this.connectToWebSocket();
        } catch (error) {
            await this.stopPythonServer();
        }
    }

    /**
     * Change the command to start the runner process. This will not cause the runner process to restart, if it is already running.
     *
     * @param command New Runner Command.
     */
    public async updateRunnerCommand(command: string | undefined): Promise<void> {
        if (command) {
            this.runnerCommand = command;
            await this.startPythonServer();
            if (this.isPythonServerAvailable()) {
                await this.messaging.sendNotification(RPC_RUNNER_STARTED, this.port);
            }
        }
    }

    /**
     * Start the python server on the next usable port, starting at 5000.
     * Uses the 'safe-ds.runner.command' setting to execute the process.
     */
    public async startPythonServer(): Promise<void> {
        if (this.isPythonServerAvailable()) {
            this.info('As the Safe-DS Runner is currently successfully running, no attempt to start it will be made');
            return;
        }

        this.acceptsConnections = false;
        const runnerCommandParts = this.runnerCommand.split(/\s/u);
        const runnerCommand = runnerCommandParts.shift()!; // After shift, only the actual args are left
        // Test if the python server can actually be started
        try {
            const pythonServerTest = child_process.spawn(runnerCommand, [...runnerCommandParts, '-V']);
            const versionString = await this.getPythonServerVersion(pythonServerTest);
            if (!semver.satisfies(versionString, npmVersionRange)) {
                this.error(`Installed runner version ${versionString} does not meet requirements: ${pipVersionRange}`);
                this.messaging.showErrorMessage(
                    `The installed runner version ${versionString} is not compatible with this version of the extension. The installed version should match these requirements: ${pipVersionRange}. Please update to a matching version.`,
                );
                return;
            } else {
                this.info(`Using safe-ds-runner version: ${versionString}`);
            }
        } catch (error) {
            this.error(`Could not start runner: ${error instanceof Error ? error.message : error}`);
            this.messaging.showErrorMessage(
                `The runner process could not be started: ${error instanceof Error ? error.message : error}`,
            );
            return;
        }
        // Start the runner at the specified port
        this.port = await this.findFirstFreePort(5000);
        this.info(`Trying to use port ${this.port} to start python server...`);
        this.info(`Using command '${this.runnerCommand}' to start python server...`);

        const runnerArgs = [...runnerCommandParts, 'start', '--port', String(this.port)];
        this.info(`Running ${runnerCommand}; Args: ${runnerArgs.join(' ')}`);
        this.runnerProcess = child_process.spawn(runnerCommand, runnerArgs);
        this.manageRunnerSubprocessOutputIO();
        try {
            await this.connectToWebSocket();
        } catch (error) {
            await this.stopPythonServer();
            return;
        }
        this.info('Started python server successfully');
    }

    /**
     * Stop the python server process, if any currently exist. This will first try a graceful shutdown.
     * If that fails, the whole process tree (starting at the child process spawned by startPythonServer) will get killed.
     */
    async stopPythonServer(): Promise<void> {
        this.info('Stopping python server...');
        if (this.runnerProcess !== undefined) {
            if ((this.acceptsConnections && !(await this.requestGracefulShutdown(2500))) || !this.acceptsConnections) {
                this.info(`Tree-killing python server process ${this.runnerProcess.pid}...`);
                const pid = this.runnerProcess.pid!;
                // Wait for tree-kill to finish killing the tree
                await new Promise<void>((resolve, _reject) => {
                    treeKill(pid, (error) => {
                        resolve();
                        if (error) {
                            this.error(`Error while killing runner process tree: ${error}`);
                        }
                    });
                });
                // If tree-kill did not work, we don't have any more options
            }
        }
        this.runnerProcess = undefined;
        this.acceptsConnections = false;
    }

    private async requestGracefulShutdown(maxTimeoutMs: number): Promise<boolean> {
        this.info('Trying graceful shutdown...');
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

    /**
     * @return True if the python server was started and the websocket connection was established, false otherwise.
     */
    public isPythonServerAvailable(): boolean {
        return this.acceptsConnections;
    }

    /**
     * Register a callback to execute when a message from the python server arrives.
     *
     * @param callback Callback to execute
     * @param messageType Message type to register the callback for.
     */
    public addMessageCallback<M extends PythonServerMessage['type']>(
        callback: (message: Extract<PythonServerMessage, { type: M }>) => void,
        messageType: M,
    ): void {
        if (!this.messageCallbacks.has(messageType)) {
            this.messageCallbacks.set(messageType, []);
        }
        this.messageCallbacks.get(messageType)!.push(<(message: PythonServerMessage) => void>callback);
    }

    /**
     * Remove a previously registered callback from being called when a message from the python server arrives.
     *
     * @param callback Callback to remove
     * @param messageType Message type the callback was registered for.
     */
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

    /**
     * Get information about a pipeline execution.
     *
     * @param pipelineId Unique id that identifies a pipeline execution
     * @return Execution context assigned to the provided id.
     */
    public getExecutionContext(pipelineId: string): PipelineExecutionInformation | undefined {
        return this.executionInformation.get(pipelineId);
    }

    /**
     * Remove information from a pipeline execution, when it is no longer needed.
     *
     * @param pipelineId Unique id that identifies a pipeline execution
     */
    public dropPipelineExecutionContext(pipelineId: string) {
        this.executionInformation.delete(pipelineId);
    }

    /**
     * Remove information from all previous pipeline executions.
     */
    public dropAllPipelineExecutionContexts() {
        this.executionInformation.clear();
    }

    /**
     * Map a stack frame from python to Safe-DS.
     * Uses generated sourcemaps to do this.
     * If such a mapping does not exist, this function returns undefined.
     *
     * @param executionId Id that uniquely identifies the execution that produced this stack frame
     * @param frame Stack frame from the python execution
     */
    private async tryMapToSafeDSSource(
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
            const consumer = new SourceMapConsumer(sourceMapObject);
            execInfo.sourceMappings.set(sourceMapKey, consumer);
        }
        const outputPosition = execInfo.sourceMappings.get(sourceMapKey)!.originalPositionFor({
            line: Number(frame.line),
            column: 0,
            bias: SourceMapConsumer.LEAST_UPPER_BOUND,
        });
        return { file: outputPosition.source || '<unknown>', line: outputPosition.line || 0 };
    }

    /**
     * Execute a Safe-DS pipeline on the python runner.
     * If a valid target placeholder is provided, the pipeline is only executed partially, to calculate the result of the placeholder.
     *
     * @param id A unique id that is used in further communication with this pipeline.
     * @param pipelineDocument Document containing the main Safe-DS pipeline to execute.
     * @param pipelineName Name of the pipeline that should be run
     * @param targetPlaceholder The name of the target placeholder, used to do partial execution. If no value or undefined is provided, the entire pipeline is run.
     */
    public async executePipeline(
        id: string,
        pipelineDocument: LangiumDocument,
        pipelineName: string,
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
        const mainModuleName = this.getMainModuleName(pipelineDocument);
        // Code generation
        const [codeMap, lastGeneratedSources] = this.generateCodeForRunner(pipelineDocument, targetPlaceholder);
        // Store information about the run
        this.executionInformation.set(id, {
            generatedSource: lastGeneratedSources,
            sourceMappings: new Map<string, SourceMapConsumer>(),
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
                    pipeline: pipelineName,
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
                    : /* c8 ignore next */
                      sdsFileName;
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
        this.info(`Sending message to python server: ${messageString}`);
        this.serverConnection!.send(messageString);
    }

    private async getPythonServerVersion(process: child_process.ChildProcessWithoutNullStreams) {
        process.stderr.on('data', (data: Buffer) => {
            this.info(`[Runner-Err] ${data.toString().trim()}`);
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
            process.on('error', (err) => {
                reject(new Error(`The subprocess could not be started (${err.message})`));
            });
        });
    }

    private manageRunnerSubprocessOutputIO() {
        if (!this.runnerProcess) {
            return;
        }
        this.runnerProcess.stdout.on('data', (data: Buffer) => {
            this.info(`[Runner-Out] ${data.toString().trim()}`);
        });
        this.runnerProcess.stderr.on('data', (data: Buffer) => {
            this.info(`[Runner-Err] ${data.toString().trim()}`);
        });
        this.runnerProcess.on('close', (code) => {
            this.info(`Exited: ${code}`);
            // when the server shuts down, no connections will be accepted
            this.acceptsConnections = false;
            this.runnerProcess = undefined;
        });
    }

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
                    this.info(`Now accepting connections: ${event.type}`);
                    resolve();
                };
                this.serverConnection.onerror = (event) => {
                    currentTry += 1;
                    if (event.message.includes('ECONNREFUSED')) {
                        if (currentTry > maxConnectionTries) {
                            this.info('Max retries reached. No further attempt at connecting is made.');
                        } else {
                            this.info(`Server is not yet up. Retrying...`);
                            setTimeout(tryConnect, timeoutMs * (2 ** currentTry - 1)); // use exponential backoff
                            return;
                        }
                    }
                    this.error(`An error occurred: ${event.message} (${event.type}) {${event.error}}`);
                    if (this.isPythonServerAvailable()) {
                        return;
                    }
                    reject();
                };
                this.serverConnection.onmessage = (event) => {
                    if (typeof event.data !== 'string') {
                        this.info(`Message received: (${event.type}, ${typeof event.data}) ${event.data}`);
                        return;
                    }
                    this.info(
                        `Message received: '${
                            event.data.length > 128 ? event.data.substring(0, 128) + '<truncated>' : event.data
                        }'`,
                    );
                    const pythonServerMessage: PythonServerMessage = JSON.parse(<string>event.data);
                    if (!this.messageCallbacks.has(pythonServerMessage.type)) {
                        this.info(`Message type '${pythonServerMessage.type}' is not handled`);
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
                        this.error('Connection was unexpectedly closed');
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

    /* c8 ignore start */
    private info(message: string) {
        this.messaging.info(RUNNER_TAG, message);
    }

    private error(message: string) {
        this.messaging.error(RUNNER_TAG, message);
    }
    /* c8 ignore stop */
}

/**
 * Context containing information about the execution of a pipeline.
 */
export interface PipelineExecutionInformation {
    source: string;
    generatedSource: Map<string, string>;
    sourceMappings: Map<string, SourceMapConsumer>;
    path: string;
    /**
     * Maps placeholder name to placeholder type
     */
    calculatedPlaceholders: Map<string, string>;
}
