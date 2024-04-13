import * as path from 'node:path';
import * as vscode from 'vscode';
import { TextEditor, Uri } from 'vscode';
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node.js';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import { ast, createSafeDsServices, getModuleMembers, messages, rpc, SafeDsServices } from '@safe-ds/lang';
import { NodeFileSystem } from 'langium/node';
import { initializeLog, logError, logOutput, printOutputMessage } from './output.js';
import crypto from 'crypto';
import { AstUtils, LangiumDocument } from 'langium';
import { EDAPanel } from './eda/edaPanel.ts';
import { dumpDiagnostics } from './commands/dumpDiagnostics.js';
import { openDiagnosticsDumps } from './commands/openDiagnosticsDumps.js';
import { isSdsPlaceholder, SdsPipeline } from '../../../safe-ds-lang/src/language/generated/ast.js';
import { installRunner } from './commands/installRunner.js';
import { updateRunner } from './commands/updateRunner.js';

let client: LanguageClient;
let services: SafeDsServices;
let lastFinishedPipelineExecutionId: string | undefined;
let lastSuccessfulPipelineName: string | undefined;
let lastSuccessfulTableName: string | undefined;
let lastSuccessfulPipelinePath: vscode.Uri | undefined;
let lastSuccessfulPipelineNode: ast.SdsPipeline | undefined;

// This function is called when the extension is activated.
export const activate = async function (context: vscode.ExtensionContext) {
    initializeLog();
    services = (
        await createSafeDsServices(NodeFileSystem, {
            logger: {
                info: logOutput,
                error: logError,
            },
            userMessageProvider: {
                showErrorMessage: vscode.window.showErrorMessage,
            },
        })
    ).SafeDs;

    client = createLanguageClient(context);
    registerNotificationListeners(context);
    await client.start();

    registerVSCodeCommands(context);
};

const registerNotificationListeners = function (context: vscode.ExtensionContext) {
    client.onNotification(rpc.runnerInstall, async () => {
        await installRunner(context, client, services)();
    });
    client.onNotification(rpc.runnerStarted, async (port: number) => {
        await services.runtime.Runner.connectToPort(port);
    });
    client.onNotification(rpc.runnerUpdate, async () => {
        await updateRunner(context, client, services)();
    });
};

// This function is called when the extension is deactivated.
export const deactivate = async function (): Promise<void> {
    await services.runtime.Runner.stopPythonServer();
    if (client) {
        await client.stop();
    }
    return;
};

const createLanguageClient = function (context: vscode.ExtensionContext): LanguageClient {
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
        outputChannel: vscode.window.createOutputChannel('Safe-DS Language Client', 'log'),
    };

    // Create the language client
    return new LanguageClient('safe-ds', 'Safe-DS', serverOptions, clientOptions);
};

