import { SdsCall } from "../../../generated/ast.js";
import { Utils } from "../utils.js";
import { Argument } from "./argument.js";
import { Result } from "./result.js";
import { Parameter } from "./parameter.js";
import { Port } from "./edge.js";
import { parseExpression } from "../parser/expression.js";
import { Function } from "./function.js";
import { MemberAccess } from "./memberAccess.js";

export class Call {
    public static readonly LOGGING_TAG = "CustomEditor] [AstParser] [Call";

    private constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly self: Port | string,
        public readonly parameterList: Parameter[],
        public readonly resultList: Result[],
        public readonly argumentList: (Argument | Port)[],
    ) {}

    public static get(node: SdsCall): Port[] {
        const nodeId = Utils.getNewId();

        const receiver = node.receiver;
        const argumentList = node.argumentList.arguments.map(Argument.get);

        let self: string | Port = "unknown";
        let name = "unknown";
        let parameterList: Parameter[] = [];
        let resultList: Result[] = [];

        const callReceiver = parseExpression(receiver);
        if (callReceiver instanceof MemberAccess) {
            self = callReceiver.receiver;
            name = callReceiver.member.name;

            if (callReceiver.member instanceof Function) {
                parameterList = callReceiver.member.parameterList;
                resultList = callReceiver.member.resultList;
            }
        }

        // Todo: Create argument Edges
        Utils.callList.push(
            new Call(
                nodeId,
                name,
                self,
                parameterList,
                resultList,
                argumentList,
            ),
        );

        return resultList.map((result) => Port.fromResult(result, nodeId));
    }
}
