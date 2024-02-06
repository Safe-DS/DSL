import * as path from 'node:path';
import * as vscode from 'vscode';
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node.js';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import { ast, createSafeDsServicesWithBuiltins, SafeDsServices, messages } from '@safe-ds/lang';
import { NodeFileSystem } from 'langium/node';
import { getSafeDSOutputChannel, initializeLog, logError, logOutput, printOutputMessage } from './output.js';
import crypto from 'crypto';
import { LangiumDocument, URI } from 'langium';

let client: LanguageClient;
let services: SafeDsServices;

// This function is called when the extension is activated.
export const activate = async function (context: vscode.ExtensionContext) {
    initializeLog();
    client = startLanguageClient(context);
    const runnerCommandSetting = vscode.workspace.getConfiguration('safe-ds.runner').get<string>('command')!; // Default is set
    services = (await createSafeDsServicesWithBuiltins(NodeFileSystem, {runnerCommand: runnerCommandSetting})).SafeDs;
    services.runtime.Runner.updateRunnerLogging({
        displayError(value: string): void {
            vscode.window.showErrorMessage(value);
        },
        outputError(value: string): void {
            logError(value);
        },
        outputInfo(value: string): void {
            logOutput(value);
        },
    });
    await services.runtime.Runner.startPythonServer();
    acceptRunRequests(context);
};

// This function is called when the extension is deactivated.
export const deactivate = async function (): Promise<void> {
    await services.runtime.Runner.stopPythonServer();
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
    registerMessageLoggingCallbacks();
    // Register VS Code Entry Points
    registerVSCodeCommands(context);
    // Register watchers
    registerVSCodeWatchers();
};

