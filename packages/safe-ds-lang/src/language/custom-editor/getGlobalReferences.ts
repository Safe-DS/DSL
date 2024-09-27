import { LangiumSharedServices } from "langium/lsp";
import { GenericRequestType } from "./types.js";
import { GlobalReference, GlobalReferenceInterface } from "./global.js";
import { SafeDsServices } from "../safe-ds-module.js";
import { isPrivate } from "../helpers/nodeProperties.js";
import {
    isSdsAnnotation,
    isSdsClass,
    isSdsEnum,
    isSdsFunction,
    isSdsSegment,
} from "../generated/ast.js";

const getGlobalReferencesHandler = async (
    message: GlobalReferenceInterface.Message,
    sharedServices: LangiumSharedServices,
    safeDsServices: SafeDsServices,
): Promise<GlobalReferenceInterface.Response> => {
    const logger = safeDsServices.communication.MessagingProvider;

    const resultList: GlobalReference[] = [];

    let counter = 0;
    const allElements =
        safeDsServices.shared.workspace.IndexManager.allElements();
    for await (const element of allElements) {
        if (!element.node) {
            logger.warn(
                "GlobRef",
                `Unable to retrieve AstNode for global reference <${element.name}>`,
            );
            continue;
        }

        if (isSdsClass(element.node)) {
            const name = element.node.name;

            const classMemberList = element.node.body?.members ?? [];
            const functionList: GlobalReference[] = classMemberList
                .filter((member) => isSdsFunction(member))
                .filter((fun) => !isPrivate(fun))
                .map((fun) => {
                    const category =
                        safeDsServices.builtins.Annotations.getCategory(fun);
                    return {
                        parent: name,
                        name: fun.name,
                        category: category?.name ?? "",
                    };
                });

            if (element.node.parameterList) {
                logger.info(
                    "GlobRef",
                    `Class <${element.node.name}> no constructor`,
                );
            }
            if (element.node.parameterList) {
                functionList.push({
                    parent: name,
                    name: "new",
                    category: "Modeling",
                });
            }

            resultList.push(...functionList);
        } else if (isSdsFunction(element.node)) {
            resultList.push({
                name: element.node.name,
                category:
                    safeDsServices.builtins.Annotations.getCategory(
                        element.node,
                    )?.name ?? "",
                parent: undefined,
            });
        } else if (isSdsSegment(element.node)) {
            // Do nothing
        } else if (isSdsAnnotation(element.node) || isSdsEnum(element.node)) {
            // Expected
            logger.info(
                "GlobRef",
                `Unable to parse global reference of type <${element.node.$type}>`,
            );
        } else {
            logger.warn(
                "GlobRef",
                `Unable to parse global reference of type <${element.node.$type}>`,
            );
            continue;
        }
        counter++;
    }
    logger.info("GlobRef", `Found ${counter} exported Elements`);

    return { globalReferences: resultList };
};

export const GetGlobalReferences: GenericRequestType = {
    method: "custom-editor/getGlobalReferences",
    handler:
        (
            sharedServices: LangiumSharedServices,
            safeDsServices: SafeDsServices,
        ) =>
        (message: GlobalReferenceInterface.Message) =>
            getGlobalReferencesHandler(message, sharedServices, safeDsServices),
};
