import { SdsCall } from "../../../generated/ast.js";
import { Utils } from "../utils.js";
import { Argument, getArgument } from "./argument.js";
import { Result } from "./result.js";
import { Parameter } from "./parameter.js";
import { Port, resultToPort } from "./edge.js";
import { parseExpression } from "../parser/expression.js";
import { isMemberAccess } from "./memberAccess.js";
import { isFunction } from "./function.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [Call";

export interface Call {
    id: number;
    name: string;
    self: Port | string;
    parameterList: Parameter[];
    resultList: Result[];
    argumentList: (Argument | Port)[];
}

export const parseCall = (node: SdsCall): Port[] => {
    const nodeId = Utils.getNewId();

    const receiver = node.receiver;
    const argumentList = node.argumentList.arguments.map(getArgument);

    let self: string | Port = "unknown";
    let name = "unknown";
    let parameterList: Parameter[] = [];
    let resultList: Result[] = [];

    const callReceiver = parseExpression(receiver);
    if (isMemberAccess(callReceiver)) {
        self = callReceiver.receiver;
        name = callReceiver.member.name;

        if (isFunction(callReceiver.member)) {
            parameterList = callReceiver.member.parameterList;
            resultList = callReceiver.member.resultList;
        }
    }

    // Todo: Create argument Edges
    Utils.callList.push({
        id: nodeId,
        name,
        self,
        parameterList,
        resultList,
        argumentList,
    });

    return resultList.map((result) => resultToPort(result, nodeId));
};
