import { LangiumSharedServices } from "langium/lsp";
import { GenericRequestType } from "./types.js";
import { SafeDsServices } from "../safe-ds-module.js";
import { NodeDescriptionInterface } from "./global.js";
import { extname } from "path";
import {
    isSdsCall,
    isSdsMemberAccess,
    isSdsReference,
} from "../generated/ast.js";

const getNodeDescription = async (
    message: NodeDescriptionInterface.Message,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
): Promise<NodeDescriptionInterface.Response> => {
    const logger = safeDsServices.communication.MessagingProvider;

    const parseableExtensions = [".sds", ".sdsdev"];
    if (!parseableExtensions.includes(extname(message.uri.path))) {
        logger.error("DescReader", `Unknown file type <${message.uri.path}>`);
        return { description: "Unable to load document" };
    }
    const document =
        await sharedServices.workspace.LangiumDocuments.getOrCreateDocument(
            message.uri,
        );
    await sharedServices.workspace.DocumentBuilder.build([document]);
    // Question: Lars hatte gesagt, dass es hier mittelerweile eine bessere Lösung gibt.

    const root = document.parseResult.value;
    const node = safeDsServices.workspace.AstNodeLocator.getAstNode(
        root,
        message.uniquePath,
    );
    if (!node) {
        logger.error(
            "DescReader",
            `Unable to find matching Node for uniquePath <${message.uniquePath}>`,
        );
        return { description: "Unable to locate Description" };
    }
    if (!isSdsCall(node)) {
        logger.error(
            "DescReader",
            `Unable to retrieve documentation for Node of type <${node.$type}>`,
        );
        return {
            description: "Unable to retieve Description for this Element",
        };
    }

    let description;
    const receiver = node.receiver;
    if (isSdsMemberAccess(receiver)) {
        const fun = receiver.member?.target.ref!;
        description =
            safeDsServices.documentation.DocumentationProvider.getDocumentation(
                fun,
            );
    }
    if (isSdsReference(receiver)) {
        const cls = receiver.target.ref!;
        description =
            safeDsServices.documentation.DocumentationProvider.getDocumentation(
                cls,
            );
    }

    return { description: description ?? "" };
};

export const GetNodeDesciption: GenericRequestType = {
    method: "custom-editor/getNodeDescription",
    handler:
        (
            sharedServices: LangiumSharedServices,
            safeDsServices: SafeDsServices,
        ) =>
        (message: NodeDescriptionInterface.Message) =>
            getNodeDescription(message, sharedServices, safeDsServices),
};