const registerVSCodeCommands = function (context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('safe-ds.dumpDiagnostics', dumpDiagnostics(context)));
    context.subscriptions.push(
        vscode.commands.registerCommand('safe-ds.installRunner', installRunner(context, client, services)),
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('safe-ds.openDiagnosticsDumps', openDiagnosticsDumps(context)),
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('safe-ds.updateRunner', updateRunner(context, client, services)),
    );

    context.subscriptions.push(vscode.commands.registerCommand('safe-ds.runPipelineFile', commandRunPipelineFile));
    context.subscriptions.push(
        vscode.commands.registerCommand('safe-ds.runEda', async (documentUri: string, nodePath: string) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active text editor.');
                return;
            }

            const document = await getPipelineDocument(Uri.parse(documentUri));
            if (!document) {
                vscode.window.showErrorMessage('Internal error.');
                return;
            }

            const root = document.parseResult.value;
            const node = services.workspace.AstNodeLocator.getAstNode(root, nodePath);
            if (!isSdsPlaceholder(node)) {
                vscode.window.showErrorMessage('Selected node is not a placeholder.');
                return;
            }

            const pipelineNode = AstUtils.getContainerOfType(node, ast.isSdsPipeline);
            if (!pipelineNode) {
                vscode.window.showErrorMessage('Selected placeholder is not in a pipeline.');
                return;
            }

            runEda(editor, context, pipelineNode, pipelineNode.name, node.name);
        }),
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('safe-ds.refreshWebview', () => {
            if (
                !lastSuccessfulPipelinePath ||
                !lastFinishedPipelineExecutionId ||
                !lastSuccessfulPipelineName ||
                !lastSuccessfulTableName ||
                !lastSuccessfulPipelineNode
            ) {
                vscode.window.showErrorMessage('No EDA Panel to refresh!');
                return;
            }
            EDAPanel.kill(lastSuccessfulPipelineName! + '.' + lastSuccessfulTableName!);
            setTimeout(() => {
                EDAPanel.createOrShow(
                    context.extensionUri,
                    context,
                    lastFinishedPipelineExecutionId!,
                    services,
                    lastSuccessfulPipelinePath!,
                    lastSuccessfulPipelineName!,
                    lastSuccessfulPipelineNode!,
                    lastSuccessfulTableName!,
                );
            }, 100);
            setTimeout(() => {
                vscode.commands.executeCommand('workbench.action.webview.openDeveloperTools');
            }, 100);
        }),
    );
};

const runPipelineFile = async function (
    filePath: vscode.Uri | undefined,
    pipelineExecutionId: string,
    knownPipelineName?: string,
    placeholderName?: string,
) {
    const document = await getPipelineDocument(filePath);

    if (document) {
        // Run it
        let pipelineName;
        if (!knownPipelineName) {
            const firstPipeline = getModuleMembers(<ast.SdsModule>document.parseResult.value).find(ast.isSdsPipeline);
            if (firstPipeline === undefined) {
                logError('Cannot execute: no pipeline found');
                vscode.window.showErrorMessage('The current file cannot be executed, as no pipeline could be found.');
                return;
            }
            pipelineName = services.builtins.Annotations.getPythonName(firstPipeline) || firstPipeline.name;
        } else {
            pipelineName = knownPipelineName;
        }

        printOutputMessage(`Launching Pipeline (${pipelineExecutionId}): ${filePath} - ${pipelineName}`);

        await services.runtime.Runner.executePipeline(pipelineExecutionId, document, pipelineName, placeholderName);
    }
};

