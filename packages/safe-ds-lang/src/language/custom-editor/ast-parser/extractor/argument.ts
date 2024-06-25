import { SdsArgument } from "../../../generated/ast.js";
import { Expression, GenericExpression } from "../parser/expression.js";
import { displayCombo } from "../utils.js";
import { Call } from "./call.js";
import { Literal } from "./literal.js";
import { Parameter } from "./parameter.js";

export class Argument {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [Argument";

    private constructor(
        public readonly value: GenericExpression | Call,
        public readonly parameterName?: string,
        private readonly text?: string,
    ) {}

    public static default(): Argument {
        return new Argument(
            new GenericExpression(Literal.default()),
            undefined,
        );
    }

    public static get(node: SdsArgument): Argument {
        const parameterName = node.parameter?.ref
            ? Parameter.get(node.parameter.ref).name
            : undefined;

        let value = Expression.get(node.value);
        return new Argument(value, parameterName);
    }

    public toString(): string {
        const value: string = displayCombo(this.value);
        const text = this.parameterName
            ? `${this.parameterName}: ${value}`
            : value;

        return text;
    }
}
