import { isSdsLiteral, SdsArgument } from '../../generated/ast.js';
import { CustomError } from '../global.js';
import { Call } from './call.js';
import { Placeholder } from './placeholder.js';
import { Expression, GenericExpression } from './expression.js';
import { Parameter } from './parameter.js';
import { Parser } from './parser.js';

export class Argument {
    constructor(
        public readonly text: string,
        public readonly reference: GenericExpression | Call | Placeholder | Parameter | undefined,
        public readonly parameterName?: string,
    ) {}

    public static parse(node: SdsArgument, parser: Parser) {
        if (!node.value.$cstNode) return parser.pushError('CstNode missing', node.value);
        const text = node.value.$cstNode.text;

        let expression;
        if (!isSdsLiteral(node.value)) expression = Expression.parse(node.value, parser);
        if (expression instanceof CustomError) return expression;

        if (node.parameter && !node.parameter.ref) return parser.pushError('Missing Parameterreference', node);
        const parameterName = node.parameter?.ref?.name;

        return new Argument(text, expression, parameterName);
    }
}
