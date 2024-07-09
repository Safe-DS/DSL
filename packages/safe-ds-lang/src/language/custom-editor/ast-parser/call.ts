import {
    SdsCall,
    SdsClass,
    SdsExpression,
    SdsFunction,
    SdsMemberAccess,
    SdsPlaceholder,
    SdsReference,
    isSdsCall,
    isSdsClass,
    isSdsFunction,
    isSdsMemberAccess,
    isSdsPlaceholder,
    isSdsReference,
} from "../../generated/ast.js";
import { Argument } from "./argument.js";
import { Edge, Port } from "./edge.js";
import { GenericExpression } from "./expression.js";
import { Parameter } from "./parameter.js";
import { Placeholder } from "./placeholder.js";
import { Result } from "./result.js";
import { Datatype } from "./type.js";
import { CustomError, filterErrors, Utils } from "./utils.js";

// Todo: Some portions of this code should get extracted to increase readability.
// Absolute mess at the moment

export class Call {
    private constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly self: string | undefined,
        public readonly parameterList: Parameter[],
        public readonly resultList: Result[],
    ) {}

    public static parse(node: SdsCall): Call | CustomError {
        const id = Utils.getNewId();

        if (!isValidCallReceiver(node.receiver)) {
            return Utils.pushError(
                `Invalid Call receiver: ${debugInvalidCallReceiver(node.receiver)}`,
                node.receiver,
            );
        }

        if (isSdsMemberAccess(node.receiver)) {
            let self = Call.parseSelf(node.receiver, id);
            if (self instanceof CustomError) return self;

            const functionDeclaration = node.receiver.member.target.ref;

            const name = functionDeclaration.name;

            const resultList = filterErrors(
                (functionDeclaration.resultList?.results ?? []).map(
                    Result.parse,
                ),
            );
            if (!functionDeclaration.parameterList) {
                return Utils.pushError(
                    "ParameterList undefined",
                    node.receiver.member,
                );
            }

            const argumentList = node.argumentList.arguments.map(
                Argument.parse,
            );
            const parameterList =
                functionDeclaration.parameterList.parameters.map(
                    Parameter.parse,
                );
            for (let i = 0; i < parameterList.length; i++) {
                const parameter = parameterList[i]!;
                if (parameter instanceof CustomError) return parameter;
                if (parameter.isConstant)
                    return Utils.pushError(
                        "Unexpected constant Parameter",
                        node.receiver.member.target.ref,
                    );

                const argumentIndexMatched = argumentList[i];
                if (argumentIndexMatched instanceof CustomError)
                    return argumentIndexMatched;

                const argumentNameMatched = argumentList.find(
                    (argument) =>
                        !(argument instanceof CustomError) &&
                        argument.parameterName === parameter.name,
                ) as Argument | undefined;

                if (
                    argumentIndexMatched &&
                    argumentNameMatched &&
                    argumentIndexMatched !== argumentNameMatched
                )
                    return Utils.pushError(
                        `To many matches for ${parameter.name}`,
                        node.argumentList,
                    );
                const argument = argumentIndexMatched ?? argumentNameMatched;

                if (argument) {
                    parameter.argumentText = argument.text;
                    if (argument.reference instanceof Call) {
                        const call = argument.reference;
                        if (call.resultList.length !== 1)
                            return Utils.pushError(
                                "Type missmatch",
                                node.argumentList,
                            );
                        Edge.create(
                            Port.fromResult(call.resultList[0]!, id),
                            Port.fromParameter(parameter, id),
                        );
                    }
                    if (argument.reference instanceof GenericExpression) {
                        const experession = argument.reference;
                        Edge.create(
                            Port.fromGenericExpression(experession, false),
                            Port.fromParameter(parameter, id),
                        );
                    }
                    continue;
                }

                if (!argument && parameter.defaultValue) {
                    parameter.argumentText = parameter.defaultValue;
                    continue;
                }

                if (!argument && !parameter.defaultValue) {
                    return Utils.pushError(
                        `Missing Argument for ${parameter.name}`,
                        node,
                    );
                }
            }
            const call = new Call(
                id,
                name,
                self,
                parameterList as Parameter[],
                resultList,
            );
            Utils.callList.push(call);
            return call;
        }

        if (isSdsReference(node.receiver)) {
            const classDeclaration = node.receiver.target.ref;
            const self = undefined;
            const name = classDeclaration.name;

            // Question: Ist die ParameterList einer Class Declaration die Parameterlist für den Konstruktor?
            if (!classDeclaration.parameterList)
                return Utils.pushError(
                    "Missing constructor parameters",
                    classDeclaration,
                );
            const parameterList = classDeclaration.parameterList.parameters.map(
                Parameter.parse,
            );
            // Todo: This typecast is technically invalid, but it shouldn't matter, as all the classes should by part of the datatype namedtype type
            const resultList = [new Result("new", name as Datatype)];
            const call = new Call(
                id,
                name,
                self,
                parameterList as Parameter[],
                resultList,
            );
            Utils.callList.push(call);
            return call;
        }

        return Utils.pushError("Unexpected Error during Call parsing", node);
    }

    private static parseSelf(node: CallReceiver, id: number) {
        if (isSdsMemberAccess(node)) {
            if (isSdsCall(node.receiver)) {
                const call = Call.parse(node.receiver);
                if (call instanceof CustomError) return call;

                if (call.resultList.length > 1)
                    return Utils.pushError("To many result", node.receiver);
                if (call.resultList.length < 1)
                    return Utils.pushError("Missing result", node.receiver);

                Edge.create(
                    Port.fromResult(call.resultList[0]!, call.id),
                    Port.fromName(id, "self"),
                );
            } else if (isSdsReference(node.receiver)) {
                const receiver = node.receiver.target.ref;

                if (isSdsClass(receiver)) {
                    return receiver.name;
                } else if (isSdsPlaceholder(receiver)) {
                    const placeholder = Placeholder.parse(receiver);
                    Edge.create(
                        Port.fromPlaceholder(placeholder),
                        Port.fromName(id, "self"),
                    );
                }
            }
        }
        return undefined;
    }
}

