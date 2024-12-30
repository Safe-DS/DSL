import { NodeFileSystem } from 'langium/node';
import { startLanguageServer as doStartLanguageServer } from 'langium/lsp';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { createSafeDsServices } from './safe-ds-module.js';
import { addDiagramHandler } from './custom-editor/safe-ds-custom-editor-provider.js';

/* c8 ignore start */
export const startLanguageServer = async () => {
    // Create a connection to the client
    const connection = createConnection(ProposedFeatures.all);

    // Inject the shared services and language-specific services
    const { shared, SafeDs } = await createSafeDsServices({ connection, ...NodeFileSystem });

    // Start the language server with the shared services
    doStartLanguageServer(shared);
    addDiagramHandler(connection, shared, SafeDs);
};
/* c8 ignore stop */
