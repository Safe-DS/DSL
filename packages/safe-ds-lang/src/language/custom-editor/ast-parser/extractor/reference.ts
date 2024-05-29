import { SdsReference } from "../../../generated/ast.js";
import { Declaration, parseDeclaration } from "../parser/declaration.js";
import { Utils } from "../utils.js";
import { defaultFunction } from "./function.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Reference";

export const getReference = (node: SdsReference): Declaration => {
    const target = node.target.ref;
    if (!target) {
        Utils.pushError(
            LOGGING_TAG,
            // Question: Is there a better way to get the line of a certain start that includes empty lines and comments
            `Unable to resolve reference in line ${node.$cstNode?.range.start.line}`,
        );
        // rangeToString
        // locationToString
        return defaultFunction;
    }
    const declaration = parseDeclaration(target);
    if (!declaration) {
        return defaultFunction;
    }
    return declaration;
};
