import { SafeDsServices } from '../safe-ds-module.js';
import treeKill from 'tree-kill';
import { SafeDsLogger, SafeDsMessagingProvider } from '../communication/safe-ds-messaging-provider.js';
import child_process from 'child_process';
import WebSocket from 'ws';
import { createShutdownMessage, PythonServerMessage } from './messages.js';
import { Disposable } from 'langium';
import { SafeDsSettingsProvider } from '../workspace/safe-ds-settings-provider.js';
import semver from 'semver';
import net, { AddressInfo } from 'node:net';
import { ChildProcessWithoutNullStreams } from 'node:child_process';
import {
    InstallRunnerNotification,
    RunnerStartedNotification,
    StartRunnerNotification,
    UpdateRunnerNotification,
} from '../communication/rpc.js';

const LOWEST_SUPPORTED_RUNNER_VERSION = '0.11.0';
const LOWEST_UNSUPPORTED_RUNNER_VERSION = '0.12.0';
const npmVersionRange = `>=${LOWEST_SUPPORTED_RUNNER_VERSION} <${LOWEST_UNSUPPORTED_RUNNER_VERSION}`;
export const pipVersionRange = `>=${LOWEST_SUPPORTED_RUNNER_VERSION},<${LOWEST_UNSUPPORTED_RUNNER_VERSION}`;

/* c8 ignore start */
export class SafeDsPythonServer {
    private readonly logger: SafeDsLogger;
    private readonly messaging: SafeDsMessagingProvider;
    private readonly settingsProvider: SafeDsSettingsProvider;

    private state: State = stopped;
    private restartTracker = new RestartTracker();
    private messageCallbacks: Map<PythonServerMessage['type'], ((message: PythonServerMessage) => void)[]> = new Map();

    constructor(services: SafeDsServices) {
        this.logger = services.communication.MessagingProvider.createTaggedLogger('Python Server');
        this.messaging = services.communication.MessagingProvider;
        this.settingsProvider = services.workspace.SettingsProvider;

        // Restart if the runner command changes
        services.workspace.SettingsProvider.onRunnerCommandUpdate(async () => {
            await this.start();
        });

        // Start if specifically requested. This can happen if the updater installed a new version of the runner but the
        // runner command did not have to be changed.
        this.messaging.onNotification(StartRunnerNotification.type, async () => {
            await this.start();
        });

        // Stop the Python server when the language server is shut down
        services.shared.lsp.Connection?.onShutdown(async () => {
            await this.stop();
        });
    }

    // Lifecycle methods -----------------------------------------------------------------------------------------------

    /**
     * Whether the Python server is started and ready to accept requests.
     */
    get isStarted(): boolean {
        return isStarted(this.state);
    }

    /**
     * Start the Python server and connect to it.
     */
    private async start(): Promise<void> {
        // Only start a stopped server
        if (!isStopped(this.state)) {
            return;
        }
        this.state = starting();
        this.logger.info('Starting...');

        // Get the runner command
        const command = await this.getValidRunnerCommand();
        if (!command) {
            return;
        }

        // Start the server at a free port
        const port = await this.getFreePort();
        this.startServerProcess(command, port);

        // Connect to the server
        await this.connectToServer(port);

        // Notify the services in the language client that the process has started.
        // TODO: Removed once all the execution logic is in the language server.
        if (isStarted(this.state)) {
            this.logger.info('Started successfully.');
            await this.messaging.sendNotification(RunnerStartedNotification.type, { port });
        }
    }

    /**
     * Stop the Python server.
     */
    // TODO make private once the execution logic is fully handled in the language server
    async stop(): Promise<void> {
        // Only stop a started server
        if (!isStarted(this.state)) {
            return;
        }
        this.state = stopping(this.state.serverProcess, this.state.serverConnection);
        this.logger.info('Stopping...');

        // Attempt a graceful shutdown first
        await this.stopServerProcessGracefully(2500);
        if (isStopped(this.state)) {
            this.logger.info('Stopped successfully.');
            return;
        }

        // If the graceful shutdown failed, kill the server process
        this.logger.debug('Graceful shutdown failed. Killing the server process...');
        await this.killServerProcess();
        if (isStopped(this.state)) {
            this.logger.info('Stopped successfully.');
            return;
        }

        // The server could not be stopped
        this.logger.error('Could not stop the server.');
        this.state = failed;
    }

