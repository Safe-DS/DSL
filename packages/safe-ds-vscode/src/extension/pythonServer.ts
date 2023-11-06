import child_process from 'child_process';
import vscode from 'vscode';
import net from 'net';
import WebSocket from 'ws';

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
    console.info(`Trying to use port ${pythonServerPort} to start python server...`);
    console.info(`Using command '${runnerCommandSetting}' to start python server...`);
    const runnerCommandParts = runnerCommandSetting.split(/\s/u);
    const runnerCommand = runnerCommandParts.shift()!;
    const runnerArgs = [...runnerCommandParts, '--port', String(pythonServerPort)];
    console.info(`Running ${runnerCommand}; Args: ${runnerArgs.join(' ')}`);
    pythonServer = child_process.spawn(runnerCommand, runnerArgs);
    manageSubprocessOutputIO(pythonServer);
    await connectToWebSocket();
    console.info('Started python server successfully');
    sendMessageToPythonServer({
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
    });
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

export const sendMessageToPythonServer = function (message: PythonServerMessage): void {
    const messageString = JSON.stringify(message);
    console.info(`Sending message to python server: ${messageString}`);
    pythonServerConnection!.send(messageString);
};

const manageSubprocessOutputIO = function (process: child_process.ChildProcessWithoutNullStreams) {
    process.stdout.on('data', (data: Buffer) => {
        console.log(`[Runner-Out] ${data.toString().trim()}`);
    });
    process.stderr.on('data', (data: Buffer) => {
        console.log(`[Runner-Err] ${data.toString().trim()}`);
    });
    process.on('close', (code) => {
        console.log(`[Runner] Exited: ${code}`);
    });
};

const connectToWebSocket = async function (): Promise<void> {
    // Attach WS
    return new Promise<void>((resolve, reject) => {
        const tryConnect = function () {
            pythonServerConnection = new WebSocket(`ws://127.0.0.1:${pythonServerPort}/WSRunProgram`, {
                handshakeTimeout: 10 * 1000,
            });
            pythonServerConnection.onopen = (event) => {
                pythonServerAcceptsConnections = true;
                console.log(`[Runner] Now accepting connections: ${event.type}`);
                resolve();
            };
            pythonServerConnection.onerror = (event) => {
                if (event.message.includes('ECONNREFUSED')) {
                    console.log(`[Runner] Server is not yet up. Retrying...`);
                    setTimeout(tryConnect, 50);
                    return;
                }
                console.error(`[Runner] An error occurred: ${event.message} (${event.type}) {${event.error}}`);
                reject();
            };
            pythonServerConnection.onmessage = (event) => {
                if (typeof event.data !== 'string') {
                    console.log(`[Runner] Message received: (${event.type}, ${typeof event.data}) ${event.data}`);
                    return;
                }
                console.log(`[Runner] Message received: '${event.data}'`);
                const pythonServerMessage: PythonServerMessage = JSON.parse(<string>event.data);
                if (!pythonServerMessageCallbacks.has(pythonServerMessage.type)) {
                    console.warn(`[Runner] Message type '${pythonServerMessage.type}' is not handled`);
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

export interface PythonServerMessage {
    type: string;
    data: any;
}
