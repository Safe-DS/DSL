import { SdsFunction } from "../../../generated/ast.js";
import { Parameter, getParameter } from "./parameter.js";
import { Result, getResult } from "./result.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Function";

export const defaultFunction: Function = {
    $type: "function",
    name: "unknown",
    isStatic: false,
    parameterList: [],
    resultList: [],
};

export interface Function {
    $type: "function";
    name: string;
    isStatic: Boolean;
    parameterList: Parameter[];
    resultList: Result[];
}

export const getFunction = (node: SdsFunction): Function => {
    const parameterList =
        node.parameterList?.parameters.map(getParameter) ?? [];
    const resultList = node.resultList?.results.map(getResult) ?? [];

    return {
        $type: "function",
        name: node.name,
        isStatic: node.isStatic,
        parameterList,
        resultList,
    };
};

export const isFunction = (object: any): object is Function => {
    return (
        object &&
        typeof object === "object" &&
        typeof object.name === "string" &&
        typeof object.isStatic === "boolean" &&
        Array.isArray(object.parameterList) &&
        Array.isArray(object.resultList) &&
        object.$type === "function"
    );
};
