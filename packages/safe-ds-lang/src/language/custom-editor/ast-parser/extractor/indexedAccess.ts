import { SdsIndexedAccess } from "../../../generated/ast.js";
import { Expression, GenericExpression } from "../parser/expression.js";
import { displayCombo } from "../utils.js";

import { Call } from "./call.js";

export class IndexedAccess {
    public static readonly LOGGING_TAG =
        "CustomEditor] [AstParser] [IndexedAccess";

    private constructor(
        public readonly index: GenericExpression | Call,
        public readonly receiver: GenericExpression | Call,
        private readonly text?: string,
    ) {}

    public static get(node: SdsIndexedAccess): IndexedAccess {
        const index = Expression.get(node.index);
        const receiver = Expression.get(node.receiver);
        return new IndexedAccess(index, receiver, node.$cstNode?.text);
    }

    public toString(): string {
        return `${displayCombo(this.receiver)}[${displayCombo(this.index)}]`;
    }
}
