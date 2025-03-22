import {
    SdsAttribute,
    SdsCall,
    SdsClass,
    SdsExpression,
    SdsFunction,
    SdsMemberAccess,
    SdsPlaceholder,
    SdsReference,
    SdsSegment,
    isSdsAttribute,
    isSdsCall,
    isSdsClass,
    isSdsFunction,
    isSdsMemberAccess,
    isSdsPlaceholder,
    isSdsReference,
    isSdsSegment,
} from '../../generated/ast.js';
import { Argument } from './argument.js';
import { Edge, Port } from './edge.js';
import { GenericExpression } from './expression.js';
import { Parameter } from './parameter.js';
import { Placeholder } from './placeholder.js';
import { Result } from './result.js';
import { filterErrors } from './utils.js';
import { Parser } from './parser.js';
import { CustomError } from '../types.js';

export class Call {
    private constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly self: string | undefined,
        public readonly parameterList: Parameter[],
        public readonly resultList: Result[],
        public readonly category: string,
        public readonly uniquePath: string,
    ) {}

    public static parse(node: SdsCall, parser: Parser): Call | CustomError {
        const id = parser.getNewId();

        if (!isValidCallReceiver(node.receiver)) {
            return parser.pushError(`Invalid Call receiver: ${debugInvalidCallReceiver(node.receiver)}`, node.receiver);
        }

        let name = '';
        let self: string | undefined = undefined;
        let category = '';
        let argumentList: Argument[] = [];
        let parameterList: Parameter[] = [];
        let resultList: Result[] = [];

        argumentList = filterErrors(node.argumentList.arguments.map((argument) => Argument.parse(argument, parser)));

        if (isSdsMemberAccess(node.receiver)) {
            const tmp = Call.parseSelf(node.receiver, id, parser);
            if (tmp instanceof CustomError) return tmp;

            const functionDeclaration = node.receiver.member.target.ref;
            name = functionDeclaration.name;
            category = parser.getCategory(functionDeclaration)?.name.split('Q')[0] ?? '';

            if (isSdsMemberAccess(node.receiver.receiver)) {
                name = `${tmp}.${name}`;
            } else {
                self = tmp;
            }

            resultList = filterErrors(
                (functionDeclaration.resultList?.results ?? []).map((result) => Result.parse(result, parser)),
            );
            parameterList = filterErrors(
                (functionDeclaration.parameterList?.parameters ?? []).map((parameter) =>
                    Parameter.parse(parameter, parser),
                ),
            );
        }

        if (isSdsReference(node.receiver) && isSdsClass(node.receiver.target.ref)) {
            const classDeclaration = node.receiver.target.ref;

            name = 'new';
            self = classDeclaration.name;
            category = 'Modeling';

            if (!classDeclaration.parameterList)
                return parser.pushError('Missing constructor parameters', classDeclaration);
            parameterList = filterErrors(
                classDeclaration.parameterList.parameters.map((parameter) => Parameter.parse(parameter, parser)),
            );
            resultList = [new Result('new', classDeclaration.name)];
        }

        if (isSdsReference(node.receiver) && isSdsSegment(node.receiver.target.ref)) {
            const segmentDeclaration = node.receiver.target.ref;

            self = '';
            name = segmentDeclaration.name;
            category = 'Segment';

            resultList = filterErrors(
                (segmentDeclaration.resultList?.results ?? []).map((result) => Result.parse(result, parser)),
            );
            parameterList = filterErrors(
                (segmentDeclaration.parameterList?.parameters ?? []).map((parameter) =>
                    Parameter.parse(parameter, parser),
                ),
            );
        }

        const parameterListCompleted = matchArgumentsToParameter(parameterList, argumentList, node, id, parser);
        if (parameterListCompleted instanceof CustomError) return parameterListCompleted;

        const call = new Call(id, name, self, parameterListCompleted, resultList, category, parser.getUniquePath(node));
        parser.graph.callList.push(call);
        return call;
    }

    private static parseSelf(node: CallReceiver, id: number, parser: Parser) {
        if (isSdsMemberAccess(node)) {
            if (isSdsCall(node.receiver)) {
                const call = Call.parse(node.receiver, parser);
                if (call instanceof CustomError) return call;

                if (call.resultList.length > 1) return parser.pushError('To many result', node.receiver);
                if (call.resultList.length < 1) return parser.pushError('Missing result', node.receiver);

                Edge.create(Port.fromResult(call.resultList[0]!, call.id), Port.fromName(id, 'self'), parser);
            } else if (isSdsReference(node.receiver)) {
                const receiver = node.receiver.target.ref;

                if (isSdsClass(receiver)) {
                    return receiver.name;
                } else if (isSdsPlaceholder(receiver)) {
                    const placeholder = Placeholder.parse(receiver, parser);
                    Edge.create(Port.fromPlaceholder(placeholder, false), Port.fromName(id, 'self'), parser);
                }
            } else if (isSdsMemberAccess(node.receiver)) {
                const receiver = node.receiver;
                const placeholder = Placeholder.parse(receiver.receiver.target.ref, parser);

                Edge.create(Port.fromPlaceholder(placeholder, false), Port.fromName(id, 'self'), parser);

                return receiver.member.target.ref.name;
            }
        }
        return '';
    }
}

