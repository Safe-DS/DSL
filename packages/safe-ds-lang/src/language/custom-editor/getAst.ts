import { SafeDsServices } from "../safe-ds-module.js";
import { GenericRequestType } from "./types.js";
import { LangiumSharedServices } from "langium/lsp";
import { AstInterface } from "../../../../safe-ds-vscode/src/extension/custom-editor/messaging/getAst.js";
import { extname } from "path";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { documentToJson, saveJson } from "./ast-parser/tools/debug-utils.js";
import { parseDocumentNew } from "./ast-parser-new/main.js";
import { Utils } from "./ast-parser-new/utils.js";

const LOGGING_TAG = "CustomEditor] [AstParser";

const getAstHandler = async (
    message: AstInterface.Message,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
): Promise<AstInterface.Response> => {
    const logger = safeDsServices.communication.MessagingProvider;
    logger.info("AstParser", `Received request for ${message.uri.fsPath}`);

    const fileExtension = extname(message.uri.path);
    const parseableExtensions = [".sds", ".sdsdev"];
    if (!parseableExtensions.includes(fileExtension)) {
        Utils.log(`Unknown file type <${message.uri.path}>`);
        return { errorList: Utils.errorList };
    }

    logger.info("DEBUG", message.uri.fsPath);
    const document =
        await sharedServices.workspace.LangiumDocuments.getOrCreateDocument(
            message.uri,
        );
    logger.info("DEBUG", document.uri.fsPath);
    await sharedServices.workspace.DocumentBuilder.build([document]);

    document.parseResult.lexerErrors.forEach(Utils.pushLexerErrors);
    document.parseResult.parserErrors.forEach(Utils.pushParserErrors);
    if (Utils.errorList.length === 0) {
        logger.info("AstParser", `Parsing: ${document.uri.fsPath}`);
        parseDocumentNew(document);
        //saveJson(documentToJson(document, 16), "currentDocument");
    }

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
