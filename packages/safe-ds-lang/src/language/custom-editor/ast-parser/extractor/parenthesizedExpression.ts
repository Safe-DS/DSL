import { SdsParenthesizedExpression } from "../../../generated/ast.js";
import { Expression, GenericExpression } from "../parser/expression.js";
import { displayCombo } from "../utils.js";
import { Call } from "./call.js";

export class ParenthesizedExpression {
    public static readonly LOGGING_TAG =
        "CustomEditor] [AstParser] [ParenthesizedExpression";

    private constructor(
        public readonly expression: GenericExpression | Call,
        private readonly text?: string,
    ) {}

    public static get(
        node: SdsParenthesizedExpression,
    ): ParenthesizedExpression {
        const expression = Expression.get(node.expression);
        return new ParenthesizedExpression(expression, node.$cstNode?.text);
    }

    public toString(): string {
        return `(${displayCombo(this.expression)})`;
    }
}
