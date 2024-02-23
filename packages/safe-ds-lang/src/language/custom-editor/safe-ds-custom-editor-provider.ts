import { Connection } from 'vscode-languageserver';
import { LangiumSharedServices } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import { GetAst } from './getAst.js';

export const addDiagramHandler = function (
    connection: Connection,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
): void {
    connection.onRequest(GetAst.method, GetAst.handler(sharedServices, safeDsServices));
};
