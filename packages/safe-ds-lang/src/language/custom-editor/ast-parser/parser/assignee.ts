import { SdsAssignee, isSdsPlaceholder } from "../../../generated/ast.js";
import { Placeholder } from "../extractor/placeholder.js";
import { Utils } from "../utils.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Assignee";

export const parseAssignee = (node: SdsAssignee): Placeholder | undefined => {
    if (isSdsPlaceholder(node)) {
        return Placeholder.get(node);
    }

    switch (node.$type) {
        case "SdsBlockLambdaResult":
        case "SdsWildcard":
        case "SdsYield":
    }

    Utils.pushError(LOGGING_TAG, `Unable to parse <${node.$type}>`);
    return;
};
