import * as path from 'node:path';
import * as vscode from 'vscode';
import { Uri } from 'vscode';
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node.js';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import { ast, createSafeDsServices, getModuleMembers, messages, rpc, SafeDsServices } from '@safe-ds/lang';
import { NodeFileSystem } from 'langium/node';
import crypto from 'crypto';
import { AstUtils, LangiumDocument } from 'langium';
import { EDAPanel } from './eda/edaPanel.ts';
import { dumpDiagnostics } from './actions/dumpDiagnostics.js';
import { openDiagnosticsDumps } from './actions/openDiagnosticsDumps.js';
import { isSdsPlaceholder } from '../../../safe-ds-lang/src/language/generated/ast.js';
import { installRunner } from './actions/installRunner.js';
import { updateRunner } from './actions/updateRunner.js';
import { safeDsLogger } from './helpers/logging.js';
import { showImage } from './actions/showImage.js';

let client: LanguageClient;
let services: SafeDsServices;
let lastFinishedPipelineExecutionId: string | undefined;
let lastSuccessfulPipelineName: string | undefined;
let lastSuccessfulTableName: string | undefined;
let lastSuccessfulPipelinePath: vscode.Uri | undefined;
let lastSuccessfulPipelineNode: ast.SdsPipeline | undefined;

/**
 * This function is called when the extension is activated.
 */
export const activate = async function (context: vscode.ExtensionContext) {
    services = (
        await createSafeDsServices(NodeFileSystem, {
            logger: safeDsLogger.createTaggedLogger('Client Services'),
            userInteractionProvider: {
                showErrorMessage: vscode.window.showErrorMessage,
            },
        })
    ).SafeDs;

    client = createLanguageClient(context);

    registerNotificationListeners(context);
    registerCommands(context);

    await client.start();
};

/**
 * This function is called when the extension is deactivated.
 */
export const deactivate = async function (): Promise<void> {
    await services.runtime.PythonServer.stop();
    if (client) {
        await client.stop();
    }
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

    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*.{sds,sdsstub,sdsdev}');
    context.subscriptions.push(fileSystemWatcher);

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'safe-ds' },
            { scheme: 'file', language: 'safe-ds-stub' },
            { scheme: 'file', language: 'safe-ds-dev' },
        ],
        synchronize: {
            // Notify the server about file changes to files contained in the workspace
            fileEvents: fileSystemWatcher,
        },
        outputChannel: safeDsLogger,
    };

    // Create the language client
    return new LanguageClient('safe-ds', 'Safe-DS', serverOptions, clientOptions);
};

const registerNotificationListeners = function (context: vscode.ExtensionContext) {
    context.subscriptions.push(
        client.onNotification(rpc.InstallRunnerNotification.type, async () => {
            await installRunner(client)();
        }),
        client.onNotification(rpc.RunnerStartedNotification.type, async ({ port }: rpc.RunnerStartedParams) => {
            await services.runtime.PythonServer.connectToPort(port);
        }),
        client.onNotification(rpc.UpdateRunnerNotification.type, async () => {
            await updateRunner(context, client)();
        }),
        client.onNotification(rpc.ShowImageNotification.type, showImage(context)),
    );
};

const registerCommands = function (context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('safe-ds.dumpDiagnostics', dumpDiagnostics(context)),
        vscode.commands.registerCommand('safe-ds.exploreTable', exploreTable(context)),
        vscode.commands.registerCommand('safe-ds.installRunner', installRunner(client)),
        vscode.commands.registerCommand('safe-ds.openDiagnosticsDumps', openDiagnosticsDumps(context)),
        vscode.commands.registerCommand('safe-ds.refreshWebview', refreshWebview(context)),
        vscode.commands.registerCommand('safe-ds.updateRunner', updateRunner(context, client)),
    );
};

const refreshWebview = function (context: vscode.ExtensionContext) {
    return async () => {
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
    };
};

const doRunPipelineFile = async function (
    filePath: vscode.Uri | undefined,
    pipelineExecutionId: string,
    knownPipelineName?: string,
    placeholderNames?: string[],
) {
    const document = await getPipelineDocument(filePath);

    if (document) {
        // Run it
        let pipelineName;
        if (!knownPipelineName) {
            const firstPipeline = getModuleMembers(<ast.SdsModule>document.parseResult.value).find(ast.isSdsPipeline);
            if (firstPipeline === undefined) {
                safeDsLogger.error('Cannot execute: no pipeline found');
                vscode.window.showErrorMessage('The current file cannot be executed, as no pipeline could be found.');
                return;
            }
            pipelineName = services.builtins.Annotations.getPythonName(firstPipeline) ?? firstPipeline.name;
        } else {
            pipelineName = knownPipelineName;
        }

        safeDsLogger.info(`Launching Pipeline (${pipelineExecutionId}): ${filePath} - ${pipelineName}`);

        await services.runtime.Runner.executePipeline(pipelineExecutionId, document, pipelineName, placeholderNames);
    }
};

