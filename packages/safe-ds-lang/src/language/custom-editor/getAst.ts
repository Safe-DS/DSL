import { LangiumSharedServices } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import { GenericRequestType } from './types.js';
import * as vscode from 'vscode';

export namespace GetAstTypes {
    export interface Message {
        uri: vscode.Uri;
    }
    export interface Response {
        json: string;
    }
}

const getAstHandler = async (
    message: GetAstTypes.Message,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
): Promise<GetAstTypes.Response> => {
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
};

export const GetAst: GenericRequestType = {
    method: 'custom-editor/getAST',
    handler:
        (sharedServices: LangiumSharedServices, safeDsServices: SafeDsServices) => (message: GetAstTypes.Message) =>
            getAstHandler(message, sharedServices, safeDsServices),
};
