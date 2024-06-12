import {
    SdsExpression,
    isSdsCall,
    isSdsLambda,
    isSdsLiteral,
    isSdsMemberAccess,
    isSdsReference,
    isSdsTemplateString,
} from "../../../generated/ast.js";
import { Port } from "../extractor/edge.js";
import { Literal } from "../extractor/literal.js";
import { MemberAccess } from "../extractor/memberAccess.js";
import { getReference } from "./reference.js";
import { Utils } from "../utils.js";
import { Declaration } from "../extractor/declaration.js";
import { Lambda } from "../extractor/lambda.js";
import { Call } from "../extractor/call.js";

const LOGGING_TAG = "CustomEditor] [AstParser] [Expression";

export const parseExpression = (
    node: SdsExpression,
): Literal | Lambda | Declaration | MemberAccess | Port[] | undefined => {
    if (!node) {
        return;
    }

    if (isSdsLiteral(node)) {
        return Literal.get(node);
    }

    if (isSdsMemberAccess(node)) {
        return MemberAccess.get(node);
    }

    if (isSdsReference(node)) {
        return getReference(node);
    }

    if (isSdsCall(node)) {
        const ports = Call.get(node);
        return ports;
    }

    if (isSdsLambda(node)) {
        return Lambda.get(node);
    }

    if (isSdsTemplateString(node)) {
        Utils.pushError(LOGGING_TAG, `Unexpected node type <${node.$type}>`);
        // Todo: Handle Template Strings
    }

    // case "SdsChainedExpression":
    //     case "SdsIndexedAccess":
    //     case "SdsMemberAccess":
    //     case "SdsCall":

    switch (node.$type) {
        case "SdsArgument":
        case "SdsInfixOperation":
        //  plus mal minus geteilt
        case "SdsParenthesizedExpression":
        case "SdsTypeCast":
        case "SdsPrefixOperation":
        //   Verneinung, Minus(unär)
    }

    Utils.pushError(LOGGING_TAG, `Unexpected node type <${node.$type}>`);
    return undefined;
};
