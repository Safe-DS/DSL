/*
 * This file can be removed, once Langium supports the TypeHierarchyProvider directly.
 */

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

export const startLanguageServer = (services: LangiumSharedServices): void => {
    const connection = services.lsp.Connection;
    if (!connection) {
        throw new Error('Starting a language server requires the languageServer.Connection service to be set.');
    }

    addDocumentsHandler(connection, services);
    addDiagnosticsHandler(connection, services);
    addCompletionHandler(connection, services);
    addFindReferencesHandler(connection, services);
    addDocumentSymbolHandler(connection, services);
    addGotoDefinitionHandler(connection, services);
    addGoToTypeDefinitionHandler(connection, services);
    addGoToImplementationHandler(connection, services);
    addDocumentHighlightsHandler(connection, services);
    addFoldingRangeHandler(connection, services);
    addFormattingHandler(connection, services);
    addCodeActionHandler(connection, services);
    addRenameHandler(connection, services);
    addHoverHandler(connection, services);
    addInlayHintHandler(connection, services);
    addSemanticTokenHandler(connection, services);
    addExecuteCommandHandler(connection, services);
    addSignatureHelpHandler(connection, services);
    addCallHierarchyHandler(connection, services);
    addTypeHierarchyHandler(connection, services);
    addCodeLensHandler(connection, services);
    addDocumentLinkHandler(connection, services);
    addConfigurationChangeHandler(connection, services);
    addGoToDeclarationHandler(connection, services);
    addWorkspaceSymbolHandler(connection, services);

    connection.onInitialize((params) => {
        return services.lsp.LanguageServer.initialize(params);
    });
    connection.onInitialized((params) => {
        return services.lsp.LanguageServer.initialized(params);
    });

    // Make the text document manager listen on the connection for open, change and close text document events.
    const documents = services.workspace.TextDocuments;
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
