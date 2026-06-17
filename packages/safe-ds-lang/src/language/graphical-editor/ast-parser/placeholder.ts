import { SdsPlaceholder } from '../../generated/ast.js';
import { Parser } from './parser.js';

export class Placeholder {
    private constructor(
        public readonly name: string,
        public type: string,
        public readonly uniquePath: string,
    ) {}

    public static parse(node: SdsPlaceholder, parser: Parser) {
        const match = parser.graph.placeholderList.find((placeholder) => placeholder.name === node.name);
        if (match) return match;

        const placeholder = new Placeholder(node.name, parser.computeType(node).toString(), parser.getUniquePath(node));
        parser.graph.placeholderList.push(placeholder);
        return placeholder;
    }
}