const runEda = function (
    editor: TextEditor,
    context: vscode.ExtensionContext,
    pipelineNode: SdsPipeline,
    pipelineName: string,
    requestedPlaceholderName: string,
) {
    // gen custom id for pipeline
    const pipelineExecutionId = crypto.randomUUID();

    let loadingInProgress = true; // Flag to track loading status
    // Show progress indicator
    vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Loading Table ...',
        },
        (progress, _) => {
            progress.report({ increment: 0 });
            return new Promise<void>((resolve) => {
                // Resolve the promise when loading is no longer in progress
                const checkInterval = setInterval(() => {
                    if (!loadingInProgress) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 1000); // Check every second
            });
        },
    );
    const cleanupLoadingIndication = () => {
        loadingInProgress = false;
    };

    const placeholderTypeCallback = function (message: messages.PlaceholderTypeMessage) {
        printOutputMessage(
            `Placeholder was calculated (${message.id}): ${message.data.name} of type ${message.data.type}`,
        );
        if (
            message.id === pipelineExecutionId &&
            // Can be removed altogether if the EDA tool is only triggered via code lenses
            (message.data.type === 'Table' ||
                message.data.type === 'TaggedTable' ||
                message.data.type === 'TimeSeries') &&
            message.data.name === requestedPlaceholderName
        ) {
            lastFinishedPipelineExecutionId = pipelineExecutionId;
            lastSuccessfulPipelinePath = editor.document.uri;
            lastSuccessfulTableName = requestedPlaceholderName;
            lastSuccessfulPipelineName = pipelineName;
            lastSuccessfulPipelineNode = pipelineNode;
            EDAPanel.createOrShow(
                context.extensionUri,
                context,
                pipelineExecutionId,
                services,
                editor.document.uri,
                pipelineName,
                pipelineNode,
                message.data.name,
            );
            services.runtime.Runner.removeMessageCallback(placeholderTypeCallback, 'placeholder_type');
            cleanupLoadingIndication();
        } else if (message.id === pipelineExecutionId && message.data.name !== requestedPlaceholderName) {
            return;
        } else if (message.id === pipelineExecutionId) {
            lastFinishedPipelineExecutionId = pipelineExecutionId;
            vscode.window.showErrorMessage(`Selected placeholder is not of type 'Table'.`);
            services.runtime.Runner.removeMessageCallback(placeholderTypeCallback, 'placeholder_type');
            cleanupLoadingIndication();
        }
    };
    services.runtime.Runner.addMessageCallback(placeholderTypeCallback, 'placeholder_type');

    const runtimeProgressCallback = function (message: messages.RuntimeProgressMessage) {
        printOutputMessage(`Runner-Progress (${message.id}): ${message.data}`);
        if (
            message.id === pipelineExecutionId &&
            message.data === 'done' &&
            lastFinishedPipelineExecutionId !== pipelineExecutionId
        ) {
            lastFinishedPipelineExecutionId = pipelineExecutionId;
            vscode.window.showErrorMessage(`Selected text is not a placeholder!`);
            services.runtime.Runner.removeMessageCallback(runtimeProgressCallback, 'runtime_progress');
            cleanupLoadingIndication();
        }
    };
    services.runtime.Runner.addMessageCallback(runtimeProgressCallback, 'runtime_progress');

    const runtimeErrorCallback = function (message: messages.RuntimeErrorMessage) {
        if (message.id === pipelineExecutionId && lastFinishedPipelineExecutionId !== pipelineExecutionId) {
            lastFinishedPipelineExecutionId = pipelineExecutionId;
            vscode.window.showErrorMessage(`Pipeline ran into an Error!`);
            services.runtime.Runner.removeMessageCallback(runtimeErrorCallback, 'runtime_error');
            cleanupLoadingIndication();
        }
    };
    services.runtime.Runner.addMessageCallback(runtimeErrorCallback, 'runtime_error');

    runPipelineFile(editor.document.uri, pipelineExecutionId, pipelineName, requestedPlaceholderName);
};

export const getPipelineDocument = async function (
    filePath: vscode.Uri | undefined,
): Promise<LangiumDocument | undefined> {
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
    const unvalidatedSdsDocuments = await Promise.all(
        workspaceSdsFiles.map((newDocumentUri) =>
            services.shared.workspace.LangiumDocuments.getOrCreateDocument(newDocumentUri),
        ),
    );
    // Validate them
    const validationErrorMessage = await validateDocuments(services, unvalidatedSdsDocuments);
    if (validationErrorMessage) {
        vscode.window.showErrorMessage(validationErrorMessage);
        return;
    }

    let mainDocument;
    if (!services.shared.workspace.LangiumDocuments.hasDocument(pipelinePath)) {
        mainDocument = await services.shared.workspace.LangiumDocuments.getOrCreateDocument(pipelinePath);
        const mainDocumentValidationErrorMessage = await validateDocuments(services, [mainDocument]);
        if (mainDocumentValidationErrorMessage) {
            vscode.window.showErrorMessage(mainDocumentValidationErrorMessage);
            return;
        }
    } else {
        mainDocument = await services.shared.workspace.LangiumDocuments.getOrCreateDocument(pipelinePath);
    }

    return mainDocument;
};

const commandRunPipelineFile = async function (filePath: vscode.Uri | undefined) {
    await vscode.workspace.saveAll();
    await runPipelineFile(filePath, crypto.randomUUID());
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
        return 'Cannot run the main pipeline, because some files have errors.';
    }
    return undefined;
};
