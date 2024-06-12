import { SdsMemberAccess } from "../../../generated/ast.js";
import { Declaration } from "./declaration.js";
import { parseExpression } from "../parser/expression.js";
import { Utils } from "../utils.js";
import { ClassDeclaration } from "./class.js";
import { Port } from "./edge.js";
import { Function } from "./function.js";
import { Placeholder } from "./placeholder.js";

export class MemberAccess {
    public static readonly LOGGING_TAG =
        "CustomEditor] [AstParser] [MemberAccess";

    private constructor(
        public readonly member: Declaration,
        public readonly receiver: string | Port,
    ) {}

    public static default(): MemberAccess {
        return new MemberAccess(Function.default(), "unknown");
    }

    public static get(node: SdsMemberAccess): MemberAccess {
        let member: Declaration;
        if (!node.member || !node.member.target.ref) {
            Utils.pushError(
                MemberAccess.LOGGING_TAG,
                `Member is undefined or undeclared in line ${node.member?.$cstNode?.range.start.line}`,
            );
            member = Function.default();
        } else {
            const memberDeclaration = node.member.target.ref;
            member = Declaration.get(memberDeclaration) ?? Function.default();
        }

        const receiver = parseExpression(node.receiver);
        if (!(receiver instanceof Declaration)) {
            Utils.pushError(
                MemberAccess.LOGGING_TAG,
                `Receiver is undefined or undeclared in line ${node.receiver.$cstNode?.range.start.line}`,
            );
            return new MemberAccess(member, "unknown");
        }

        if (receiver instanceof Placeholder) {
            return new MemberAccess(member, Port.fromPlaceholder(receiver));
        }

        if (receiver instanceof ClassDeclaration) {
            return new MemberAccess(member, receiver.name);
        }

        Utils.pushError(
            MemberAccess.LOGGING_TAG,
            `Unable to display receiver <${node.receiver.$type}>`,
        );
        return new MemberAccess(member, "unknown");
    }
}
