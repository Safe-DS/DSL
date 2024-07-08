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

export class Literal {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [Literal";

    private constructor(
        public readonly datatype: string,
        public readonly value: string,
        private readonly text?: string,
    ) {}

    public static default(): Literal {
        return new Literal("unknown", "unknown");
    }

    public static get(node: SdsLiteral): Literal {
        const text = node.$cstNode?.text;

        if (isSdsString(node)) {
            return new Literal(node.$type, node.value, text);
        }

        if (isSdsBoolean(node)) {
            return new Literal(node.$type, node.value ? "true" : "false", text);
        }

        if (isSdsFloat(node)) {
            return new Literal(node.$type, node.value.toString(), text);
        }

        if (isSdsInt(node)) {
            return new Literal(node.$type, node.value.toString(), text);
        }

        if (isSdsNull(node)) {
            return new Literal(node.$type, "NULL", text);
        }

        if (isSdsList(node)) {
            return new Literal(node.$type, node.$type, text);
        }

        if (isSdsMap(node)) {
            return new Literal(node.$type, node.$type, text);
        }

        if (isSdsUnknown(node)) {
            return new Literal(node.$type, "unknown", text);
        }

        if (
            isSdsTemplateStringEnd(node) ||
            isSdsTemplateStringInner(node) ||
            isSdsTemplateStringPart(node) ||
            isSdsTemplateStringStart(node)
        ) {
            return new Literal(node.$type, node.value, text);
        }

        Utils.pushError(
            Literal.LOGGING_TAG,
            `Unexpected node type <${node.$type}>`,
        );
        return Literal.default();
    }

    public toString(): string {
        return this.value;
    }
}
