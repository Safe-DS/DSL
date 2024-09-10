import { AstUtils } from "langium";
import {
    SdsExpression,
    isSdsCall,
    isSdsParameter,
    isSdsPlaceholder,
    isSdsReference,
} from "../../generated/ast.js";
import { Call } from "./call.js";
import { Utils } from "./utils.js";
import { Edge, Port } from "./edge.js";
import { Placeholder } from "./placeholder.js";
import { Parameter } from "./parameter.js";

export class GenericExpression {
    public constructor(
        public readonly id: number,
        public readonly text: string,
        public readonly type: string,
        public readonly uniquePath: string,
    ) {}
}

export class Expression {
    public static parse(node: SdsExpression) {
        if (isSdsCall(node)) return Call.parse(node);

        if (isSdsReference(node) && isSdsPlaceholder(node.target.ref)) {
            return Placeholder.parse(node.target.ref);
        }
        if (isSdsReference(node) && isSdsParameter(node.target.ref)) {
            return Parameter.parse(node.target.ref);
        }

        if (!node.$cstNode) return Utils.pushError("Missing CstNode", node);

        const id = Utils.getNewId();
        const genericExpression = new GenericExpression(
            id,
            node.$cstNode.text,
            Utils.safeDsServices.typing.TypeComputer.computeType(
                node,
            ).toString(),
            Utils.safeDsServices.workspace.AstNodeLocator.getAstNodePath(node),
        );

        const children = AstUtils.streamAst(node).iterator();
        for (const child of children) {
            if (isSdsPlaceholder(child)) {
                Edge.create(
                    Port.fromPlaceholder(Placeholder.parse(child), false),
                    Port.fromGenericExpression(genericExpression, true),
                );
            }
        }

        Utils.genericExpressionList.push(genericExpression);
        return genericExpression;
    }
}
