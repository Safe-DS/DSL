import { Connection } from 'vscode-languageserver';
import { LangiumSharedServices } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import { getAst } from './getAst.js';

export const addDiagramHandler = function (
    connection: Connection,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
): void {
    connection.onRequest(getAst.method, getAst.handler(sharedServices, safeDsServices));
};
