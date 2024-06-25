import { SdsExpression, SdsParameter } from "../../../generated/ast.js";
import { Expression, GenericExpression } from "../parser/expression.js";
import { Utils } from "../utils.js";
import { Datatype } from "./datatype.js";
import { Literal } from "./literal.js";

export class Parameter {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [Parameter";

    private constructor(
        public readonly name: string,
        public readonly datatype: Datatype,
        public readonly defaultValue: Literal | undefined,
        public readonly isConstant: boolean,
        private readonly text?: string,
    ) {}

    public static get(node: SdsParameter): Parameter {
        const name = node.name;
        const isConstant = node.isConstant;
        const defaultValue = getDefaultValue(node.defaultValue);

        if (!node.type) {
            Utils.pushError(
                Parameter.LOGGING_TAG,
                `Undefined Type for Parameter <${name}>`,
            );
        }
        const datatype = node.type
            ? Datatype.get(node.type)
            : Datatype.default();

        return new Parameter(
            name,
            datatype,
            defaultValue,
            isConstant,
            node.$cstNode?.text,
        );
    }

    public toString(): string {
        const base = `${this.name}: ${this.datatype.toString()}`;
        const postFix = this.defaultValue ? ` = ${this.defaultValue}` : "";
        return base + postFix;
    }
}

const getDefaultValue = (
    defaultValue: SdsExpression | undefined,
): Literal | undefined => {
    if (!defaultValue) {
        return undefined;
    }

    const tmp = Expression.get(defaultValue);
    if (tmp instanceof GenericExpression && tmp.expression instanceof Literal) {
        return tmp.expression;
    }

    return Literal.default();
};
