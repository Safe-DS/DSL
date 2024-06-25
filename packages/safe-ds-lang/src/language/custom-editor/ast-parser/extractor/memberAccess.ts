import { SdsMemberAccess } from "../../../generated/ast.js";
import { Declaration } from "./declaration.js";
import { Utils, displayCombo } from "../utils.js";
import { FunctionDeclaration } from "./function.js";
import { Expression, GenericExpression } from "../parser/expression.js";
import { Call } from "./call.js";

export class MemberAccess {
    public static readonly LOGGING_TAG =
        "CustomEditor] [AstParser] [MemberAccess";

    private constructor(
        public readonly member: Declaration,
        public readonly receiver: GenericExpression | Call,
        private readonly text?: string,
    ) {}

    public static default(): MemberAccess {
        return new MemberAccess(
            FunctionDeclaration.default(),
            new GenericExpression(Declaration.default()),
        );
    }

    public static get(node: SdsMemberAccess): MemberAccess {
        let member: Declaration;
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
