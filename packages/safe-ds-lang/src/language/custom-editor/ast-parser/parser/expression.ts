import {
    SdsExpression,
    isSdsArgument,
    isSdsCall,
    isSdsIndexedAccess,
    isSdsInfixOperation,
    isSdsLambda,
    isSdsLiteral,
    isSdsMemberAccess,
    isSdsParenthesizedExpression,
    isSdsPrefixOperation,
    isSdsReference,
    isSdsTemplateString,
    isSdsTypeCast,
} from "../../../generated/ast.js";
import { Literal } from "../extractor/literal.js";
import { MemberAccess } from "../extractor/memberAccess.js";
import { getReference } from "./reference.js";
import { Utils } from "../utils.js";
import { Declaration } from "../extractor/declaration.js";
import { Lambda } from "../extractor/lambda.js";
import { Call } from "../extractor/call.js";
import { IndexedAccess } from "../extractor/indexedAccess.js";
import { Argument } from "../extractor/argument.js";
import { InfixOperation } from "../extractor/infixOperation.js";
import { PrefixOperation } from "../extractor/prefixOperation.js";
import { TypeCast } from "../extractor/typecast.js";
import { ParenthesizedExpression } from "../extractor/parenthesizedExpression.js";

export class GenericExpressionNode {
    public static readonly LOGGING_TAG =
        "CustomEditor] [AstParser] [GenericExpressionNode";

    private constructor(
        public readonly id: number,
        private readonly text: string,
        public readonly node: GenericExpression["expression"],
    ) {}

    public static createNode(expression: GenericExpression) {
        const id = Utils.getNewId();
        const text = expression.expression.toString();

        const node = new GenericExpressionNode(id, text, expression.expression);
        Utils.genericExpressionList.push(node);
        return node;
    }
}

export class GenericExpression {
    public static readonly LOGGING_TAG =
        "CustomEditor] [AstParser] [GenericExpression";

    public constructor(
        public readonly expression:
            | Argument
            | Literal
            | Lambda
            | Declaration
            | MemberAccess
            | IndexedAccess
            | InfixOperation
            | PrefixOperation
            | TypeCast
            | ParenthesizedExpression,
    ) {}
}

export class Expression {
    public static readonly LOGGING_TAG =
        "CustomEditor] [AstParser] [Expression";

    private constructor() {
        // This class doesn't get instanciated
    }

    public static get(node: SdsExpression): GenericExpression | Call {
        let expression: GenericExpression["expression"] | undefined = undefined;

        if (isSdsLiteral(node)) {
            expression = Literal.get(node);
        }

        if (isSdsArgument(node)) {
            expression = Argument.get(node);
        }

        if (isSdsMemberAccess(node)) {
            expression = MemberAccess.get(node);
        }

        if (isSdsIndexedAccess(node)) {
            expression = IndexedAccess.get(node);
        }

        if (isSdsReference(node)) {
            expression = getReference(node);
        }

        if (isSdsCall(node)) {
            return Call.get(node);
        }

        if (isSdsLambda(node)) {
            expression = Lambda.get(node);
        }

        if (isSdsInfixOperation(node)) {
            expression = InfixOperation.get(node);
        }

        if (isSdsPrefixOperation(node)) {
            expression = PrefixOperation.get(node);
        }

        if (isSdsTypeCast(node)) {
            expression = TypeCast.get(node);
        }

        if (isSdsParenthesizedExpression(node)) {
            expression = ParenthesizedExpression.get(node);
        }

        if (isSdsTemplateString(node)) {
            expression = Literal.default();
            // Todo: Handle Template Strings
        }

        if (!expression) {
            Utils.pushError(
                Expression.LOGGING_TAG,
                `Unexpected node type <${node.$type}>`,
            );
        }

        return new GenericExpression(expression!);
    }
}
