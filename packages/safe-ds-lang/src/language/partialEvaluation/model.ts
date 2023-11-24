import { type NamedAstNode, stream } from 'langium';
import { isEmpty } from '../../helpers/collectionUtils.js';
import {
    isSdsAbstractResult,
    type SdsAbstractResult,
    type SdsBlockLambda,
    type SdsBlockLambdaResult,
    type SdsCallable,
    type SdsDeclaration,
    type SdsEnumVariant,
    type SdsExpression,
    type SdsExpressionLambda,
    type SdsParameter,
    type SdsReference,
} from '../generated/ast.js';
import { getParameters, streamBlockLambdaResults } from '../helpers/nodeProperties.js';

export type ParameterSubstitutions = Map<SdsParameter, EvaluatedNode>;
export type ResultSubstitutions = Map<SdsAbstractResult, EvaluatedNode>;

/**
 * A node that has been partially evaluated.
 */
export abstract class EvaluatedNode {
    /**
     * Whether the node could be evaluated completely.
     */
    abstract readonly isFullyEvaluated: boolean;

    /**
     * Returns whether the node is equal to another value.
     */
    abstract equals(other: unknown): boolean;

    /**
     * Returns the string representation of the node.
     */
    abstract toString(): string;

    /**
     * Removes any unnecessary containers from the node.
     */
    unwrap(): EvaluatedNode {
        return this;
    }
}

// -------------------------------------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------------------------------------

export abstract class Constant extends EvaluatedNode {
    override readonly isFullyEvaluated: boolean = true;

    /**
     * Returns the string representation of the constant if it occurs in a string template.
     */
    toInterpolationString(): string {
        return this.toString();
    }
}

export class BooleanConstant extends Constant {
    constructor(readonly value: boolean) {
        super();
    }

    override equals(other: unknown): boolean {
        return other instanceof BooleanConstant && this.value === other.value;
    }

    override toString(): string {
        return this.value.toString();
    }
}

export abstract class NumberConstant extends Constant {
    abstract readonly value: number | bigint;
}

export class FloatConstant extends NumberConstant {
    constructor(readonly value: number) {
        super();
    }

    override equals(other: unknown): boolean {
        return other instanceof FloatConstant && this.value === other.value;
    }

    override toString(): string {
        return this.value.toString();
    }
}

export class IntConstant extends NumberConstant {
    constructor(readonly value: bigint) {
        super();
    }

    override equals(other: unknown): boolean {
        return other instanceof IntConstant && this.value === other.value;
    }

    override toString(): string {
        return this.value.toString();
    }
}

class NullConstantClass extends Constant {
    override equals(other: unknown): boolean {
        return other instanceof NullConstantClass;
    }

    override toString(): string {
        return 'null';
    }
}

export const NullConstant = new NullConstantClass();

export class StringConstant extends Constant {
    constructor(readonly value: string) {
        super();
    }

    override equals(other: unknown): boolean {
        return other instanceof StringConstant && this.value === other.value;
    }

    override toString(): string {
        return `"${this.value}"`;
    }

    override toInterpolationString(): string {
        return this.value;
    }
}

export const isConstant = (node: EvaluatedNode): node is Constant => {
    return node instanceof Constant;
};

// -------------------------------------------------------------------------------------------------
// Callables
// -------------------------------------------------------------------------------------------------

export abstract class EvaluatedCallable<
    out T extends SdsCallable | SdsParameter = SdsCallable | SdsParameter,
> extends EvaluatedNode {
    abstract readonly callable: T;
    abstract readonly substitutionsOnCreation: ParameterSubstitutions;
    override readonly isFullyEvaluated: boolean = false;
}

export class BlockLambdaClosure extends EvaluatedCallable<SdsBlockLambda> {
    readonly results: SdsBlockLambdaResult[];

    constructor(
        override readonly callable: SdsBlockLambda,
        override readonly substitutionsOnCreation: ParameterSubstitutions,
    ) {
        super();
        this.results = streamBlockLambdaResults(callable).toArray();
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof BlockLambdaClosure)) {
            return false;
        }

        return (
            this.callable === other.callable &&
            substitutionsAreEqual(this.substitutionsOnCreation, other.substitutionsOnCreation)
        );
    }

    override toString(): string {
        return `$blockLambdaClosure`;
    }
}

