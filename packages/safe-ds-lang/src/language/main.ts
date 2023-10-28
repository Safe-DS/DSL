import { startLanguageServer as doStartLanguageServer } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { createSafeDsServices } from './safe-ds-module.js';

/* c8 ignore start */
export const startLanguageServer = () => {
    // Create a connection to the client
    const connection = createConnection(ProposedFeatures.all);

    // Inject the shared services and language-specific services
    // @ts-ignore
    const { shared } = createSafeDsServices({ connection, ...NodeFileSystem });

    // Start the language server with the shared services
    doStartLanguageServer(shared);
};
/* c8 ignore stop */
