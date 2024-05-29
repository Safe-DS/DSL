import {
    SdsDeclaration,
    isSdsClass,
    isSdsFunction,
    isSdsPlaceholder,
} from "../../../generated/ast.js";
import { Class, getClass } from "../extractor/class.js";
import { getFunction, Function, isFunction } from "../extractor/function.js";
import {
    Placeholder,
    getPlaceholder,
    isPlaceholder,
} from "../extractor/placeholder.js";
import { Utils } from "../utils.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Declaration";

export type Declaration = Function | Placeholder | Class;

export const parseDeclaration = (
    node: SdsDeclaration,
): Declaration | undefined => {
    if (isSdsFunction(node)) {
        return getFunction(node);
    }

    if (isSdsPlaceholder(node)) {
        return getPlaceholder(node);
    }

    if (isSdsClass(node)) {
        return getClass(node);
    }

    switch (node.$type) {
        // Abstract
        case "SdsClassMember":
        case "SdsModuleMember":
        case "SdsNamedTypeDeclaration":

        case "SdsAbstractResult":
        //    case "SdsResult":
        //    case "SdsBlockLambdaResult":

        case "SdsAnnotation":
        case "SdsAttribute":
        case "SdsEnum":
        case "SdsEnumVariant":
        case "SdsLocalVariable":
        case "SdsModule":
        case "SdsParameter":
        case "SdsPipeline":
        case "SdsSchema":
        case "SdsSegment":
        case "SdsTypeParameter":
            Utils.pushError(LOGGING_TAG, `Unable to parse <${node.$type}>`);
    }
    return;
};

export const isDeclaration = (object: any): object is Declaration => {
    return isFunction(object) || isPlaceholder(object);
};