const exploreTable = (context: vscode.ExtensionContext) => {
    return async (documentUri: string, nodePath: string) => {
        await vscode.workspace.saveAll();

        const uri = Uri.parse(documentUri);

        const document = await getPipelineDocument(Uri.parse(documentUri));
        if (!document) {
            vscode.window.showErrorMessage('Could not find document.');
            return;
        }

        const root = document.parseResult.value;
        const placeholderNode = services.workspace.AstNodeLocator.getAstNode(root, nodePath);
        if (!isSdsPlaceholder(placeholderNode)) {
            vscode.window.showErrorMessage('Selected node is not a placeholder.');
            return;
        }

        const pipelineNode = AstUtils.getContainerOfType(placeholderNode, ast.isSdsPipeline);
        if (!pipelineNode) {
            vscode.window.showErrorMessage('Selected placeholder is not in a pipeline.');
            return;
        }

        const pipelineName = pipelineNode.name;
        const requestedPlaceholderName = placeholderNode.name;

        // gen custom id for pipeline
        const pipelineExecutionId = crypto.randomUUID();

        let loadingInProgress = true; // Flag to track loading status
        // Show progress indicator
        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Window,
                title: 'Loading Table...',
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
            safeDsLogger.info(
                `Placeholder was calculated (${message.id}): ${message.data.name} of type ${message.data.type}`,
            );
            if (message.id === pipelineExecutionId && message.data.name === requestedPlaceholderName) {
                lastFinishedPipelineExecutionId = pipelineExecutionId;
                lastSuccessfulPipelinePath = uri;
                lastSuccessfulTableName = requestedPlaceholderName;
                lastSuccessfulPipelineName = pipelineName;
                lastSuccessfulPipelineNode = pipelineNode;
                EDAPanel.createOrShow(
                    context.extensionUri,
                    context,
                    pipelineExecutionId,
                    services,
                    uri,
                    pipelineName,
                    pipelineNode,
                    message.data.name,
                );
                services.runtime.PythonServer.removeMessageCallback('placeholder_type', placeholderTypeCallback);
                cleanupLoadingIndication();
            }
        };
        services.runtime.PythonServer.addMessageCallback('placeholder_type', placeholderTypeCallback);

        const runtimeProgressCallback = function (message: messages.RuntimeProgressMessage) {
            safeDsLogger.info(`Runner-Progress (${message.id}): ${message.data}`);
            if (
                message.id === pipelineExecutionId &&
                message.data === 'done' &&
                lastFinishedPipelineExecutionId !== pipelineExecutionId
            ) {
                lastFinishedPipelineExecutionId = pipelineExecutionId;
                vscode.window.showErrorMessage(`Selected text is not a placeholder!`);
                services.runtime.PythonServer.removeMessageCallback('runtime_progress', runtimeProgressCallback);
                cleanupLoadingIndication();
            }
        };
        services.runtime.PythonServer.addMessageCallback('runtime_progress', runtimeProgressCallback);

        const runtimeErrorCallback = function (message: messages.RuntimeErrorMessage) {
            if (message.id === pipelineExecutionId && lastFinishedPipelineExecutionId !== pipelineExecutionId) {
                lastFinishedPipelineExecutionId = pipelineExecutionId;
                vscode.window.showErrorMessage(`Pipeline ran into an Error!`);
                services.runtime.PythonServer.removeMessageCallback('runtime_error', runtimeErrorCallback);
                cleanupLoadingIndication();
            }
        };
        services.runtime.PythonServer.addMessageCallback('runtime_error', runtimeErrorCallback);

        await doRunPipelineFile(uri, pipelineExecutionId, pipelineName, [requestedPlaceholderName]);
    };
};

export const getPipelineDocument = async function (
    filePath: vscode.Uri | undefined,
): Promise<LangiumDocument | undefined> {
    await vscode.workspace.saveAll();

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
    const workspaceSdsFiles = await vscode.workspace.findFiles('**/*.{sds,sdsstub,sdsdev}');
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
            safeDsLogger.error(`File ${validationInfo.validatedDocument.uri.toString()} has errors:`);
            for (const validationError of validationInfo.diagnostics) {
                safeDsLogger.error(
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
