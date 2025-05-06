import { SdsParameter } from '../../generated/ast.js';
import { Parser } from './parser.js';

export class Parameter {
    private constructor(
        public readonly name: string,
        public readonly isConstant: boolean,
        public readonly type: string,
        public argumentText?: string,
        public readonly defaultValue?: string,
    ) {}

    public static parse(node: SdsParameter, parser: Parser) {
        const name = node.name;
        const isConstant = node.isConstant;

        if (!node.type) return parser.pushError('Undefined Type', node);
        const type = parser.computeType(node).toString();

        const defaultValue = node.defaultValue?.$cstNode?.text;

        return new Parameter(name, isConstant, type, undefined, defaultValue);
    }
}
