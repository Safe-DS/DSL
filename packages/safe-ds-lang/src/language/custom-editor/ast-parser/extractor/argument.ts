import { SdsArgument } from "../../../generated/ast.js";
import { parseExpression } from "../parser/expression.js";
import { Port, isPortList } from "./edge.js";
import { Literal, isLiteral, defaultLiteral } from "./literal.js";
import { getParameter } from "./parameter.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Argument";

export const defaultArgmuent: Argument = {
    $type: "argument",
    parameterName: undefined,
    value: defaultLiteral,
};

export interface Argument {
    $type: "argument";
    parameterName: string | undefined;
    value: Literal;
}

export const getArgument = (node: SdsArgument): Argument | Port => {
    const parameterName = node.parameter?.ref
        ? getParameter(node.parameter.ref).name
        : undefined;

    let value = parseExpression(node.value);
    if (isPortList(value) && value.length === 1) {
        return value[0]!;
    }
    if (!value || !isLiteral(value)) {
        return defaultArgmuent;
    }

    return {
        $type: "argument",
        parameterName,
        value,
    };
};
