import {
    isSdsBoolean,
    isSdsCallableType,
    isSdsFloat,
    isSdsInt,
    isSdsList,
    isSdsLiteralType,
    isSdsMap,
    isSdsMemberType,
    isSdsNamedType,
    isSdsNull,
    isSdsString,
    isSdsUnionType,
    SdsLiteral,
    SdsType,
} from "../../generated/ast.js";
import { CustomError } from "../global.js";
import { filterErrors, Utils } from "./utils.js";

// Todo: This file is a mess

type NamedType =
    | "Table"
    | "SupportVectorClassifier"
    | "TabularDataset"
    | "String"
    | "Int"
    | "Float"
    | "Boolean"
    | "List";

export type Datatype =
    | "Callable"
    | "Member"
    | "Unknown"
    | "Union"
    | NamedType
    | LiteralDatatype;

export const Type = {
    parse(node: SdsType): Datatype | CustomError {
        if (isSdsCallableType(node)) {
            return "Callable";
        }
        if (isSdsMemberType(node)) {
            return "Member";
        }
        if (isSdsLiteralType(node)) {
            const literalList = node.literalList.literals;
            if (literalList.length !== 1)
                return Utils.pushError("Unknown Literal", node);
            return LiteralType.parse(literalList[0]!);
        }
        if (isSdsNamedType(node)) {
            // Question: Ist es richtig, dass Int, String usw Named Types sind? Wofür sind dasn LiteralTypes?
            // Todo: I have to extract all available classes anyway -> that helper can be used here as well
            if (!node.declaration || !node.declaration.ref)
                return Utils.pushError("Mising Declaration", node);

            if (
                [
                    "Table",
                    "SupportVectorClassifier",
                    "TabularDataset",
                    "String",
                    "Int",
                    "Float",
                    "Boolean",
                    "List",
                ].includes(node.declaration.ref.name)
            )
                return node.declaration.ref.name as NamedType;

            return Utils.pushError(
                `Unknown NamedType: ${node.declaration.ref.name}`,
                node,
            );
        }
        if (isSdsUnionType(node)) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const parseResult = filterErrors(
                node.typeArgumentList.typeArguments.map((type) => {
                    return Type.parse(type.value);
                }),
            );
            return "Union";
            // return parseResult.join("|");
        }

        return "Unknown";
    },
};

export type LiteralDatatype =
    | "Boolean"
    | "Float"
    | "Int"
    | "List"
    | "Map"
    | "Null"
    | "String"
    | "Unknown";

export const LiteralType = {
    parse(node: SdsLiteral): LiteralDatatype {
        if (isSdsBoolean(node))
            if (
                isSdsBoolean(node) ||
                isSdsFloat(node) ||
                isSdsInt(node) ||
                isSdsList(node) ||
                isSdsMap(node) ||
                isSdsNull(node) ||
                isSdsString(node)
            ) {
                return node.$type.slice(3) as unknown as LiteralDatatype;
            }
        return "Unknown";
    },
};
