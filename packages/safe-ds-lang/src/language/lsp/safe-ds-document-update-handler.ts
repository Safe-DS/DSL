import { DefaultDocumentUpdateHandler, DocumentUpdateHandler as LangiumDocumentUpdateHandler } from 'langium/lsp';
import { TextDocumentChangeEvent } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SafeDsSharedServices } from '../safe-ds-module.js';
import { SafeDsLogger } from '../communication/safe-ds-messaging-provider.js';

/**
 * Safe-DS implementation of the document update handler.
 * The most important function of this class is to enable save notifications
 * by implementing the didSaveDocument method.
 */
export class SafeDsDocumentUpdateHandler extends DefaultDocumentUpdateHandler implements LangiumDocumentUpdateHandler {
    private readonly logger: SafeDsLogger;

    constructor(sharedServices: SafeDsSharedServices) {
        super(sharedServices);
        this.logger =
            sharedServices.ServiceRegistry.getSafeDsServices().communication.MessagingProvider.createTaggedLogger(
                'DocumentUpdateHandler',
            );
    }

    /**
     * This method exists primarily to enable save notifications in the language server.
     * The presence of this method signals to Langium to set save: true in the server capabilities.
     */
    didSaveDocument(event: TextDocumentChangeEvent<TextDocument>): void {
        // Just log for debugging purposes - no actual implementation needed
        this.logger.debug(`Document saved: ${event.document.uri}`);
    }
}
