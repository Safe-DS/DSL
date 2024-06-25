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

export class Datatype {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [Datatype";

    private constructor(
        public readonly type: string,
        public readonly displayValue: string | string[],
        private readonly text?: string,
    ) {}

    public static default(): Datatype {
        return new Datatype("unknown", "");
    }

    public static get(node: SdsType): Datatype {
        const text = node.$cstNode?.text;

        if (isSdsCallableType(node)) {
            return new Datatype(node.$type, "", text);
        }

        if (isSdsLiteralType(node)) {
            return new Datatype(
                node.$type,
                node.literalList.literals.map((literal) => literal.$type),
                text,
            );
        }

        if (isSdsMemberType(node)) {
            return Datatype.get(node.receiver);
        }

        if (isSdsNamedType(node)) {
            return new Datatype(
                node.$type,
                node.declaration?.ref?.name ?? "",
                text,
            );
        }

        if (isSdsUnionType(node)) {
            return new Datatype(
                node.$type,
                node.typeArgumentList.typeArguments
                    .map(
                        (typeArgument) =>
                            Datatype.get(typeArgument.value).displayValue,
                    )
                    .flat(),
                text,
            );
        }

        if (isSdsUnknownType(node)) {
            return new Datatype(node.$type, "unknown", text);
        }

        Utils.pushError(
            Datatype.LOGGING_TAG,
            `Unexpected node type <${node.$type}>`,
        );

        return Datatype.default();
    }

    public toString(): string {
        return Array.isArray(this.displayValue)
            ? this.displayValue.join(" | ")
            : this.displayValue;
    }
}