const registerMessageLoggingCallbacks = function () {
    services.runtime.Runner.addMessageCallback((message) => {
        printOutputMessage(
            `Placeholder value is (${message.id}): ${message.data.name} of type ${message.data.type} = ${message.data.value}`,
        );
    }, 'placeholder_value');
    services.runtime.Runner.addMessageCallback((message) => {
        printOutputMessage(
            `Placeholder was calculated (${message.id}): ${message.data.name} of type ${message.data.type}`,
        );
        const execInfo = services.runtime.Runner.getExecutionContext(message.id)!;
        execInfo.calculatedPlaceholders.set(message.data.name, message.data.type);
        services.runtime.Runner.sendMessageToPythonServer(
            messages.createPlaceholderQueryMessage(message.id, message.data.name),
        );
    }, 'placeholder_type');
    services.runtime.Runner.addMessageCallback((message) => {
        printOutputMessage(`Runner-Progress (${message.id}): ${message.data}`);
    }, 'runtime_progress');
    services.runtime.Runner.addMessageCallback(async (message) => {
        let readableStacktraceSafeDs: string[] = [];
        const execInfo = services.runtime.Runner.getExecutionContext(message.id)!;
        const readableStacktracePython = await Promise.all(
            (<messages.RuntimeErrorMessage>message).data.backtrace.map(async (frame) => {
                const mappedFrame = await services.runtime.Runner.tryMapToSafeDSSource(message.id, frame);
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
                (<messages.RuntimeErrorMessage>message).data.message
            } \n${readableStacktracePython.join('\n')}`,
        );
        printOutputMessage(
            `Safe-DS Error (${message.id}): ${(<messages.RuntimeErrorMessage>message).data.message} \n${readableStacktraceSafeDs
                .reverse()
                .join('\n')}`,
        );
    }, 'runtime_error');
};

const registerVSCodeCommands = function (context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.safe-ds.runPipelineFile', commandRunPipelineFile),
    );
};

const commandRunPipelineFile = async function (filePath: vscode.Uri | undefined) {
    let pipelinePath = filePath;
    // Allow execution via command menu
    if (!pipelinePath && vscode.window.activeTextEditor) {
        pipelinePath = vscode.window.activeTextEditor.document.uri;
    }
    if (
        pipelinePath &&
        !services.LanguageMetaData.fileExtensions.some((extension: string) => pipelinePath!.fsPath.endsWith(extension))
    ) {
        vscode.window.showErrorMessage(`Could not run ${pipelinePath!.fsPath} as it is not a Safe-DS file`);
        return;
    }
    if (!pipelinePath) {
        vscode.window.showErrorMessage('Could not run Safe-DS Pipeline, as no pipeline is currently selected.');
        return;
    }
    // Refresh workspace
    // Do not delete builtins
    services.shared.workspace.LangiumDocuments.all
        .filter(
            (document) =>
                !(
                    ast.isSdsModule(document.parseResult.value) &&
                    (<ast.SdsModule>document.parseResult.value).name === 'safeds.lang'
                ),
        )
        .forEach((oldDocument) => {
            services.shared.workspace.LangiumDocuments.deleteDocument(oldDocument.uri);
        });
    const workspaceSdsFiles = await vscode.workspace.findFiles('**/*.{sdspipe,sdsstub,sdstest}');
    // Load all documents
    const unvalidatedSdsDocuments = workspaceSdsFiles.map((newDocumentUri) =>
        services.shared.workspace.LangiumDocuments.getOrCreateDocument(newDocumentUri),
    );
    // Validate them
    const validationErrorMessage = await validateDocuments(services, unvalidatedSdsDocuments);
    if (validationErrorMessage) {
        vscode.window.showErrorMessage(validationErrorMessage);
        return;
    }
    // Run it
    const pipelineId = crypto.randomUUID();
    printOutputMessage(`Launching Pipeline (${pipelineId}): ${pipelinePath}`);
    let mainDocument;
    if (!services.shared.workspace.LangiumDocuments.hasDocument(pipelinePath)) {
        mainDocument = services.shared.workspace.LangiumDocuments.getOrCreateDocument(pipelinePath);
        const mainDocumentValidationErrorMessage = await validateDocuments(services, [mainDocument]);
        if (mainDocumentValidationErrorMessage) {
            vscode.window.showErrorMessage(mainDocumentValidationErrorMessage);
            return;
        }
    } else {
        mainDocument = services.shared.workspace.LangiumDocuments.getOrCreateDocument(pipelinePath);
    }
    await services.runtime.Runner.executePipeline(mainDocument, pipelineId);
};

const validateDocuments = async function (
    sdsServices: SafeDsServices,
    documents: LangiumDocument[],
): Promise<undefined | string> {
    await sdsServices.shared.workspace.DocumentBuilder.build(documents, { validation: true });

    const errors = documents.flatMap((validatedDocument) => {
        const validationInfo = {
            validatedDocument,
            diagnostics: (validatedDocument.diagnostics ?? []).filter((e) => e.severity === 1),
        };
        return validationInfo.diagnostics.length > 0 ? [validationInfo] : [];
    });

    if (errors.length > 0) {
        for (const validationInfo of errors) {
            logError(`File ${validationInfo.validatedDocument.uri.toString()} has errors:`);
            for (const validationError of validationInfo.diagnostics) {
                logError(
                    `\tat line ${validationError.range.start.line + 1}: ${
                        validationError.message
                    } [${validationInfo.validatedDocument.textDocument.getText(validationError.range)}]`,
                );
            }
        }
        return `As file(s) ${errors
            .map((validationInfo) => validationInfo.validatedDocument.uri.toString())
            .join(', ')} has errors, the main pipeline cannot be run.`;
    }
    return undefined;
};

const registerVSCodeWatchers = function () {
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('safe-ds.runner.command')) {
            // Try starting runner
            logOutput('Safe-DS Runner Command was updated');
            if (!services.runtime.Runner.isPythonServerAvailable()) {
                services.runtime.Runner.startPythonServer();
            } else {
                logOutput(
                    'As the Safe-DS Runner is currently successfully running, no attempt to start it will be made',
                );
            }
        }
    });
};