type CallReceiver =
    | (SdsReference & { target: { ref: SdsClass } })
    | (SdsMemberAccess & {
          member: {
              target: { ref: SdsFunction };
          };
          receiver: SdsCall | { target: { ref: SdsPlaceholder | SdsClass } };
      });

const isValidCallReceiver = (
    receiver: SdsExpression,
): receiver is CallReceiver => {
    /* eslint-disable no-implicit-coercion */
    return (
        (isSdsMemberAccess(receiver) &&
            !!receiver.member &&
            !!receiver.member.target.ref &&
            isSdsFunction(receiver.member.target.ref) &&
            ((isSdsReference(receiver.receiver) &&
                (isSdsClass(receiver.receiver.target.ref) ||
                    isSdsPlaceholder(receiver.receiver.target.ref))) ||
                isSdsCall(receiver.receiver))) ||
        (isSdsReference(receiver) && isSdsClass(receiver.target.ref))
    );
};

const debugInvalidCallReceiver = (receiver: SdsExpression): string => {
    /* eslint-disable no-implicit-coercion */
    if (isSdsMemberAccess(receiver)) {
        if (!receiver.member) return "MemberAccess: Missing member";
        if (!receiver.member.target.ref)
            return "MemberAccess: Missing member declaration";
        if (!isSdsFunction(receiver.member.target.ref))
            return "MemberAccess: Member is not a function";
        if (!isSdsCall(receiver.receiver) && !isSdsReference(receiver.receiver))
            return `MemberAccess: Receiver is not a Reference or Call but - ${receiver.receiver.$type}`;
        if (
            isSdsReference(receiver.receiver) &&
            !isSdsClass(receiver.receiver.target.ref) &&
            isSdsReference(receiver.receiver) &&
            !isSdsPlaceholder(receiver.receiver.target.ref)
        )
            return "MemberAccess: Reference Receiver is not Class of Placeholder";
    }
    if (isSdsReference(receiver)) {
        if (!isSdsClass(receiver.target.ref)) return "Reference: Not a class";
    }

    return receiver.$type;
};
