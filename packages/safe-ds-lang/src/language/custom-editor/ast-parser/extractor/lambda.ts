import { SdsLambda } from "../../../generated/ast.js";
import { Parameter, getParameter } from "./parameter.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Lambda";

export interface Lambda {
    $type: "lambda";
    parameterList: Parameter[];
    text: string;
}

export const getLambda = (node: SdsLambda): Lambda => {
    const parameterList =
        node.parameterList?.parameters.map(getParameter) ?? [];

    const text = node.$cstNode?.text ?? "";
    return {
        $type: "lambda",
        parameterList,
        text,
    };
};
