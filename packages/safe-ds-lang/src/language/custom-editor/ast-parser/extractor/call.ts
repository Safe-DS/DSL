import { SdsCall } from "../../../generated/ast.js";
import { Utils, zip } from "../utils.js";
import { Argument } from "./argument.js";
import { Result } from "./result.js";
import { Parameter } from "./parameter.js";
import { Edge, Port } from "./edge.js";
import { FunctionDeclaration } from "./function.js";
import { MemberAccess } from "./memberAccess.js";
import {
    Expression,
    GenericExpression,
    GenericExpressionNode,
} from "../parser/expression.js";
import { ClassDeclaration } from "./class.js";
import { Placeholder } from "./placeholder.js";

export class Call {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [Call";

    private constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly parameterList: Parameter[],
        public readonly resultList: Result[],
        public readonly argumentList: Argument[],
        public readonly self?: string,
        private readonly text?: string,
    ) {}

    public static default(
        id?: number,
        name?: string,
        parameterList?: Parameter[],
        resultList?: Result[],
        argumentList?: Argument[],
        self?: string,
        text?: string,
    ): Call {
        return new Call(
            id ?? Utils.getNewId(),
            name ?? "unknown",
            parameterList ?? [],
            resultList ?? [],
            argumentList ?? [],
            self ?? "unknown",
            text ?? undefined,
        );
    }

    public static get(node: SdsCall): Call {
        const id = Utils.getNewId();
        let name: string = "unknown";
        let self: string | undefined = undefined;
        let parameterList: Parameter[] = [];
        let resultList: Result[] = [];
        const argumentList = node.argumentList.arguments.map(Argument.get);
        const text = node.$cstNode?.text;

        const receiver = Expression.get(node.receiver);
        if (receiver instanceof Call) {
            Utils.pushError(Call.LOGGING_TAG, `Invalid Call receiver`);
        } else if (receiver instanceof GenericExpression) {
            if (receiver.expression instanceof MemberAccess) {
                if (
                    !(receiver.expression.member instanceof FunctionDeclaration)
                ) {
                    Utils.pushError(Call.LOGGING_TAG, `Calling not a Function`);
                    const call = Call.default(
                        id,
                        undefined,
                        undefined,
                        undefined,
                        argumentList,
                    );
                    Utils.callList.push(call);
                    return call;
                }

                name = receiver.expression.member.name;
                parameterList = receiver.expression.member.parameterList;
                resultList = receiver.expression.member.resultList;

                const tmp = receiver.expression.receiver;

                if (tmp instanceof ClassDeclaration) {
                    self = tmp.name;
                }
                if (tmp instanceof Placeholder) {
                    Edge.create(
                        Port.fromPlaceholder(tmp),
                        Port.fromName(id, "self"),
                    );
                }
                if (tmp instanceof Call) {
                    if (!isOfSizeOne(tmp.resultList)) {
                        const call = Call.default(
                            id,
                            undefined,
                            undefined,
                            undefined,
                            argumentList,
                        );
                        Utils.callList.push(call);
                        return call;
                    }
                    const result = tmp.resultList[0]!;

                    Edge.create(
                        Port.fromResult(result, id),
                        Port.fromName(id, "self"),
                    );
                }

                zip(argumentList, parameterList).forEach(
                    ([argument, parameter]) => {
                        const parameterName = argument.parameterName
                            ? parameterList
                                  .filter(
                                      (p) => p.name === argument.parameterName,
                                  )
                                  .pop()
                            : parameter;

                        if (!parameterName) return;
                        const to = Port.fromParameter(parameterName, id);

                        let from: Port;
                        if (argument.value instanceof Call) {
                            if (!isOfSizeOne(argument.value.resultList)) {
                                return;
                            }
                            from = Port.fromResult(
                                argument.value.resultList[0],
                                argument.value.id,
                            );
                        } else {
                            from = Port.fromGenericExpressionNode(
                                GenericExpressionNode.createNode(
                                    argument.value,
                                ),
                                false,
                            );
                        }

                        Edge.create(from, to);
                    },
                );

                const call = new Call(
                    id,
                    name,
                    parameterList,
                    resultList,
                    argumentList,
                    self,
                    text,
                );
                Utils.callList.push(call);

                return call;
            }
        }

        Utils.pushError(Call.LOGGING_TAG, `Unable to parse call`);
        const call = Call.default(
            id,
            undefined,
            undefined,
            undefined,
            argumentList,
        );
        Utils.callList.push(call);
        return call;
    }
}

const isOfSizeOne = <T>(arr: T[]): arr is [T] => {
    if (arr.length < 1) {
        Utils.pushError(Call.LOGGING_TAG, `Call as Argument yields no value`);
    }
    if (arr.length > 1) {
        Utils.pushError(
            Call.LOGGING_TAG,
            `Call as Argument yields to many values`,
        );
    }
    return arr.length === 1;
};
