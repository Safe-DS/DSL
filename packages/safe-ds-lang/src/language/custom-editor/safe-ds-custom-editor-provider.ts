import { Connection } from 'vscode-languageserver';
import { SafeDsServices } from '../safe-ds-module.js';
import { GetAst } from './getAst.js';
import { LangiumSharedServices } from 'langium/lsp';

// to be used like this: addDiagramHandler(connection, sharedServices, safeDsServices);
export const addDiagramHandler = function (
    connection: Connection,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
): void {
    connection.onRequest(GetAst.method, GetAst.handler(sharedServices, safeDsServices));
};
