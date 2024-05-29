import { SdsMemberAccess } from "../../../generated/ast.js";
import {
    Declaration,
    isDeclaration,
    parseDeclaration,
} from "../parser/declaration.js";
import { parseExpression } from "../parser/expression.js";
import { Utils } from "../utils.js";
import { isClass } from "./class.js";
import { Port, isPort, placeholderToPort } from "./edge.js";
import { defaultFunction } from "./function.js";
import { isPlaceholder } from "./placeholder.js";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGING_TAG = "CustomEditor] [AstParser] [MemberAccess";

export const defaultMemberAccess: MemberAccess = {
    $type: "memberAccess",
    member: defaultFunction,
    receiver: "unknown",
};

export interface MemberAccess {
    $type: "memberAccess";
    member: Declaration;
    receiver: string | Port;
}

export const getMemberAccess = (node: SdsMemberAccess): MemberAccess => {
    let member: Declaration;
    if (!node.member || !node.member.target.ref) {
        Utils.pushError(
            LOGGING_TAG,
            `Member is undefined or undeclared in line ${node.member?.$cstNode?.range.start.line}`,
        );
        member = defaultFunction;
    } else {
        const memberDeclaration = node.member.target.ref;
        member = parseDeclaration(memberDeclaration) ?? defaultFunction;
    }

    const receiver = parseExpression(node.receiver);
    if (!isDeclaration(receiver)) {
        Utils.pushError(
            LOGGING_TAG,
            `Receiver is undefined or undeclared in line ${node.receiver.$cstNode?.range.start.line}`,
        );
        return {
            $type: "memberAccess",
            member,
            receiver: "unknown",
        };
    }

    if (isPlaceholder(receiver)) {
        return {
            $type: "memberAccess",
            member,
            receiver: placeholderToPort(receiver),
        };
    }

    if (isClass(receiver)) {
        return {
            $type: "memberAccess",
            member,
            receiver: receiver.name,
        };
    }

    Utils.pushError(
        LOGGING_TAG,
        `Unable to display receiver <${receiver.$type}>`,
    );
    return {
        $type: "memberAccess",
        member,
        receiver: "unknown",
    };
};

export const isMemberAccess = (object: any): object is MemberAccess => {
    return (
        object &&
        typeof object === "object" &&
        isDeclaration(object.member) &&
        (typeof object.receiver === "string" || isPort(object.receiver)) &&
        object.$type === "memberAccess"
    );
};