    /**
     * Stop the Python server and start it again.
     *
     * @param shouldBeTracked Whether the restart should be tracked. If `false`, the restart will always be executed.
     */
    private async restart(shouldBeTracked: boolean): Promise<void> {
        if (shouldBeTracked && !this.restartTracker.shouldRestart()) {
            this.logger.error('Restarting too frequently. Aborting.');
            return;
        }

        await this.stop();
        await this.start();
    }

    // Command handling ------------------------------------------------------------------------------------------------

    /**
     * Get the runner command from the settings provider and check whether it is valid.
     *
     * @returns The runner command if it is valid, otherwise `undefined`.
     */
    private async getValidRunnerCommand(): Promise<string | undefined> {
        const command = this.settingsProvider.getRunnerCommand();
        this.logger.debug(`Using runner command "${command}".`);

        // Check whether the runner command is set properly and get the runner version
        let version: string;
        try {
            version = await this.getRunnerVersion(command);
            this.logger.debug(`Found safe-ds-runner with version "${version}".`);
        } catch (error) {
            await this.reportBadRunnerCommand(command, error);
            return undefined;
        }

        // Check whether the runner version is supported
        if (!this.isValidVersion(version)) {
            await this.reportOutdatedRunner(version);
            return undefined;
        }

        return command;
    }

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
        if (!isStarting(this.state)) {
            return;
        }

        // Spawn the server process
        const args = ['start', '--port', String(port)];
        this.logger.debug(`Running "${command} ${args.join(' ')}".`);
        const serverProcess = child_process.spawn(command, args);

        // Log the output of the server process
        serverProcess.stdout.on('data', (data: Buffer) => {
            this.logger.debug(`[Stdout] ${data.toString().trim()}`);
        });
        serverProcess.stderr.on('data', (data: Buffer) => {
            this.logger.debug(`[Stderr] ${data.toString().trim()}`);
        });

        // Handle the termination of the server process
        serverProcess.on('close', (code) => {
            this.logger.debug(`Process exited with code ${code}.`);
            this.state = stopped;
        });

