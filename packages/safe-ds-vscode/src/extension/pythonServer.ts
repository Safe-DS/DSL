import child_process from 'child_process';
import vscode from 'vscode';
import net from 'net';

let pythonServer: child_process.ChildProcessWithoutNullStreams | undefined = undefined;
let pythonServerPort: number | undefined = undefined;
let pythonServerAcceptsConnections: boolean = false;
let pythonServerConnection: WebSocket | undefined = undefined;

export const startPythonServer = async function (): Promise<void> {
    pythonServerAcceptsConnections = false;
    const runnerCommand = vscode.workspace.getConfiguration('safe-ds.runner').get<string>('command')!; // Default is set
    pythonServerPort = await findFirstFreePort(5000);
    pythonServer = child_process.spawn(runnerCommand, ['--port', String(pythonServerPort)]);
    manageSubprocessOutputIO(pythonServer);
    connectToWebSocket();
};

export const stopPythonServer = function (): void {
    pythonServer?.kill();
    pythonServer = undefined;
};

export const isPythonServerAvailable = function (): boolean {
    return pythonServerAcceptsConnections;
};

const manageSubprocessOutputIO = function (process: child_process.ChildProcessWithoutNullStreams) {
    process.stdout.on('data', (data: Buffer) => {
        console.info(`[Runner-Out] ${data.toString()}`);
    });
    process.stderr.on('data', (data: Buffer) => {
        console.warn(`[Runner-Err] ${data.toString()}`);
    });
    process.on('close', (code) => {
        console.info(`[Runner] Exited: ${code}`);
    });
};

const connectToWebSocket = function () {
    // Attach WS
    pythonServerConnection = new WebSocket(`ws://127.0.0.1:${pythonServerPort}/WSRunProgram`);
    pythonServerConnection.onopen = (event) => {
        pythonServerAcceptsConnections = true;
        console.info(`[Runner] Now accepting connections: ${event}`);
    };
    pythonServerConnection.onerror = (event) => {
        console.info(`[Runner] An error occurred: ${event}`);
    };
    pythonServerConnection.onmessage = (event) => {
        console.info(`[Runner] Message received: ${event.data}`);
    };
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
