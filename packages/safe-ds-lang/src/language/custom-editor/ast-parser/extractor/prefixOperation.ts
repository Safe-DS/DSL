import { SdsPrefixOperation } from "../../../generated/ast.js";
import { Expression, GenericExpression } from "../parser/expression.js";
import { displayCombo } from "../utils.js";
import { Call } from "./call.js";

export class PrefixOperation {
    public static readonly LOGGING_TAG =
        "CustomEditor] [AstParser] [PrefixOperation";

    private constructor(
        public readonly operator: string,
        public readonly operand: GenericExpression | Call,
        private readonly text?: string,
    ) {}

    public static get(node: SdsPrefixOperation): PrefixOperation {
        const operator = node.operator;
        const operand = Expression.get(node.operand);

        return new PrefixOperation(operator, operand, node.$cstNode?.text);
    }

    public toString(): string {
        return `${this.operator}${displayCombo(this.operand)}`;
    }
}
