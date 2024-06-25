import { SdsTypeCast } from "../../../generated/ast.js";
import { Expression, GenericExpression } from "../parser/expression.js";
import { Call } from "./call.js";
import { Datatype } from "./datatype.js";

export class TypeCast {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [TypeCast";

    private constructor(
        public readonly type: Datatype,
        public readonly expression: GenericExpression | Call,
        private readonly text?: string,
    ) {}

    public static get(node: SdsTypeCast): TypeCast {
        const type = Datatype.get(node.type);
        const expression = Expression.get(node.expression);
        return new TypeCast(type, expression, node.$cstNode?.text);
    }

    public toString(): string {
        return `as ${this.type.toString()}`;
    }
}
