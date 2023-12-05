import * as path from 'node:path';
import * as vscode from 'vscode';
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node.js';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import {
    addMessageCallback,
    executePipeline,
    getExecutionContext,
    isPythonServerAvailable,
    sendMessageToPythonServer,
    startPythonServer,
    stopPythonServer,
    tryMapToSafeDSSource,
} from './pythonServer.js';
import { createSafeDsServicesWithBuiltins, SAFE_DS_FILE_EXTENSIONS, SafeDsServices } from '@safe-ds/lang';
import { NodeFileSystem } from 'langium/node';
import { getSafeDSOutputChannel, initializeLog, logOutput, printOutputMessage } from './output.js';
import { createPlaceholderQueryMessage, RuntimeErrorMessage } from './messages.js';
import crypto from 'crypto';
import { URI } from 'langium';

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
};

// This function is called when the extension is deactivated.
export const deactivate = async function (): Promise<void> {
    await stopPythonServer();
    if (client) {
        await client.stop();
    }
    return;
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
    // Register logging message callbacks
    addMessageCallback((message) => {
        printOutputMessage(
            `Placeholder value is (${message.id}): ${message.data.name} of type ${message.data.type} = ${message.data.value}`,
        );
    }, 'placeholder_value');
    addMessageCallback((message) => {
        printOutputMessage(
            `Placeholder was calculated (${message.id}): ${message.data.name} of type ${message.data.type}`,
        );
        const execInfo = getExecutionContext(message.id)!;
        execInfo.calculatedPlaceholders.set(message.data.name, message.data.type);
        sendMessageToPythonServer(createPlaceholderQueryMessage(message.id, message.data.name));
    }, 'placeholder_type');
    addMessageCallback((message) => {
        printOutputMessage(`Runner-Progress (${message.id}): ${message.data}`);
    }, 'runtime_progress');
    addMessageCallback(async (message) => {
        let readableStacktraceSafeDs: string[] = [];
        const execInfo = getExecutionContext(message.id)!;
        const readableStacktracePython = await Promise.all(
            (<RuntimeErrorMessage>message).data.backtrace.map(async (frame) => {
                const mappedFrame = await tryMapToSafeDSSource(message.id, frame);
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
        logOutput(
            `Runner-RuntimeError (${message.id}): ${
                (<RuntimeErrorMessage>message).data.message
            } \n${readableStacktracePython.join('\n')}`,
        );
        printOutputMessage(
            `Safe-DS Error (${message.id}): ${(<RuntimeErrorMessage>message).data.message} \n${readableStacktraceSafeDs
                .reverse()
                .join('\n')}`,
        );
    }, 'runtime_error');
    // Register VS Code Entry Points
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
            const pipelineId = crypto.randomUUID();
            printOutputMessage(`Launching Pipeline (${pipelineId}): ${pipelinePath}`);
            executePipeline(sdsServices, pipelinePath.fsPath, pipelineId);
        }),
    );
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('safe-ds.runner.command')) {
            // Try starting runner
            logOutput('Safe-DS Runner Command was updated');
            if (!isPythonServerAvailable()) {
                startPythonServer();
            } else {
                logOutput(
                    'As the Safe-DS Runner is currently successfully running, no attempt to start it will be made',
                );
            }
        }
    });
};