export class ExpressionLambdaClosure extends EvaluatedCallable<SdsExpressionLambda> {
    readonly result: SdsExpression;

    constructor(
        override readonly callable: SdsExpressionLambda,
        override readonly substitutionsOnCreation: ParameterSubstitutions,
    ) {
        super();
        this.result = callable.result;
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof ExpressionLambdaClosure)) {
            return false;
        }

        return (
            this.callable === other.callable &&
            substitutionsAreEqual(this.substitutionsOnCreation, other.substitutionsOnCreation)
        );
    }

    override toString(): string {
        return '$expressionLambdaClosure';
    }
}

export class NamedCallable<T extends (SdsCallable & NamedAstNode) | SdsParameter> extends EvaluatedCallable<T> {
    override readonly isFullyEvaluated: boolean = false;
    override readonly substitutionsOnCreation: ParameterSubstitutions = new Map();

    constructor(override readonly callable: T) {
        super();
    }

    override equals(other: unknown): boolean {
        return other instanceof NamedCallable && this.callable === other.callable;
    }

    override toString(): string {
        return this.callable.name;
    }
}

// -------------------------------------------------------------------------------------------------
// Other
// -------------------------------------------------------------------------------------------------

export class EvaluatedEnumVariant extends EvaluatedNode {
    constructor(
        readonly variant: SdsEnumVariant,
        readonly args: ParameterSubstitutions | undefined,
    ) {
        super();
    }

    readonly hasBeenInstantiated = this.args !== undefined;

    override readonly isFullyEvaluated: boolean =
        isEmpty(getParameters(this.variant)) ||
        (this.args !== undefined && stream(this.args.values()).every(isFullyEvaluated));

    getArgumentValueByName(name: string): EvaluatedNode {
        if (!this.args) {
            return UnknownEvaluatedNode;
        }

        const parameter = getParameters(this.variant).find((it) => it.name === name);
        if (!parameter) {
            return UnknownEvaluatedNode;
        }

        return this.args.get(parameter) ?? UnknownEvaluatedNode;
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EvaluatedEnumVariant)) {
            return false;
        }

        return (
            this.variant === other.variant &&
            this.hasBeenInstantiated === other.hasBeenInstantiated &&
            substitutionsAreEqual(this.args, other.args)
        );
    }

    override toString(): string {
        if (!this.args) {
            return this.variant.name;
        } else {
            return `${this.variant.name}(${Array.from(this.args.values()).join(', ')})`;
        }
    }
}

export class EvaluatedList extends EvaluatedNode {
    constructor(readonly elements: EvaluatedNode[]) {
        super();
    }

    override readonly isFullyEvaluated: boolean = this.elements.every(isFullyEvaluated);

    /**
     * Returns the element at the given index. If the index is out of bounds, `UnknownEvaluatedNode` is returned.
     *
     * @param index The index of the element to look for.
     */
    getElementByIndex(index: number): EvaluatedNode {
        return this.elements[index] ?? UnknownEvaluatedNode;
    }

    /**
     * Returns the size of the list.
     */
    get size(): number {
        return this.elements.length;
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EvaluatedList)) {
            return false;
        }

        return (
            this.elements.length === other.elements.length && this.elements.every((e, i) => e.equals(other.elements[i]))
        );
    }

    override toString(): string {
        return `[${this.elements.join(', ')}]`;
    }
}

export class EvaluatedMap extends EvaluatedNode {
    constructor(readonly entries: EvaluatedMapEntry[]) {
        super();
    }

    override readonly isFullyEvaluated: boolean = this.entries.every(isFullyEvaluated);

    /**
     * Returns the last value for the given key. If the key does not occur in the map, `UnknownEvaluatedNode` is
     * returned.
     *
     * @param key The key to look for.
     */
    getLastValueForKey(key: EvaluatedNode): EvaluatedNode {
        return this.entries.findLast((it) => it.key.equals(key))?.value ?? UnknownEvaluatedNode;
    }

