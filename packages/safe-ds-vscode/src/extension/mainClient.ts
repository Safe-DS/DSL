import * as path from 'node:path';
import * as vscode from 'vscode';
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node.js';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import {
    addMessageCallback,
    executePipeline,
    startPythonServer,
    stopPythonServer,
    tryMapToSafeDSSource,
    isPythonServerAvailable,
    pythonServerPort
} from './pythonServer.js';
import { createSafeDsServicesWithBuiltins, SAFE_DS_FILE_EXTENSIONS, SafeDsServices } from '@safe-ds/lang';
import { NodeFileSystem } from 'langium/node';
import { getSafeDSOutputChannel, initializeLog, logOutput, printOutputMessage } from './output.js';
import { RuntimeErrorMessage } from './messages.js';
import { EDAPanel } from './EDAPanel.ts';

let client: LanguageClient;
let sdsServices: SafeDsServices;

// This function is called when the extension is activated.
export const activate = function (context: vscode.ExtensionContext): void {
    initializeLog();
    client = startLanguageClient(context);
    startPythonServer();
    createSafeDsServicesWithBuiltins(NodeFileSystem).then((services) => {
        sdsServices = services.SafeDs;
        acceptRunRequests(context);
    });
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

            const newtableIdentifier = activeTextEditor.document.getText(activeTextEditor.selection);

            if (newtableIdentifier.trim() === "") {
            vscode.window.showErrorMessage("No text selected!");
            return;
            }

            EDAPanel.createOrShow(context.extensionUri, context, newtableIdentifier, pythonServerPort);
        }),
    );

    context.subscriptions.push(
        registerCommandWithCheck("eda-test01.runEdaFromContext", () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
            const position = editor.selection.active;
            const range = editor.document.getWordRangeAtPosition(position);
            if (range) {
                const newtableIdentifier = editor.document.getText(range);
                // TODO see if word a table
                EDAPanel.createOrShow(context.extensionUri, context, newtableIdentifier, pythonServerPort);
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
            setTimeout(() => {
                EDAPanel.createOrShow(context.extensionUri, context, "newtableIdentifier", pythonServerPort);
            }, 100);
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
        outputChannel: getSafeDSOutputChannel('[LanguageClient] '),
    };

    // Create the language client and start the client.
    const result = new LanguageClient('safe-ds', 'Safe-DS', serverOptions, clientOptions);

    // Start the client. This will also launch the server
    result.start();
    return result;
};

const acceptRunRequests = function (context: vscode.ExtensionContext) {
    addMessageCallback((message) => {
        printOutputMessage(`Runner-Progress: ${message.data}`);
    }, 'progress');
    addMessageCallback(async (message) => {
        let readableStacktraceSafeDs: string[] = [];
        const readableStacktracePython = await Promise.all(
            (<RuntimeErrorMessage>message).data.backtrace.map(async (frame) => {
                const mappedFrame = await tryMapToSafeDSSource(frame);
                if (mappedFrame) {
                    readableStacktraceSafeDs.push(`\tat ${mappedFrame.file} line ${mappedFrame.line}`);
                    return `\tat ${frame.file} line ${frame.line} (mapped to '${mappedFrame.file}' line ${mappedFrame.line})`;
                }
                return `\tat ${frame.file} line ${frame.line}`;
            }),
        );
        logOutput(
            `Runner-RuntimeError: ${(<RuntimeErrorMessage>message).data.message} \n${readableStacktracePython.join(
                '\n',
            )}`,
        );
        printOutputMessage(
            `Safe-DS Error: ${(<RuntimeErrorMessage>message).data.message} \n${readableStacktraceSafeDs.join('\n')}`,
        );
    }, 'runtime_error');
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.safe-ds.runPipelineFile', (filePath: vscode.Uri | undefined) => {
            let pipelinePath = filePath;
            // Allow execution via command menu
            if (!pipelinePath && vscode.window.activeTextEditor) {
                pipelinePath = vscode.window.activeTextEditor.document.uri;
            }
            if (
                pipelinePath &&
                !SAFE_DS_FILE_EXTENSIONS.some((extension: string) => pipelinePath!.fsPath.endsWith(extension))
            ) {
                vscode.window.showErrorMessage(`Could not run ${pipelinePath!.fsPath} as it is not a Safe-DS file`);
                return;
            }
            if (!pipelinePath) {
                vscode.window.showErrorMessage('Could not run Safe-DS Pipeline, as no pipeline is currently selected.');
                return;
            }
            printOutputMessage(`Launching Pipeline: ${pipelinePath}`);
            executePipeline(sdsServices, pipelinePath.fsPath, 'abc'); // TODO change id
        }),
    );
};
