import { SafeDsServices } from "../safe-ds-module.js";
import { LangiumSharedServices } from "langium/lsp";
import { extname } from "path";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { documentToJson, saveJson } from "./ast-parser/tools/debug-utils.js";
import { parseDocumentNew } from "./ast-parser/main.js";
import { Utils } from "./ast-parser/utils.js";
import { AstInterface } from "./global.js";
import { GenericRequestType } from "./types.js";

const getAstHandler = async (
    message: AstInterface.Message,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
): Promise<AstInterface.Response> => {
    const logger = safeDsServices.communication.MessagingProvider;
    Utils.initialize(logger, message.uri);
    logger.info("AstParser", `Received request for ${message.uri.fsPath}`);

    const parseableExtensions = [".sds", ".sdsdev"];
    if (!parseableExtensions.includes(extname(message.uri.path))) {
        Utils.log(`Unknown file type <${message.uri.path}>`);
        return { errorList: Utils.errorList };
    }

    const document =
        await sharedServices.workspace.LangiumDocuments.getOrCreateDocument(
            message.uri,
        );
    logger.info("DEBUG Path: ", message.uri.path);
    logger.info("DEBUG Path: ", document.uri.fsPath);
    await sharedServices.workspace.DocumentBuilder.build([document]);

    document.parseResult.lexerErrors.forEach(Utils.pushLexerErrors);
    document.parseResult.parserErrors.forEach(Utils.pushParserErrors);
    if (Utils.errorList.length === 0) {
        parseDocumentNew(document);
        //saveJson(documentToJson(document, 16), "currentDocument");
    }

    const ast = JSON.stringify({
        placeholderList: Utils.placeholderList,
        callList: Utils.callList,
        genericExpressionList: Utils.genericExpressionList,
        edgeList: Utils.edgeList,
    });

    if (Utils.errorList.length > 0) return { errorList: Utils.errorList };
    return { ast };
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