    /**
     * Returns whether the map contains the given key.
     *
     * @param key The key to look for.
     */
    has(key: EvaluatedNode): boolean {
        return this.entries.some((it) => it.key.equals(key));
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EvaluatedMap)) {
            return false;
        }

        return (
            this.entries.length === other.entries.length &&
            this.entries.every((entry, i) => entry.equals(other.entries[i]))
        );
    }

    override toString(): string {
        return `{${this.entries.join(', ')}}`;
    }
}

export class EvaluatedMapEntry extends EvaluatedNode {
    constructor(
        readonly key: EvaluatedNode,
        readonly value: EvaluatedNode,
    ) {
        super();
    }

    override readonly isFullyEvaluated: boolean = this.key.isFullyEvaluated && this.value.isFullyEvaluated;

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EvaluatedMapEntry)) {
            return false;
        }

        return this.key.equals(other.key) && this.value.equals(other.value);
    }

    override toString(): string {
        return `${this.key}: ${this.value}`;
    }
}

/**
 * A named tuple is a record that contains a mapping from result declarations to their values. It is used to represent
 * the result of a call to a block lambda or a segment.
 */
export class EvaluatedNamedTuple extends EvaluatedNode {
    constructor(readonly entries: ResultSubstitutions) {
        super();
    }

    override readonly isFullyEvaluated: boolean = stream(this.entries.values()).every(isFullyEvaluated);

    /**
     * Returns the substitution for the target of the given reference. If the target of the reference does not occur in
     * the map, `UnknownEvaluatedNode` is returned.
     *
     * @param reference A reference to the result to look for.
     */
    getSubstitutionByReference(reference: SdsReference): EvaluatedNode {
        const referencedDeclaration = reference.target.ref;
        if (!isSdsAbstractResult(referencedDeclaration)) {
            return UnknownEvaluatedNode;
        }

        return this.entries.get(referencedDeclaration) ?? UnknownEvaluatedNode;
    }

    /**
     * Returns the substitution at the given index. If the index is out of bounds, `UnknownEvaluatedNode` is returned.
     *
     * @param index The index of the substitution to look for.
     */
    getSubstitutionByIndex(index: number): EvaluatedNode {
        return Array.from(this.entries.values())[index] ?? UnknownEvaluatedNode;
    }

    /**
     * If the record contains exactly one substitution its value is returned. Otherwise, it returns `this`.
     */
    override unwrap(): EvaluatedNode {
        if (this.entries.size === 1) {
            return this.entries.values().next().value;
        } else {
            return this;
        }
    }

    override equals(other: unknown): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EvaluatedNamedTuple)) {
            return false;
        }

        return substitutionsAreEqual(this.entries, other.entries);
    }

    override toString(): string {
        const entryString = Array.from(this.entries, ([result, value]) => `${result.name} = ${value}`).join(', ');
        return `(${entryString})`;
    }
}

class UnknownEvaluatedNodeClass extends EvaluatedNode {
    override readonly isFullyEvaluated: boolean = false;

    override equals(other: unknown): boolean {
        return other instanceof UnknownEvaluatedNodeClass;
    }

    override toString(): string {
        return '?';
    }
}

export const UnknownEvaluatedNode = new UnknownEvaluatedNodeClass();

// -------------------------------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------------------------------

const isFullyEvaluated = (node: EvaluatedNode): boolean => {
    return node.isFullyEvaluated;
};

export const substitutionsAreEqual = (
    a: Map<SdsDeclaration, EvaluatedNode> | undefined,
    b: Map<SdsDeclaration, EvaluatedNode> | undefined,
): boolean => {
    if (a?.size !== b?.size) {
        return false;
    }

    const aEntries = Array.from(a?.entries() ?? []);
    const bEntries = Array.from(b?.entries() ?? []);

    return aEntries.every(([aEntry, aValue], i) => {
        const [bEntry, bValue] = bEntries[i]!;
        return aEntry === bEntry && aValue.equals(bValue);
    });
};
