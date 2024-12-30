import { SafeDsServices } from "../safe-ds-module.js";
import { LangiumSharedServices } from "langium/lsp";
import { extname } from "path";
import { parseDocument } from "./ast-parser/main.js";
import { Utils } from "./ast-parser/utils.js";
import { AstInterface, Graph } from "./global.js";
import { GenericRequestType } from "./types.js";

const getAstHandler = async (
    message: AstInterface.Message,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
): Promise<AstInterface.Response> => {
    const logger = safeDsServices.communication.MessagingProvider;
    Utils.initialize(message.uri, safeDsServices, logger);
    logger.info("AstParser", `Received request for ${message.uri.fsPath}`);

    const parseableExtensions = [".sds", ".sdsdev"];
    if (!parseableExtensions.includes(extname(message.uri.path))) {
        Utils.pushError(`Unknown file type <${message.uri.path}>`);
        return {
            pipeline: new Graph("pipeline"),
            errorList: Utils.errorList,
            segmentList: [],
        };
    }

    // Todo: Find out why restarting with a different document doesnt work as intended
    const document =
        await sharedServices.workspace.LangiumDocuments.getOrCreateDocument(
            message.uri,
        );
    await sharedServices.workspace.DocumentBuilder.build([document]);

    const [graph, errorList, segmentList] = parseDocument(document);
    return { pipeline: graph, errorList, segmentList };
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
