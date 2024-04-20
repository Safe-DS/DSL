import { SafeDsServices } from '../safe-ds-module.js';
import treeKill from 'tree-kill';
import { SafeDsLogger, SafeDsMessagingProvider } from '../communication/safe-ds-messaging-provider.js';
import child_process from 'child_process';
import { RPC_RUNNER_INSTALL, RPC_RUNNER_START, RPC_RUNNER_STARTED, RPC_RUNNER_UPDATE } from './safe-ds-runner.js';
import WebSocket from 'ws';
import { createShutdownMessage, PythonServerMessage } from './messages.js';
import { Disposable } from 'langium';
import { SafeDsSettingsProvider } from '../workspace/safe-ds-settings-provider.js';
import semver from 'semver';
import net, { AddressInfo } from 'node:net';

const LOWEST_SUPPORTED_RUNNER_VERSION = '0.11.0';
const LOWEST_UNSUPPORTED_RUNNER_VERSION = '0.12.0';
const npmVersionRange = `>=${LOWEST_SUPPORTED_RUNNER_VERSION} <${LOWEST_UNSUPPORTED_RUNNER_VERSION}`;
export const pipVersionRange = `>=${LOWEST_SUPPORTED_RUNNER_VERSION},<${LOWEST_UNSUPPORTED_RUNNER_VERSION}`;

export class SafeDsPythonServer {
    private readonly logger: SafeDsLogger;
    private readonly messaging: SafeDsMessagingProvider;
    private readonly settingsProvider: SafeDsSettingsProvider;

    private _isStarted: boolean = false;
    private serverProcess: child_process.ChildProcessWithoutNullStreams | undefined = undefined;
    private serverConnection: WebSocket | undefined = undefined;
    private messageCallbacks: Map<PythonServerMessage['type'], ((message: PythonServerMessage) => void)[]> = new Map();

    constructor(services: SafeDsServices) {
        this.logger = services.communication.MessagingProvider.createTaggedLogger('Python Server');
        this.messaging = services.communication.MessagingProvider;
        this.settingsProvider = services.workspace.SettingsProvider;

        // Restart if the runner command changes
        services.workspace.SettingsProvider.onRunnerCommandUpdate(async () => {
            await this.restart();
        });

        // Start if specifically requested. This can happen if the updater installed a new version of the runner but the
        // runner command did not have to be changed.
        this.messaging.onNotification(RPC_RUNNER_START, async () => {
            await this.restart();
        });

        // Stop the Python server when the language server is shut down
        services.shared.lsp.Connection?.onShutdown(async () => {
            await this.stopPythonServer();
        });
    }

    // Lifecycle methods -----------------------------------------------------------------------------------------------

    /**
     * Whether the Python server is started and ready to accept requests.
     */
    get isStarted(): boolean {
        return this._isStarted;
    }

    /**
     * Start the Python server.
     */
    private async start(): Promise<void> {
        // Do not start the server if it is already started
        if (this._isStarted) {
            return;
        }

        this.logger.info('Starting...');

        // Get the runner command
        const command = this.settingsProvider.getRunnerCommand();
        this.logger.debug(`Using runner command "${command}".`);

        // Check whether the runner command is set properly and get the runner version
        let version: string;
        try {
            version = await this.getRunnerVersion(command);
            this.logger.debug(`Found safe-ds-runner with version "${version}".`);
        } catch (error) {
            await this.reportBadRunnerCommand(command, error);
            return;
        }

        // Check whether the runner version is supported
        if (!this.isValidVersion(version)) {
            await this.reportOutdatedRunner(version);
            return;
        }

        // Start the server at a free port
        const port = await this.getFreePort();
        this.startServerProcess(command, port);

        // Connect to the server
        try {
            await this.connectToWebSocket(port); // TODO extract
        } catch (error) {
            await this.stopPythonServer();
            return;
        }

        this.logger.info('Started successfully.');

        // Notify the services in the language client that the process has started.
        // To be removed once all the execution logic is in the language server.
        if (this._isStarted) {
            await this.messaging.sendNotification(RPC_RUNNER_STARTED, port);
        }
    }

    /**
     * Stop the Python server.
     */
    private async stop(): Promise<void> {
        if (!this._isStarted) {
            return;
        }

        // TODO
    }

    /**
     * Stop the Python server and start it again.
     */
    private async restart(): Promise<void> {
        await this.stopPythonServer();
        await this.start();
    }

    // Runner version --------------------------------------------------------------------------------------------------