const matchArgumentsToParameter = (
    parameterList: Parameter[],
    argumentList: Argument[],
    callNode: SdsCall,
    id: number,
    parser: Parser,
): Parameter[] | CustomError => {
    let usedNameForArgument = false;

    for (const [index, parameter] of parameterList.entries()) {
        const indexMatched = argumentList[index];
        const nameMatched = argumentList.find((argument) => argument.parameterName === parameter.name);

        if (indexMatched && indexMatched.parameterName) usedNameForArgument = true;
        const argument = usedNameForArgument ? nameMatched : indexMatched;

        if (argument) {
            parameter.argumentText = argument.text;
            if (argument.reference instanceof Call) {
                const call = argument.reference;
                if (call.resultList.length !== 1) return parser.pushError('Type missmatch', callNode.argumentList);
                Edge.create(Port.fromResult(call.resultList[0]!, call.id), Port.fromParameter(parameter, id), parser);
            }
            if (argument.reference instanceof GenericExpression) {
                const experession = argument.reference;
                Edge.create(Port.fromGenericExpression(experession, false), Port.fromParameter(parameter, id), parser);
            }
            if (argument.reference instanceof Placeholder) {
                const placeholder = argument.reference;
                Edge.create(Port.fromPlaceholder(placeholder, false), Port.fromParameter(parameter, id), parser);
            }
            if (argument.reference instanceof Parameter) {
                const segmentParameter = argument.reference;
                Edge.create(Port.fromParameter(segmentParameter, -1), Port.fromParameter(parameter, id), parser);
            }
            continue;
        }

        if (!argument && parameter.defaultValue) {
            continue;
        }

        if (!argument && !parameter.defaultValue) {
            return parser.pushError(`Missing Argument for ${parameter.name}`, callNode);
        }
    }

    return parameterList;
};

type CallReceiver =
    | (SdsReference & { target: { ref: SdsClass | SdsSegment } })
    | (SdsMemberAccess & {
          member: {
              target: { ref: SdsFunction };
          };
          receiver:
              | SdsCall
              | { target: { ref: SdsPlaceholder | SdsClass } }
              | (SdsMemberAccess & {
                    member: {
                        target: { ref: SdsAttribute };
                    };
                    receiver: { target: { ref: SdsPlaceholder } };
                });
      });

const isValidCallReceiver = (receiver: SdsExpression): receiver is CallReceiver => {
    /* eslint-disable no-implicit-coercion */
    return (
        (isSdsMemberAccess(receiver) &&
            !!receiver.member &&
            !!receiver.member.target.ref &&
            isSdsFunction(receiver.member.target.ref) &&
            ((isSdsReference(receiver.receiver) &&
                (isSdsClass(receiver.receiver.target.ref) || isSdsPlaceholder(receiver.receiver.target.ref))) ||
                isSdsCall(receiver.receiver) ||
                (isSdsMemberAccess(receiver.receiver) &&
                    isSdsReference(receiver.receiver.member) &&
                    isSdsAttribute(receiver.receiver.member.target.ref) &&
                    isSdsReference(receiver.receiver.receiver) &&
                    isSdsPlaceholder(receiver.receiver.receiver.target.ref)))) ||
        (isSdsReference(receiver) && (isSdsClass(receiver.target.ref) || isSdsSegment(receiver.target.ref)))
    );
};

const debugInvalidCallReceiver = (receiver: SdsExpression): string => {
    /* eslint-disable no-implicit-coercion */
    if (isSdsMemberAccess(receiver)) {
        if (!receiver.member) return 'MemberAccess: Missing member';
        if (!receiver.member.target.ref) return 'MemberAccess: Missing member declaration';
        if (!isSdsFunction(receiver.member.target.ref)) return 'MemberAccess: Member is not a function';
        if (!isSdsCall(receiver.receiver) && !isSdsReference(receiver.receiver))
            return `MemberAccess: Receiver is not a Reference or Call but - ${receiver.receiver.$type}`;
        if (
            isSdsReference(receiver.receiver) &&
            !isSdsClass(receiver.receiver.target.ref) &&
            isSdsReference(receiver.receiver) &&
            !isSdsPlaceholder(receiver.receiver.target.ref)
        )
            return 'MemberAccess: Reference Receiver is not Class of Placeholder';
    }
    if (isSdsReference(receiver)) {
        if (!isSdsClass(receiver.target.ref) && !isSdsSegment(receiver.target.ref))
            return 'Reference: Not a class or segment';
    }

    return receiver.$type;
};
