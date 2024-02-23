import { Connection } from 'vscode-languageserver';
import { LangiumSharedServices } from 'langium';
import * as vscode from 'vscode';
import { SafeDsServices } from '../safe-ds-module.js';

interface GetAstParameter {
    uri: vscode.Uri;
}
interface GetAstResponse {
    json: string;
}

export const addDiagramHandler = function (
    connection: Connection,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
): void {
    connection.onRequest('custom-editor/getAST', async (message: GetAstParameter): Promise<GetAstResponse> => {
        let targetDocument;
        if (!sharedServices.workspace.LangiumDocuments.hasDocument(message.uri)) {
            targetDocument = sharedServices.workspace.LangiumDocuments.getOrCreateDocument(message.uri);
            await sharedServices.workspace.DocumentBuilder.build([targetDocument]);
        } else {
            targetDocument = sharedServices.workspace.LangiumDocuments.getOrCreateDocument(message.uri);
        }
        const root = targetDocument.parseResult.value;
        const AST = safeDsServices.serializer.JsonSerializer.serialize(root);
        return { json: AST };
    });
};
