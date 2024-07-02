import {
    SdsCall,
    SdsExpression,
    isSdsArgument,
    isSdsCall,
    isSdsMemberAccess,
    isSdsPlaceholder,
    isSdsReference,
} from "../../../generated/ast.js";
import { MemberAccess } from "../extractor/memberAccess.js";
import { Reference } from "./reference.js";
import { Utils } from "../utils.js";
import { DeclarationType } from "./declaration.js";
import { Call } from "../extractor/call.js";
import { Argument } from "../extractor/argument.js";
import { AstUtils } from "langium";
import { Edge, Port } from "../extractor/edge.js";

export type ExpressionType = Argument | DeclarationType | MemberAccess;

export class GenericExpression {
    public static readonly LOGGING_TAG =
        "CustomEditor] [AstParser] [GenericExpressionNode";

    private constructor(
        public readonly id: number,
        private readonly text: string,
        public readonly node?: ExpressionType,
    ) {}

    public static createNode(node: Exclude<SdsExpression, SdsCall>) {
        let parsedExpression: ExpressionType | undefined = undefined;

        if (isSdsArgument(node)) {
            parsedExpression = Argument.get(node);
        }
        if (isSdsMemberAccess(node)) {
            parsedExpression = MemberAccess.get(node);
        }
        if (isSdsReference(node)) {
            parsedExpression = Reference.get(node);
        }

        const id = Utils.getNewId();
        const text = node.$cstNode?.text ?? "";
        const tmp = new GenericExpression(id, text, parsedExpression);
        Utils.genericExpressionList.push(tmp);

        const children = AstUtils.streamAst(node).iterator();
        for (const child of children) {
            if (isSdsPlaceholder(child)) {
                Edge.create(
                    Port.fromPlaceholder(child),
                    Port.fromGenericExpression(tmp, true),
                );
            }
        }

        return tmp;
    }
}

export const Expression = {
    LOGGING_TAG: "CustomEditor] [AstParser] [Expression",

    get(node: SdsExpression): GenericExpression | Call {
        if (isSdsCall(node)) {
            return Call.get(node);
        }
        return GenericExpression.createNode(node);

        // if (
        //     isSdsLiteral(node) ||
        //     isSdsIndexedAccess(node) ||
        //     isSdsLambda(node) ||
        //     isSdsInfixOperation(node) ||
        //     isSdsPrefixOperation(node) ||
        //     isSdsTypeCast(node) ||
        //     isSdsParenthesizedExpression(node) ||
        //     isSdsTemplateString(node)
        // ) {
        //     expression = Literal.get(node);
        //     expression = IndexedAccess.get(node);
        //     expression = Lambda.get(node);
        //     expression = InfixOperation.get(node);
        //     expression = PrefixOperation.get(node);
        //     expression = TypeCast.get(node);
        //     expression = ParenthesizedExpression.get(node);
        //     expression = Literal.default();
        // }
        //
        // if (!expression) {
        //     Utils.pushError(
        //         Expression.LOGGING_TAG,
        //         `Unexpected node type <${node.$type}>`,
        //     );
        // }
    },
};
