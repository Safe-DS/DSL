import { SdsReference } from "../../../generated/ast.js";
import { Declaration } from "../extractor/declaration.js";
import { Utils } from "../utils.js";
import { FunctionDeclaration } from "../extractor/function.js";

const LOGGING_TAG = "CustomEditor] [AstParser] [Reference";

export const getReference = (node: SdsReference): Declaration => {
    const target = node.target.ref;
    if (!target) {
        Utils.pushError(
            LOGGING_TAG,
            // Question: Is there a better way to get the line of a certain start that includes empty lines and comments
            // Answer:
            //   rangeToString
            //   locationToString
            // Todo:
            `Unable to resolve reference in line ${node.$cstNode?.range.start.line}`,
        );

        return FunctionDeclaration.default();
    }
    const declaration =
        Declaration.get(target) ?? FunctionDeclaration.default();
    return declaration;
};
