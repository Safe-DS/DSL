/*
 * This file can be removed, once Langium supports the TypeHierarchyProvider directly.
 */

/* c8 ignore start */
import type { LangiumServices, LangiumSharedServices } from 'langium';
import {
    addCallHierarchyHandler,
    addCodeActionHandler,
    addCodeLensHandler,
    addCompletionHandler,
    addConfigurationChangeHandler,
    addDiagnosticsHandler,
    addDocumentHighlightsHandler,
    addDocumentLinkHandler,
    addDocumentsHandler,
    addDocumentSymbolHandler,
    addExecuteCommandHandler,
    addFindReferencesHandler,
    addFoldingRangeHandler,
    addFormattingHandler,
    addGoToDeclarationHandler,
    addGotoDefinitionHandler,
    addGoToImplementationHandler,
    addGoToTypeDefinitionHandler,
    addHoverHandler,
    addInlayHintHandler,
    addRenameHandler,
    addSemanticTokenHandler,
    addSignatureHelpHandler,
    addWorkspaceSymbolHandler,
    createServerRequestHandler,
    DefaultLanguageServer,
    isOperationCancelled,
    URI,
} from 'langium';
import {
    type CancellationToken,
    type Connection,
    type HandlerResult,
    type InitializeParams,
    type InitializeResult,
    LSPErrorCodes,
    ResponseError,
    type ServerRequestHandler,
    type TypeHierarchySubtypesParams,
    type TypeHierarchySupertypesParams,
} from 'vscode-languageserver';
import { TypeHierarchyProvider } from './safe-ds-type-hierarchy-provider.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { addDiagramHandler } from '../custom-editor/safe-ds-custom-editor-provider.js';

interface LangiumAddedServices {
    lsp: {
        TypeHierarchyProvider?: TypeHierarchyProvider;
    };
}

export class SafeDsLanguageServer extends DefaultLanguageServer {
    protected override hasService(
        callback: (language: LangiumServices & LangiumAddedServices) => object | undefined,
    ): boolean {
        return this.services.ServiceRegistry.all.some((language) => callback(language) !== undefined);
    }

    protected override buildInitializeResult(params: InitializeParams): InitializeResult {
        const hasTypeHierarchyProvider = this.hasService((e) => e.lsp.TypeHierarchyProvider);
        const otherCapabilities = super.buildInitializeResult(params).capabilities;

        return {
            capabilities: {
                ...otherCapabilities,
                typeHierarchyProvider: hasTypeHierarchyProvider ? {} : undefined,
            },
        };
    }
}

export const startLanguageServer = (sharedServices: LangiumSharedServices, safeDsServices: SafeDsServices): void => {
    const connection = sharedServices.lsp.Connection;
    if (!connection) {
        throw new Error('Starting a language server requires the languageServer.Connection service to be set.');
    }

    addDocumentsHandler(connection, sharedServices);
    addDiagnosticsHandler(connection, sharedServices);
    addCompletionHandler(connection, sharedServices);
    addFindReferencesHandler(connection, sharedServices);
    addDocumentSymbolHandler(connection, sharedServices);
    addGotoDefinitionHandler(connection, sharedServices);
    addGoToTypeDefinitionHandler(connection, sharedServices);
    addGoToImplementationHandler(connection, sharedServices);
    addDocumentHighlightsHandler(connection, sharedServices);
    addFoldingRangeHandler(connection, sharedServices);
    addFormattingHandler(connection, sharedServices);
    addCodeActionHandler(connection, sharedServices);
    addRenameHandler(connection, sharedServices);
    addHoverHandler(connection, sharedServices);
    addInlayHintHandler(connection, sharedServices);
    addSemanticTokenHandler(connection, sharedServices);
    addExecuteCommandHandler(connection, sharedServices);
    addSignatureHelpHandler(connection, sharedServices);
    addCallHierarchyHandler(connection, sharedServices);
    addTypeHierarchyHandler(connection, sharedServices);
    addCodeLensHandler(connection, sharedServices);
    addDocumentLinkHandler(connection, sharedServices);
    addConfigurationChangeHandler(connection, sharedServices);
    addGoToDeclarationHandler(connection, sharedServices);
    addWorkspaceSymbolHandler(connection, sharedServices);

    addDiagramHandler(connection, sharedServices, safeDsServices);

    connection.onInitialize((params) => {
        return sharedServices.lsp.LanguageServer.initialize(params);
    });
    connection.onInitialized((params) => {
        return sharedServices.lsp.LanguageServer.initialized(params);
    });

    // Make the text document manager listen on the connection for open, change and close text document events.
    const documents = sharedServices.workspace.TextDocuments;
    documents.listen(connection);

    // Start listening for incoming messages from the client.
    connection.listen();
};

export const addTypeHierarchyHandler = function (connection: Connection, sharedServices: LangiumSharedServices): void {
    connection.languages.typeHierarchy.onPrepare(
        createServerRequestHandler((services, document, params, cancelToken) => {
            const typeHierarchyProvider = (<LangiumServices & LangiumAddedServices>services).lsp.TypeHierarchyProvider;
            if (typeHierarchyProvider) {
                return typeHierarchyProvider.prepareTypeHierarchy(document, params, cancelToken) ?? null;
            }
            return null;
        }, sharedServices),
    );

    connection.languages.typeHierarchy.onSupertypes(
        createTypeHierarchyRequestHandler((services, params, cancelToken) => {
            const typeHierarchyProvider = (<LangiumServices & LangiumAddedServices>services).lsp.TypeHierarchyProvider;
            if (typeHierarchyProvider) {
                return typeHierarchyProvider.supertypes(params, cancelToken) ?? null;
            }
            return null;
        }, sharedServices),
    );

    connection.languages.typeHierarchy.onSubtypes(
        createTypeHierarchyRequestHandler((services, params, cancelToken) => {
            const typeHierarchyProvider = (<LangiumServices & LangiumAddedServices>services).lsp.TypeHierarchyProvider;
            if (typeHierarchyProvider) {
                return typeHierarchyProvider.subtypes(params, cancelToken) ?? null;
            }
            return null;
        }, sharedServices),
    );
};

export const createTypeHierarchyRequestHandler = function <
    P extends TypeHierarchySupertypesParams | TypeHierarchySubtypesParams,
    R,
    PR,
    E = void,
>(
    serviceCall: (services: LangiumServices, params: P, cancelToken: CancellationToken) => HandlerResult<R, E>,
    sharedServices: LangiumSharedServices,
): ServerRequestHandler<P, R, PR, E> {
    const serviceRegistry = sharedServices.ServiceRegistry;
    return async (params: P, cancelToken: CancellationToken) => {
        const uri = URI.parse(params.item.uri);
        const language = serviceRegistry.getServices(uri);
        if (!language) {
            const message = `Could not find service instance for uri: '${uri.toString()}'`;
            // eslint-disable-next-line no-console
            console.error(message);
            throw new Error(message);
        }
        try {
            // eslint-disable-next-line @typescript-eslint/return-await
            return await serviceCall(language, params, cancelToken);
        } catch (err) {
            return responseError<E>(err);
        }
    };
};

const responseError = function <E = void>(err: unknown): ResponseError<E> {
    if (isOperationCancelled(err)) {
        return new ResponseError(LSPErrorCodes.RequestCancelled, 'The request has been cancelled.');
    }
    if (err instanceof ResponseError) {
        return err;
    }
    throw err;
};
/* c8 ignore stop */
