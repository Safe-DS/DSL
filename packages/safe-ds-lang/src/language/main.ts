import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { startLanguageServer as doStartLanguageServer } from './lsp/safe-ds-language-server.js';
import { createSafeDsServices } from './safe-ds-module.js';

/* c8 ignore start */
export const startLanguageServer = () => {
    // Create a connection to the client
    const connection = createConnection(ProposedFeatures.all);

    // Inject the shared services and language-specific services
    // @ts-ignore
    const { shared, SafeDs } = createSafeDsServices({ connection, ...NodeFileSystem });

    // Start the language server with the shared services
    doStartLanguageServer(shared, SafeDs);
};
/* c8 ignore stop */
