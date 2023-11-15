import * as path from 'node:path';
import * as vscode from 'vscode';
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node.js';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import { startPythonServer, stopPythonServer, pythonServerPort, isPythonServerAvailable } from './pythonServer.js';
import { EDAPanel } from './EDAPanel.ts';

let client: LanguageClient;

// This function is called when the extension is activated.
export const activate = function (context: vscode.ExtensionContext): void {
    console.log('Starting extension...');
    client = startLanguageClient(context);
    startPythonServer();
    const registerCommandWithCheck = (commandId: string, callback: (...args: any[]) => any) => {
        return vscode.commands.registerCommand(commandId, (...args: any[]) => {
            if (!isPythonServerAvailable()) {
            vscode.window.showErrorMessage("Extension not fully started yet.");
            return;
            }
            return callback(...args);
        });
    };
    
    context.subscriptions.push(
        registerCommandWithCheck("eda-test01.runEda", () => {
            EDAPanel.createOrShow(context.extensionUri, context, undefined, pythonServerPort);
        }),
    );

    context.subscriptions.push(
        registerCommandWithCheck("eda-test01.runEdaFromTable", () => {
            const { activeTextEditor } = vscode.window;

            if (!activeTextEditor) {
            vscode.window.showErrorMessage("No ative text editor!");
            return;
            }

            const newSelectedText = activeTextEditor.document.getText(activeTextEditor.selection);

            if (newSelectedText.trim() === "") {
            vscode.window.showErrorMessage("No text selected!");
            return;
            }

            EDAPanel.createOrShow(context.extensionUri, context, newSelectedText, pythonServerPort);
        }),
    );

    context.subscriptions.push(
        registerCommandWithCheck("eda-test01.runEdaFromContext", () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
            const position = editor.selection.active;
            const range = editor.document.getWordRangeAtPosition(position);
            if (range) {
                const newSelectedText = editor.document.getText(range);
                // TODO see if word a table
                EDAPanel.createOrShow(context.extensionUri, context, newSelectedText, pythonServerPort);
            } else {
                EDAPanel.createOrShow(context.extensionUri, context, undefined, pythonServerPort);
            }
            } else {
                vscode.window.showErrorMessage("No ative text editor!");
                return;
            }
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("eda-test01.refreshWebview", () => {
            EDAPanel.kill();
            EDAPanel.createOrShow(context.extensionUri, context, "newSelectedText", pythonServerPort);
            setTimeout(() => {
                vscode.commands.executeCommand("workbench.action.webview.openDeveloperTools");
            }, 100);
        }),
    );
};

// This function is called when the extension is deactivated.
export const deactivate = function (): Thenable<void> | undefined {
    console.log('Stopping extension...')
    stopPythonServer();
    if (client) {
        return client.stop();
    }
    return undefined;
};

const startLanguageClient = function (context: vscode.ExtensionContext): LanguageClient {
    const serverModule = context.asAbsolutePath(path.join('dist', 'extension', 'mainServer.cjs'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging.
    // By setting `process.env.DEBUG_BREAK` to a truthy value, the language server will wait until a debugger is attached.
    const debugOptions = {
        execArgv: [
            '--nolazy',
            `--inspect${process.env.DEBUG_BREAK ? '-brk' : ''}=${process.env.DEBUG_SOCKET || '6009'}`,
        ],
    };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions },
    };

    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*.{sdspipe,sdsstub,sdstest}');
    context.subscriptions.push(fileSystemWatcher);

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'safe-ds' }],
        synchronize: {
            // Notify the server about file changes to files contained in the workspace
            fileEvents: fileSystemWatcher,
        },
    };

    // Create the language client and start the client.
    const result = new LanguageClient('safe-ds', 'Safe-DS', serverOptions, clientOptions);

    // Start the client. This will also launch the server
    result.start();
    return result;
};
