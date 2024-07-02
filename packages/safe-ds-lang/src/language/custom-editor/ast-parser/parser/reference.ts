import { SdsReference } from "../../../generated/ast.js";
import { Declaration, DeclarationType } from "./declaration.js";
import { Utils } from "../utils.js";
import { FunctionDeclaration } from "../extractor/function.js";

export const Reference = {
    LOGGING_TAG: "CustomEditor] [AstParser] [Reference",
    get(node: SdsReference): DeclarationType {
        const target = node.target.ref;
        if (!target) {
            Utils.pushError(
                Reference.LOGGING_TAG,

                `Unable to resolve reference in line ${node.$cstNode?.range.start.line}`,
            );

            return FunctionDeclaration.default();
        }
        const declaration =
            Declaration.get(target) ?? FunctionDeclaration.default();
        return declaration;
    },
};
