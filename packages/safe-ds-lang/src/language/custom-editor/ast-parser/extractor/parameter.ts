import { SdsExpression, SdsParameter } from "../../../generated/ast.js";
import { parseExpression } from "../parser/expression.js";
import { Utils } from "../utils.js";
import { Datatype, getDatatype, defaultDatatype } from "./datatype.js";
import { Literal, isLiteral, defaultLiteral } from "./literal.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Parameter";

export interface Parameter {
    $type: "parameter";
    name: string;
    datatype: Datatype;
    defaultValue: Literal | undefined;
    isConstant: boolean;
}

export const getParameter = (node: SdsParameter): Parameter => {
    const name = node.name;
    const isConstant = node.isConstant;
    const defaultValue = getDefaultValue(node.defaultValue);

    // Qustion: Does a undefined type mean implicit type? How should this be handled?
    if (!node.type) {
        Utils.pushError(LOGGING_TAG, `Undefined Type for Parameter <${name}>`);
    }
    const datatype = node.type ? getDatatype(node.type) : defaultDatatype;

    return { $type: "parameter", name, datatype, defaultValue, isConstant };
};

const getDefaultValue = (
    defaultValue: SdsExpression | undefined,
): Literal | undefined => {
    if (!defaultValue) {
        return undefined;
    }

    const tmp = parseExpression(defaultValue);
    if (isLiteral(tmp)) {
        return tmp;
    }

    return defaultLiteral;
};
