import {
    SdsType,
    isSdsCallableType,
    isSdsLiteralType,
    isSdsMemberType,
    isSdsNamedType,
    isSdsUnionType,
    isSdsUnknownType,
} from "../../../generated/ast.js";
import { Utils } from "../utils.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Datatype";

export const defaultDatatype: Datatype = {
    $type: "datatype",
    type: "unknown",
    displayValue: "",
};

export interface Datatype {
    $type: "datatype";
    type:
        | "unknown"
        | "SdsNamedType"
        | "SdsCallableType"
        | "SdsLiteralType"
        | "SdsUnionType"
        | "SdsUnknownType";
    displayValue: string | string[];
}

export const getDatatype = (node: SdsType): Datatype => {
    if (isSdsCallableType(node)) {
        return { $type: "datatype", type: node.$type, displayValue: "" };
    }

    if (isSdsLiteralType(node)) {
        return {
            $type: "datatype",
            type: node.$type,
            displayValue: node.literalList.literals.map(
                (literal) => literal.$type,
            ),
        };
    }

    if (isSdsMemberType(node)) {
        return getDatatype(node.receiver);
    }

    if (isSdsNamedType(node)) {
        return {
            $type: "datatype",
            type: node.$type,
            displayValue: node.declaration?.ref?.name ?? "",
        };
    }

    if (isSdsUnionType(node)) {
        return {
            $type: "datatype",
            type: node.$type,
            displayValue: node.typeArgumentList.typeArguments
                .map(
                    (typeArgument) =>
                        getDatatype(typeArgument.value).displayValue,
                )
                .flat(),
        };
    }

    if (isSdsUnknownType(node)) {
        return { $type: "datatype", type: node.$type, displayValue: "unknown" };
    }

    Utils.pushError(LOGGING_TAG, `Unexpected node type <${node.$type}>`);
    return defaultDatatype;
};
