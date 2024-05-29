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
import { Literal, getLiteral } from "../extractor/literal.js";
import { MemberAccess, getMemberAccess } from "../extractor/memberAccess.js";
import { getReference } from "../extractor/reference.js";
import { Utils } from "../utils.js";
import { parseCall } from "../extractor/call.js";
import { Declaration } from "./declaration.js";
import { Lambda, getLambda } from "../extractor/lambda.js";

const LOGGING_TAG = "CustomEditor] [AstParser] [Expression";

export const parseExpression = (
    node: SdsExpression,
): Literal | Lambda | Declaration | MemberAccess | Port[] | undefined => {
    if (!node) {
        return;
    }

    if (isSdsLiteral(node)) {
        return getLiteral(node);
    }

    if (isSdsMemberAccess(node)) {
        return getMemberAccess(node);
    }

    if (isSdsReference(node)) {
        return getReference(node);
    }

    if (isSdsCall(node)) {
        const ports = parseCall(node);
        return ports;
    }

    if (isSdsLambda(node)) {
        return getLambda(node);
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
