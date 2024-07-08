import { SdsMemberAccess } from "../../../generated/ast.js";
import { Utils, displayCombo } from "../utils.js";
import { Expression, GenericExpression } from "../parser/expression.js";
import { Call } from "./call.js";
import { Declaration, DeclarationType } from "../parser/declaration.js";
import { FunctionDeclaration } from "./functionDeclaration.js";

export class MemberAccess {
    public static readonly LOGGING_TAG =
        "CustomEditor] [AstParser] [MemberAccess";

    private constructor(
        public readonly member: DeclarationType,
        public readonly receiver: GenericExpression | Call,
        private readonly text?: string,
    ) {}

    public static get(node: SdsMemberAccess): MemberAccess {
        let member: DeclarationType;
        if (!node.member || !node.member.target.ref) {
            Utils.pushError(
                MemberAccess.LOGGING_TAG,
                `Member is undefined or undeclared in line ${node.member?.$cstNode?.range.start.line}`,
            );
            member = FunctionDeclaration.default();
        } else {
            const memberDeclaration = node.member.target.ref;
            member =
                Declaration.get(memberDeclaration) ??
                FunctionDeclaration.default();
        }

        const receiver = Expression.get(node.receiver);
        return new MemberAccess(member, receiver, node.$cstNode?.text);
    }

    public toString(): string {
        return `${displayCombo(this.receiver)}.${this.member.toString()}`;
    }
}
