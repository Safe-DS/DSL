import {
    SdsLiteral,
    isSdsBoolean,
    isSdsFloat,
    isSdsInt,
    isSdsList,
    isSdsMap,
    isSdsNull,
    isSdsString,
    isSdsTemplateStringEnd,
    isSdsTemplateStringInner,
    isSdsTemplateStringPart,
    isSdsTemplateStringStart,
    isSdsUnknown,
} from "../../../generated/ast.js";
import { Utils } from "../utils.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Literal";

export const defaultLiteral: Literal = {
    $type: "literal",
    datatype: "unknown",
    value: "unknown",
};

export type Literal = {
    $type: "literal";
    datatype:
        | "SdsBoolean"
        | "SdsFloat"
        | "SdsInt"
        | "SdsList"
        | "SdsMap"
        | "SdsNull"
        | "SdsNumber"
        | "SdsString"
        | "SdsTemplateStringEnd"
        | "SdsTemplateStringInner"
        | "SdsTemplateStringPart"
        | "SdsTemplateStringStart"
        | "SdsUnknown"
        | "unknown";
    value: string;
};

export const getLiteral = (node: SdsLiteral): Literal => {
    if (isSdsString(node)) {
        return { $type: "literal", datatype: node.$type, value: node.value };
    }

    if (isSdsBoolean(node)) {
        return {
            $type: "literal",
            datatype: node.$type,
            value: node.value ? "true" : "false",
        };
    }

    if (isSdsFloat(node)) {
        return {
            $type: "literal",
            datatype: node.$type,
            value: node.value.toString(),
        };
    }

    if (isSdsInt(node)) {
        return {
            $type: "literal",
            datatype: node.$type,
            value: node.value.toString(),
        };
    }

    if (isSdsNull(node)) {
        return { $type: "literal", datatype: node.$type, value: "NULL" };
    }

    if (isSdsList(node)) {
        return { $type: "literal", datatype: node.$type, value: node.$type }; // Todo: This is a placeholder
    }

    if (isSdsMap(node)) {
        return { $type: "literal", datatype: node.$type, value: node.$type }; // Todo: This is a placeholder
    }

    if (isSdsUnknown(node)) {
        return { $type: "literal", datatype: node.$type, value: "unknown" };
    }

    if (
        isSdsTemplateStringEnd(node) ||
        isSdsTemplateStringInner(node) ||
        isSdsTemplateStringPart(node) ||
        isSdsTemplateStringStart(node)
    ) {
        return { $type: "literal", datatype: node.$type, value: node.value };
    }

    Utils.pushError(LOGGING_TAG, `Unexpected node type <${node.$type}>`);
    return defaultLiteral;
};

export const isLiteral = (object: any): object is Literal => {
    return (
        object &&
        typeof object === "object" &&
        typeof object.value === "string" &&
        [
            "SdsBoolean",
            "SdsFloat",
            "SdsInt",
            "SdsList",
            "SdsMap",
            "SdsNull",
            "SdsNumber",
            "SdsString",
            "SdsTemplateStringEnd",
            "SdsTemplateStringInner",
            "SdsTemplateStringPart",
            "SdsTemplateStringStart",
            "SdsUnknown",
            "Never",
        ].includes(object.datatype) &&
        object.$type === "literal"
    );
};