        // Update the state
        this.state = starting(serverProcess);
    }

    /**
     * Request a graceful shutdown of the server process.
     */
    private async stopServerProcessGracefully(maxTimeoutMs: number): Promise<void> {
        if (!isStopping(this.state)) {
            return;
        }
        this.logger.debug('Trying graceful shutdown...');

        return new Promise((resolve) => {
            // Always resolve after a certain time
            const cancelToken = setTimeout(resolve, maxTimeoutMs);

            // Wait for the server process to close
            this.state.serverProcess?.on('close', () => {
                clearTimeout(cancelToken);
                resolve();
            });

            // Send a shutdown message to the server. Do this last, so we don't miss the close event.
            this.sendMessageToPythonServer(createShutdownMessage());
        });
    }

    /**
     * Kill the server process forcefully.
     */
    private async killServerProcess(): Promise<void> {
        if (!isStopping(this.state)) {
            return;
        }
        this.logger.debug('Killing process...');

        // Get the process ID
        const pid = this.state.serverProcess?.pid;
        if (!pid) {
            return;
        }

        // Kill the process
        await new Promise<void>((resolve) => {
            treeKill(pid, (error) => {
                if (error) {
                    this.logger.error(`Error while killing process: ${error}`);
                }

                resolve();
            });
        });
    }

    // Socket handling -------------------------------------------------------------------------------------------------

    /**
     * Connect to the server using the given port.
     */
    private async connectToServer(port: number): Promise<void> {
        try {
            await this.doConnectToServer(port);
        } catch {
            await this.stop();
        }
    }

    private async doConnectToServer(port: number): Promise<void> {
        if (!isStarting(this.state)) {
            return;
        }
        this.logger.debug(`Connecting to server at port ${port}...`);

        const baseTimeoutMs = 200;
        const maxConnectionTries = 8;
        let currentTry = 0;

        return new Promise<void>((resolve, reject) => {
            const tryConnect = () => {
                const serverConnection = new WebSocket(`ws://127.0.0.1:${port}/WSMain`, {
                    handshakeTimeout: 10 * 1000,
                });

                // Connected successfully
                serverConnection.onopen = () => {
                    this.logger.debug(`Connected successfully.`);
                    this.state = started(this.state.serverProcess, serverConnection);
                    resolve();
                };

                // Handle connection errors
                serverConnection.onerror = (event) => {
                    currentTry += 1;

                    // Retry if the connection was refused with exponential backoff
                    if (event.message.includes('ECONNREFUSED')) {
                        serverConnection.terminate();

                        if (currentTry > maxConnectionTries) {
                            this.logger.error('Max retries reached. No further attempt at connecting is made.');
                        } else {
                            this.logger.debug(`Not yet up. Retrying...`);
                            setTimeout(tryConnect, baseTimeoutMs * 2 ** (currentTry - 1)); // use exponential backoff
                        }
                        return;
                    }

                    // Log other errors and reject if the server is not started
                    this.logger.error(`An error occurred: ${event.type} ${event.message}`);
                    if (!isStarted(this.state)) {
                        reject();
                    }
                };

                // Handle incoming messages
                serverConnection.onmessage = (event) => {
                    if (typeof event.data !== 'string') {
                        this.logger.trace(`Message received: (${event.type}, ${typeof event.data}) ${event.data}`);
                        return;
                    }
                    this.logger.trace(
                        `Message received: '${
                            event.data.length > 128 ? event.data.substring(0, 128) + '<truncated>' : event.data
                        }'`,
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

                // Handle the server closing the connection
                serverConnection.onclose = () => {
                    if (
                        isStarted(this.state) &&
                        this.state.serverProcess &&
                        this.state.serverConnection === serverConnection
                    ) {
                        this.logger.error('Connection was unexpectedly closed');
                        this.restart(true);
                    }
                };
            };
            tryConnect();
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
            await this.messaging.sendNotification(InstallRunnerNotification.type);
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
            await this.messaging.sendNotification(UpdateRunnerNotification.type);
        }
    }

    // TODO ------------------------------------------------------------------------------------------------------------

    /**
     * Send a message to the python server using the websocket connection.
     *
     * @param message Message to be sent to the python server. This message should be serializable to JSON.
     */
    public sendMessageToPythonServer(message: PythonServerMessage): void {
        if (!isStarted(this.state)) {
            return;
        }

        const messageString = JSON.stringify(message);
        this.logger.trace(`Sending message to python server: ${messageString}`);
        this.state.serverConnection.send(messageString);
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
        if (!isStopped(this.state)) {
            return;
        }
        this.state = starting();

        try {
            await this.doConnectToServer(port);
        } catch (error) {
            await this.stop();
        }
    }
}

// State ---------------------------------------------------------------------------------------------------------------

/**
 * The Python server process is stopped.
 */
const stopped = {
    type: 'stopped',
    serverProcess: undefined,
    serverConnection: undefined,
} as const;

const isStopped = (state: State): state is typeof stopped => state === stopped;

/**
 * The Python server process is being started.
 */
interface Starting {
    type: 'starting';
    serverProcess?: ChildProcessWithoutNullStreams;
    serverConnection: undefined;
}

const starting = (serverProcess?: ChildProcessWithoutNullStreams): Starting => ({
    type: 'starting',
    serverProcess,
    serverConnection: undefined,
});

const isStarting = (state: State): state is Starting => state.type === 'starting';

/**
 * The Python server process is started, and we are connected to it.
 */
interface Started {
    type: 'started';
    // TODO: Should always be defined once the execution is fully handled in the language server
    serverProcess?: ChildProcessWithoutNullStreams;
    serverConnection: WebSocket;
}

const started = (serverProcess: ChildProcessWithoutNullStreams | undefined, serverConnection: WebSocket): Started => ({
    type: 'started',
    serverProcess,
    serverConnection,
});

const isStarted = (state: State): state is Started => state.type === 'started';

/**
 * The Python server process is being stopped.
 */
interface Stopping {
    type: 'stopping';
    serverProcess?: ChildProcessWithoutNullStreams;
    serverConnection?: WebSocket;
}

const stopping = (
    serverProcess: ChildProcessWithoutNullStreams | undefined,
    serverConnection: WebSocket,
): Stopping => ({
    type: 'stopping',
    serverProcess,
    serverConnection,
});

const isStopping = (state: State): state is Stopping => state.type === 'stopping';

/**
 * Something went wrong.
 */
const failed = {
    type: 'failed',
    serverProcess: undefined,
    serverConnection: undefined,
} as const;

type State = typeof stopped | Starting | Started | Stopping | typeof failed;

// Restart tracking ----------------------------------------------------------------------------------------------------

/**
 * Tracks restarts of the Python server.
 */
class RestartTracker {
    private timestamps: number[] = [];

    /**
     * Add a timestamp to the tracker and check whether the server should be restarted.
     */
    shouldRestart(): boolean {
        const now = Date.now();
        this.timestamps.push(now);
        this.timestamps = this.timestamps.filter((timestamp) => now - timestamp < 60_000);
        return this.timestamps.length <= 5;
    }
}

/* c8 ignore stop */
