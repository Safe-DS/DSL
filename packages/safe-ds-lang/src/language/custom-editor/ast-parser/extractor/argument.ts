import { SdsArgument } from "../../../generated/ast.js";
import { parseExpression } from "../parser/expression.js";
import { Port } from "./edge.js";
import { Literal } from "./literal.js";
import { Parameter } from "./parameter.js";

export class Argument {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [Argument";

    private constructor(
        public readonly value: Literal,
        public readonly parameterName?: string,
    ) {}

    public static default(): Argument {
        return new Argument(Literal.default(), undefined);
    }

    public static get(node: SdsArgument): Argument | Port {
        const parameterName = node.parameter?.ref
            ? Parameter.get(node.parameter.ref).name
            : undefined;

        let value = parseExpression(node.value);
        if (Port.isPortList(value) && value.length === 1) {
            return value[0]!;
        }
        if (!value || !(value instanceof Literal)) {
            return Argument.default();
        }

        return new Argument(value, parameterName);
    }
}
