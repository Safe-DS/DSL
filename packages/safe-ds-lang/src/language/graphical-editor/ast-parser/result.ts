import { SdsResult } from '../../generated/ast.js';
import { Parser } from './parser.js';

export class Result {
    constructor(
        public readonly name: string,
        public type: string,
    ) {}

    public static parse(node: SdsResult, parser: Parser) {
        const name = node.name;

        if (!node.type) return parser.pushError('Undefined Type', node);
        const type = parser.computeType(node).toString();

        return new Result(name, type);
    }
}
