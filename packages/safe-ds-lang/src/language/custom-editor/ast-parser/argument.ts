import { SdsArgument } from "../../generated/ast.js";
import { CustomError } from "../global.js";
import { Call } from "./call.js";
import { Expression, GenericExpression } from "./expression.js";
import { Utils } from "./utils.js";

export class Argument {
    constructor(
        public readonly text: string,
        public readonly reference: GenericExpression | Call | undefined,
        public readonly parameterName?: string,
    ) {}

    public static parse(node: SdsArgument) {
        if (!node.value.$cstNode)
            return Utils.pushError("CstNode missing", node.value);
        const text = node.value.$cstNode.text;
        const expression = Expression.parse(node.value);
        if (expression instanceof CustomError) return expression;

        if (node.parameter && !node.parameter.ref)
            return Utils.pushError("Missing Parameterreference", node);
        const parameterName = node.parameter?.ref?.name;

        return new Argument(text, expression, parameterName);
    }
}
