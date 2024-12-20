import * as path from 'node:path';
import * as vscode from 'vscode';
import { Uri } from 'vscode';
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node.js';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node.js';
import { ast, createSafeDsServices, rpc, SafeDsServices } from '@safe-ds/lang';
import { NodeFileSystem } from 'langium/node';
import { LangiumDocument } from 'langium';
import { EDAPanel } from './eda/edaPanel.ts';
import { dumpDiagnostics } from './actions/dumpDiagnostics.js';
import { openDiagnosticsDumps } from './actions/openDiagnosticsDumps.js';
import { installRunner } from './actions/installRunner.js';
import { updateRunner } from './actions/updateRunner.js';
import { safeDsLogger } from './helpers/logging.js';
import { showImage } from './actions/showImage.js';
import { SafeDSCustomEditorProvider } from './custom-editor/customEditorProvider.ts';

let client: LanguageClient;
let services: SafeDsServices;

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

    SafeDSCustomEditorProvider.registerProvider(context, client);
    SafeDSCustomEditorProvider.registerCommands(context);

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
        client.onNotification(rpc.ExploreTableNotification.type, exploreTable(context)),
        client.onNotification(rpc.ShowImageNotification.type, showImage(context)),
    );
};

const registerCommands = function (context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('safe-ds.dumpDiagnostics', dumpDiagnostics(context)),
        vscode.commands.registerCommand('safe-ds.installRunner', installRunner(client)),
        vscode.commands.registerCommand('safe-ds.openDiagnosticsDumps', openDiagnosticsDumps(context)),
        vscode.commands.registerCommand('safe-ds.updateRunner', updateRunner(context, client)),
    );
};

const exploreTable = (context: vscode.ExtensionContext) => {
    return async (data: rpc.ExploreTableNotification) => {
        await EDAPanel.createOrShow(
            context.extensionUri,
            context,
            data.pipelineExecutionId,
            services,
            Uri.parse(data.uri),
            data.pipelineName,
            data.pipelineNodeEndOffset,
            data.placeholderName,
        );
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
                    (<ast.SdsModule>document.parseResult.value).name.startsWith('safeds')
                ),
        )
        .forEach((oldDocument) => {
            services.shared.workspace.LangiumDocuments.deleteDocument(oldDocument.uri);
        });

    // TODO: Needs a more robust way for validation. Only files that are used by the main file should be validated.
    //  For now, we are better off disabling this check, since users cannot run pipelines if any file in their workspace
    //  has an error.
    // const workspaceSdsFiles = await vscode.workspace.findFiles('**/*.{sds,sdsstub,sdsdev}');
    // // Load all documents
    // const unvalidatedSdsDocuments = await Promise.all(
    //     workspaceSdsFiles.map((newDocumentUri) =>
    //         services.shared.workspace.LangiumDocuments.getOrCreateDocument(newDocumentUri),
    //     ),
    // );
    // // Validate them
    // const validationErrorMessage = await validateDocuments(services, unvalidatedSdsDocuments);
    // if (validationErrorMessage) {
    //     vscode.window.showErrorMessage(validationErrorMessage);
    //     return;
    // }

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