    /**
     * Attempt to get the version of the runner command.
     *
     * @returns A promise that resolves to the version of the runner if it could be determined, otherwise the promise is
     * rejected.
     */
    private async getRunnerVersion(command: string): Promise<string> {
        const versionProcess = child_process.spawn(command, ['-V']);

        return new Promise((resolve, reject) => {
            versionProcess.stdout.on('data', (data: Buffer) => {
                const version = data.toString().trim().split(/\s/u)[1];
                if (version !== undefined) {
                    resolve(version);
                }
            });
            versionProcess.on('error', (err) => {
                reject(new Error(`The subprocess could not be started (${err.message}).`));
            });
            versionProcess.on('close', (code) => {
                reject(new Error(`The subprocess closed with code ${code}.`));
            });
        });
    }

    /**
     * Check whether the available runner is supported.
     */
    private isValidVersion(version: string): boolean {
        return semver.satisfies(version, npmVersionRange);
    }

    // Port handling ---------------------------------------------------------------------------------------------------

    /**
     * Get a random free port on the local machine.
     */
    private async getFreePort(): Promise<number> {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.listen(0, '127.0.0.1', () => {
                const port = (server.address() as AddressInfo).port;
                server.close(() => resolve(port));
            });
        });
    }

    // Process handling ------------------------------------------------------------------------------------------------

    /**
     * Starts the server using the given command and port.
     */
    private startServerProcess(command: string, port: number) {
        // Spawn the server process
        const args = ['start', '--port', String(port)];
        this.logger.debug(`Running "${command} ${args.join(' ')}".`);
        this.serverProcess = child_process.spawn(command, args);

        // Log the output of the server process
        this.serverProcess.stdout.on('data', (data: Buffer) => {
            this.logger.debug(`[Stdout] ${data.toString().trim()}`);
        });
        this.serverProcess.stderr.on('data', (data: Buffer) => {
            this.logger.debug(`[Stderr] ${data.toString().trim()}`);
        });

        // Handle the termination of the server process
        this.serverProcess.on('close', (code) => {
            this.logger.info(`Process exited with code ${code}.`);
            this.resetState();
        });
    }

    // User interaction ------------------------------------------------------------------------------------------------

    private async reportBadRunnerCommand(command: string, error: unknown): Promise<void> {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(`Could not start runner with command "${command}": ${message}`);

        // Show an error message to the user and offer to install the runner
        const action = await this.messaging.showErrorMessage(`The runner could not be started.`, {
            title: 'Install runner',
        });
        if (action?.title === 'Install runner') {
            await this.messaging.sendNotification(RPC_RUNNER_INSTALL);
        }
    }

    private async reportOutdatedRunner(version: string): Promise<void> {
        this.logger.error(`Installed runner version ${version} is not in range "${pipVersionRange}".`);

        // Show an error message to the user and offer to update the runner
        const action = await this.messaging.showErrorMessage(
            `The runner must be updated to a version in the range "${pipVersionRange}".`,
            { title: 'Update runner' },
        );
        if (action?.title === 'Update runner') {
            await this.messaging.sendNotification(RPC_RUNNER_UPDATE);
        }
    }

    // TODO ------------------------------------------------------------------------------------------------------------

    async stopPythonServer(): Promise<void> {
        this.logger.info('Stopping...');
        if (this.serverProcess !== undefined) {
            if ((this._isStarted && !(await this.requestGracefulShutdown(2500))) || !this._isStarted) {
                this.logger.debug(`Tree-killing python server process ${this.serverProcess.pid}...`);
                const pid = this.serverProcess.pid!;
                // Wait for tree-kill to finish killing the tree
                await new Promise<void>((resolve, _reject) => {
                    treeKill(pid, (error) => {
                        resolve();
                        if (error) {
                            this.logger.error(`Error while killing runner process tree: ${error}`);
                        }
                    });
                });
                // If tree-kill did not work, we don't have any more options
            }
        }

        this.resetState();
    }

    /**
     * Reset fields to their initial state.
     */
    private resetState(): void {
        this._isStarted = false;
        this.serverProcess = undefined;
        this.serverConnection = undefined;
    }

    private async requestGracefulShutdown(maxTimeoutMs: number): Promise<boolean> {
        this.logger.debug('Trying graceful shutdown...');
        this.sendMessageToPythonServer(createShutdownMessage());
        return new Promise((resolve, _reject) => {
            this.serverProcess?.on('close', () => resolve(true));
            setTimeout(() => {
                if (this.serverProcess === undefined) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, maxTimeoutMs);
        });
    }

    /**
     * Send a message to the python server using the websocket connection.
     *
     * @param message Message to be sent to the python server. This message should be serializable to JSON.
     */
    /* c8 ignore start */
    public sendMessageToPythonServer(message: PythonServerMessage): void {
        const messageString = JSON.stringify(message);
        this.logger.trace(`Sending message to python server: ${messageString}`);
        this.serverConnection!.send(messageString);
    }

    private async connectToWebSocket(port: number): Promise<void> {
        const timeoutMs = 200;
        const maxConnectionTries = 8;
        let currentTry = 0;
        // Attach WS
        return new Promise<void>((resolve, reject) => {
            const tryConnect = () => {
                this.serverConnection = new WebSocket(`ws://127.0.0.1:${port}/WSMain`, {
                    handshakeTimeout: 10 * 1000,
                });
                this.serverConnection.onopen = (event) => {
                    this._isStarted = true;
                    this.logger.debug(`Now accepting connections: ${event.type}`);
                    resolve();
                };
                this.serverConnection.onerror = (event) => {
                    currentTry += 1;
                    if (event.message.includes('ECONNREFUSED')) {
                        if (currentTry > maxConnectionTries) {
                            this.logger.error('Max retries reached. No further attempt at connecting is made.');
                        } else {
                            this.logger.info(`Not yet up. Retrying...`);
                            setTimeout(tryConnect, timeoutMs * 2 ** (currentTry - 1)); // use exponential backoff
                            return;
                        }
                    }
                    this.logger.error(`An error occurred: ${event.message} (${event.type}) {${event.error}}`);
                    if (this._isStarted) {
                        return;
                    }
                    reject();
                };
                this.serverConnection.onmessage = (event) => {
                    if (typeof event.data !== 'string') {
                        this.logger.trace(
                            `Message received: (${event.type}, ${typeof event.data}) ${event.data}`,
                            undefined,
                        );
                        return;
                    }
                    this.logger.trace(
                        `Message received: '${
                            event.data.length > 128 ? event.data.substring(0, 128) + '<truncated>' : event.data
                        }'`,
                        undefined,
                    );
                    const pythonServerMessage: PythonServerMessage = JSON.parse(<string>event.data);
                    if (!this.messageCallbacks.has(pythonServerMessage.type)) {
                        this.logger.trace(`Message type '${pythonServerMessage.type}' is not handled`, undefined);
                        return;
                    }
                    for (const callback of this.messageCallbacks.get(pythonServerMessage.type)!) {
                        callback(pythonServerMessage);
                    }
                };
                this.serverConnection.onclose = (_event) => {
                    if (this._isStarted) {
                        this.logger.error('Connection was unexpectedly closed');
                        this.restart();
                    }
                };
            };
            tryConnect();
        });
    }
    /* c8 ignore stop */

    /**
     * Register a callback to execute when a message from the python server arrives.
     *
     * @param messageType Message type to register the callback for.
     * @param callback Callback to execute
     */
    public addMessageCallback<M extends PythonServerMessage['type']>(
        messageType: M,
        callback: (message: Extract<PythonServerMessage, { type: M }>) => void,
    ): Disposable {
        if (!this.messageCallbacks.has(messageType)) {
            this.messageCallbacks.set(messageType, []);
        }
        this.messageCallbacks.get(messageType)!.push(<(message: PythonServerMessage) => void>callback);

        return {
            dispose: () => {
                if (!this.messageCallbacks.has(messageType)) {
                    return;
                }
                this.messageCallbacks.set(
                    messageType,
                    this.messageCallbacks.get(messageType)!.filter((storedCallback) => storedCallback !== callback),
                );
            },
        };
    }

    /**
     * Remove a previously registered callback from being called when a message from the python server arrives.
     *
     * @param messageType Message type the callback was registered for.
     * @param callback Callback to remove
     */
    public removeMessageCallback<M extends PythonServerMessage['type']>(
        messageType: M,
        callback: (message: Extract<PythonServerMessage, { type: M }>) => void,
    ): void {
        if (!this.messageCallbacks.has(messageType)) {
            return;
        }
        this.messageCallbacks.set(
            messageType,
            this.messageCallbacks.get(messageType)!.filter((storedCallback) => storedCallback !== callback),
        );
    }

    async connectToPort(port: number): Promise<void> {
        if (this._isStarted) {
            return;
        }

        try {
            await this.connectToWebSocket(port);
        } catch (error) {
            await this.stopPythonServer();
        }
    }
}
