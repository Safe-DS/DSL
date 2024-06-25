import { SdsInfixOperation } from "../../../generated/ast.js";
import { Expression, GenericExpression } from "../parser/expression.js";
import { displayCombo } from "../utils.js";
import { Call } from "./call.js";

export class InfixOperation {
    public static readonly LOGGING_TAG =
        "CustomEditor] [AstParser] [InfixOperation";

    private constructor(
        public readonly operator: string,
        public readonly leftOperand: GenericExpression | Call,
        public readonly rightOperand: GenericExpression | Call,
        private readonly text?: string,
    ) {}

    public static get(node: SdsInfixOperation): InfixOperation {
        const operator = node.operator;
        const leftOperand = Expression.get(node.leftOperand);
        const rightOperand = Expression.get(node.rightOperand);

        return new InfixOperation(
            operator,
            leftOperand,
            rightOperand,
            node.$cstNode?.text,
        );
    }

    public toString(): string {
        return `${displayCombo(this.leftOperand)} ${this.operator} ${displayCombo(this.rightOperand)}`;
    }
}
