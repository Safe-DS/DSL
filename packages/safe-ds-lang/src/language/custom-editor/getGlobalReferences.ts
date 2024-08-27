import { LangiumSharedServices } from "langium/lsp";
import { GenericRequestType } from "./types.js";
import { GlobalReference, GlobalReferenceInterface } from "./global.js";
import { SafeDsServices } from "../safe-ds-module.js";
import { isPrivate } from "../helpers/nodeProperties.js";
import { isSdsClass, isSdsFunction } from "../generated/ast.js";
// Todo: import { CstUtils } from "langium"; // comment a node and get it somehow
// For description:
// safeDsServices.workspace.AstNodeLocator.getAstNodePath()
// safeDsServices.workspace.AstNodeLocator.getAstNode()

const getGlobalReferencesHandler = async (
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
            logger.info(
                "GlobRef",
                `Found global reference - Class <${element.node.name}>`,
            );
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
            functionList.push({
                parent: name,
                name: "new",
                category: "Modeling",
            });
            resultList.push(...functionList);
        } else if (isSdsFunction(element.node)) {
            logger.warn(
                "GlobRef",
                `Found global reference - Function <${element.node.name}>`,
            );
            resultList.push({
                name: element.node.name,
                category: "// Question: ??",
                parent: undefined,
            });
        } else {
            logger.warn(
                "GlobRef",
                `Unable to parse global reference of type <${element.node.$type}>`,
            );
            continue;
        }
        counter++;
    }
    logger.warn("GlobRef", `Found ${counter} exported Elements`);

    return { globalReferences: resultList };
};

export const GetGlobalReferences: GenericRequestType = {
    method: "custom-editor/getGlobalReferences",
    handler:
        (
            sharedServices: LangiumSharedServices,
            safeDsServices: SafeDsServices,
        ) =>
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (message: GlobalReferenceInterface.Message) =>
            getGlobalReferencesHandler(sharedServices, safeDsServices),
};
