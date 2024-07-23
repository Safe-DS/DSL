import { SafeDsServices } from "../safe-ds-module.js";
import { LangiumSharedServices } from "langium/lsp";
import { extname } from "path";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { documentToJson, saveJson } from "./ast-parser/tools/debug-utils.js";
import { parseDocumentNew } from "./ast-parser/main.js";
import { Utils } from "./ast-parser/utils.js";
import { Ast, AstInterface } from "./global.js";
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
        return { ast: new Ast(), errorList: Utils.errorList };
    }

    const document =
        await sharedServices.workspace.LangiumDocuments.getOrCreateDocument(
            message.uri,
        );
    // logger.info("DEBUG Path: ", message.uri.path);
    // logger.info("DEBUG Path: ", document.uri.fsPath);
    // Question: it appears that I am using the getOrCreateDocument method wrong
    // Use example above
    await sharedServices.workspace.DocumentBuilder.build([document]);

    document.parseResult.lexerErrors.forEach(Utils.pushLexerErrors);
    document.parseResult.parserErrors.forEach(Utils.pushParserErrors);
    if (Utils.errorList.length === 0) {
        parseDocumentNew(document);
        //saveJson(documentToJson(document, 16), "currentDocument");
    }
    // Question: Wo war nochmal das Beispiel um alle Klassen + Globale Funktionen zu requesten?
    // Question: Gibt es Globale Funktionen?
    // use :safe-ds-markdown-generator

    const ast: Ast = {
        placeholderList: Utils.placeholderList,
        callList: Utils.callList,
        genericExpressionList: Utils.genericExpressionList,
        edgeList: Utils.edgeList,
    };
    return { ast, errorList: Utils.errorList };
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
