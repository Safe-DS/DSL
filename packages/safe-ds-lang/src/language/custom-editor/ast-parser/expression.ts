import { AstUtils } from "langium";
import {
    SdsClass,
    SdsExpression,
    isSdsCall,
    isSdsInfixOperation,
    isSdsLiteral,
    isSdsPlaceholder,
    isSdsPrefixOperation,
    isSdsReference,
    isSdsTypeCast,
} from "../../generated/ast.js";
import { Call } from "./call.js";
import { Utils } from "./utils.js";
import { Edge, Port } from "./edge.js";
import { Placeholder } from "./placeholder.js";
import { Datatype, LiteralType, Type } from "./type.js";
import { CustomError } from "../global.js";

export class GenericExpression {
    public constructor(
        public readonly id: number,
        public readonly text: string,
        public readonly type: Datatype,
    ) {}
}

export class Expression {
    public static parse(node: SdsExpression) {
        if (isSdsCall(node)) return Call.parse(node);

        if (isSdsReference(node) && isSdsPlaceholder(node.target.ref)) {
            return Placeholder.parse(node.target.ref);
        }

        if (!node.$cstNode) return Utils.pushError("Missing CstNode", node);

        const id = Utils.getNewId();
        const genericExpression = new GenericExpression(
            id,
            node.$cstNode.text,
            getType(node),
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

// Question: Ask if there already exists a solution for this
// safe-ds-type-computer
const getType = (node: Exclude<SdsExpression, SdsClass>): Datatype => {
    if (isSdsLiteral(node)) return LiteralType.parse(node);
    if (isSdsInfixOperation(node)) return "Float";
    if (isSdsPrefixOperation(node)) return "Float";
    if (isSdsTypeCast(node)) {
        const type = Type.parse(node.type);
        if (type instanceof CustomError) return "Unknown";
        return type;
    }

    return "Unknown";
};
