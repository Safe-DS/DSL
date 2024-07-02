import { SafeDsServices } from "../safe-ds-module.js";
import { GenericRequestType } from "./types.js";
import { LangiumSharedServices } from "langium/lsp";
import { parseDocument } from "./ast-parser/parser/document.js";
import { AstInterface } from "../../../../safe-ds-vscode/src/extension/custom-editor/messaging/getAst.js";
import { Utils } from "./ast-parser/utils.js";
import { extname } from "path";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { documentToJson, saveJson } from "./ast-parser/tools/debug-utils.js";

const LOGGING_TAG = "CustomEditor] [AstParser";

const getAstHandler = async (
    message: AstInterface.Message,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
): Promise<AstInterface.Response> => {
    const logger = safeDsServices.communication.MessagingProvider;
    Utils.initialize(logger);

    const fileExtension = extname(message.uri.path);
    const parseableExtensions = [".sds", ".sdsdev"];
    if (!parseableExtensions.includes(fileExtension)) {
        Utils.pushError(LOGGING_TAG, `Unknown file type <${message.uri.path}>`);
        return { errorList: Utils.errorList };
    }

    const document =
        await sharedServices.workspace.LangiumDocuments.getOrCreateDocument(
            message.uri,
        );
    await sharedServices.workspace.DocumentBuilder.build([document]);

    // Todo: Merge main, Fix the Test pipeline, Create Tests

    // Question: Is there a better way to get the line of a certain start that includes empty lines and comments
    // Answer:
    //   rangeToString
    //   locationToString
    // Todo:
    parseDocument(document);
    // saveJson(documentToJson(document, 16), "currentDocument");

    const ast = JSON.stringify({
        placeholder: Utils.placeholderList,
        calls: Utils.callList,
        genericExpressions: Utils.genericExpressionList,
        edges: Utils.edgeList,
    });

    return {
        errorList: [
            {
                action: "block",
                source: `[${LOGGING_TAG}]`,
                message: `The parsing of the Ast is not yet fully implemented.\nPlease keep calm, and have a cup of tea.\nHere is how far we currenlty are:\n\n${ast}`,
            },
            ...Utils.errorList,
        ],
    };
};

export const GetAst: GenericRequestType = {
    method: "custom-editor/getAST",
    handler:
        (
            sharedServices: LangiumSharedServices,
            safeDsServices: SafeDsServices,
        ) =>
        (message: AstInterface.Message) =>
            getAstHandler(message, sharedServices, safeDsServices),
};
