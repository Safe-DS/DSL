import { SafeDsServices } from '../safe-ds-module.js';
import treeKill from 'tree-kill';
import { SafeDsLogger, SafeDsMessagingProvider } from '../communication/safe-ds-messaging-provider.js';
import child_process from 'child_process';
import semver from 'semver';
import { RPC_RUNNER_INSTALL, RPC_RUNNER_START, RPC_RUNNER_STARTED, RPC_RUNNER_UPDATE } from './safe-ds-runner.js';
import WebSocket from 'ws';
import { createShutdownMessage, PythonServerMessage } from './messages.js';
import net from 'net';
import { Disposable } from 'langium';

const LOG_TAG = 'Python Server';
const LOWEST_SUPPORTED_RUNNER_VERSION = '0.11.0';
const LOWEST_UNSUPPORTED_RUNNER_VERSION = '0.12.0';
const npmVersionRange = `>=${LOWEST_SUPPORTED_RUNNER_VERSION} <${LOWEST_UNSUPPORTED_RUNNER_VERSION}`;
export const pipVersionRange = `>=${LOWEST_SUPPORTED_RUNNER_VERSION},<${LOWEST_UNSUPPORTED_RUNNER_VERSION}`;

export class SafeDsPythonServer {
    private readonly logger: SafeDsLogger;
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

    constructor(services: SafeDsServices) {
        this.logger = services.communication.MessagingProvider.createTaggedLogger(LOG_TAG);
        this.messaging = services.communication.MessagingProvider;

        services.workspace.SettingsProvider.onRunnerCommandUpdate(async (newValue) => {
            await this.updateRunnerCommand(newValue);
        });

        this.messaging.onNotification(RPC_RUNNER_START, async () => {
            if (!this.isReady()) {
                await this.startPythonServer();
            }
        });

        services.shared.lsp.Connection?.onShutdown(async () => {
            await this.stopPythonServer();
        });
    }

    /**
     * Start the python server on the next usable port, starting at 5000.
     * Uses the 'safe-ds.runner.command' setting to execute the process.
     */
    public async startPythonServer(): Promise<void> {
        if (this.isReady()) {
            this.logger.info(
                'As the Safe-DS Runner is currently successfully running, no attempt to start it will be made',
            );
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
                this.logger.error(
                    `Installed runner version ${versionString} does not meet requirements: ${pipVersionRange}`,
                );
                const action = await this.messaging.showErrorMessage(
                    `The installed runner version ${versionString} is not compatible with this version of the extension. The installed version should match these requirements: ${pipVersionRange}. Please update to a matching version.`,
                    { title: 'Update runner' },
                );
                if (action?.title === 'Update runner') {
                    await this.messaging.sendNotification(RPC_RUNNER_UPDATE);
                }
                return;
            } else {
                this.logger.debug(`Using safe-ds-runner version: ${versionString}`);
            }
        } catch (error) {
            this.logger.error(`Could not start runner: ${error instanceof Error ? error.message : error}`);
            const action = await this.messaging.showErrorMessage(
                `The runner process could not be started: ${error instanceof Error ? error.message : error}`,
                { title: 'Install runner' },
            );
            if (action?.title === 'Install runner') {
                await this.messaging.sendNotification(RPC_RUNNER_INSTALL);
            }
            return;
        }
        // Start the runner at the specified port
        this.port = await this.findFirstFreePort(5000);
        this.logger.debug(`Trying to use port ${this.port} to start python server...`);
        this.logger.debug(`Using command '${this.runnerCommand}' to start python server...`);

        const runnerArgs = [...runnerCommandParts, 'start', '--port', String(this.port)];
        this.logger.debug(`Running ${runnerCommand}; Args: ${runnerArgs.join(' ')}`);
        this.runnerProcess = child_process.spawn(runnerCommand, runnerArgs);
        this.manageRunnerSubprocessOutputIO();
        try {
            await this.connectToWebSocket();
        } catch (error) {
            await this.stopPythonServer();
            return;
        }
        this.logger.info('Started python server successfully');
    }

    async stopPythonServer(): Promise<void> {
        this.logger.info('Stopping python server...');
        if (this.runnerProcess !== undefined) {
            if ((this.acceptsConnections && !(await this.requestGracefulShutdown(2500))) || !this.acceptsConnections) {
                this.logger.debug(`Tree-killing python server process ${this.runnerProcess.pid}...`);
                const pid = this.runnerProcess.pid!;
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
        this.runnerProcess = undefined;
        this.acceptsConnections = false;
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
            if (this.isReady()) {
                await this.messaging.sendNotification(RPC_RUNNER_STARTED, this.port);
            }
        }
    }

    private async requestGracefulShutdown(maxTimeoutMs: number): Promise<boolean> {
        this.logger.debug('Trying graceful shutdown...');
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

    private async getPythonServerVersion(process: child_process.ChildProcessWithoutNullStreams) {
        process.stderr.on('data', (data: Buffer) => {
            this.logger.debug(data.toString().trim());
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
            this.logger.debug(data.toString().trim());
        });
        this.runnerProcess.stderr.on('data', (data: Buffer) => {
            this.logger.debug(data.toString().trim());
        });
        this.runnerProcess.on('close', (code) => {
            this.logger.info(`Exited: ${code}`);
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
                    this.logger.debug(`Now accepting connections: ${event.type}`);
                    resolve();
                };
                this.serverConnection.onerror = (event) => {
                    currentTry += 1;
                    if (event.message.includes('ECONNREFUSED')) {
                        if (currentTry > maxConnectionTries) {
                            this.logger.error('Max retries reached. No further attempt at connecting is made.');
                        } else {
                            this.logger.info(`Server is not yet up. Retrying...`);
                            setTimeout(tryConnect, timeoutMs * (2 ** currentTry - 1)); // use exponential backoff
                            return;
                        }
                    }
                    this.logger.error(`An error occurred: ${event.message} (${event.type}) {${event.error}}`);
                    if (this.isReady()) {
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
                    if (this.isReady()) {
                        // The connection was interrupted
                        this.acceptsConnections = false;
                        this.logger.error('Connection was unexpectedly closed');
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
        if (this.isReady()) {
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
     * @return True if the python server was started and the websocket connection was established, false otherwise.
     */
    public isReady(): boolean {
        return this.acceptsConnections;
    }
}
