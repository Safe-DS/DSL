import { stream } from 'langium';
import { isEmpty } from '../../helpers/collectionUtils.js';
import {
    isSdsAbstractResult,
    SdsAbstractResult,
    SdsBlockLambdaResult,
    SdsEnumVariant,
    SdsExpression,
    SdsParameter,
    SdsReference,
    SdsResult,
} from '../generated/ast.js';
import { getParameters } from '../helpers/nodeProperties.js';

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
     * Returns whether the node is equal to another node.
     */
    abstract equals(other: EvaluatedNode): boolean;

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

    override equals(other: EvaluatedNode): boolean {
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

    override equals(other: EvaluatedNode): boolean {
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

    override equals(other: EvaluatedNode): boolean {
        return other instanceof IntConstant && this.value === other.value;
    }

    override toString(): string {
        return this.value.toString();
    }
}

class NullConstantClass extends Constant {
    override equals(other: EvaluatedNode): boolean {
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

    override equals(other: EvaluatedNode): boolean {
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
// Closures
// -------------------------------------------------------------------------------------------------

export abstract class Closure extends EvaluatedNode {
    override readonly isFullyEvaluated: boolean = false;
    abstract readonly substitutionsOnCreation: ParameterSubstitutions;
}

export class BlockLambdaClosure extends Closure {
    constructor(
        override readonly substitutionsOnCreation: ParameterSubstitutions,
        readonly results: SdsBlockLambdaResult[],
    ) {
        super();
    }

    override equals(other: EvaluatedNode): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof BlockLambdaClosure)) {
            return false;
        }

        // TODO
        return false;
    }

    override toString(): string {
        return `$BlockLambdaClosure`;
    }
}

export class ExpressionLambdaClosure extends Closure {
    constructor(
        override readonly substitutionsOnCreation: ParameterSubstitutions,
        readonly result: SdsExpression,
    ) {
        super();
    }

    override equals(other: EvaluatedNode): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof ExpressionLambdaClosure)) {
            return false;
        }

        // TODO
        return false;
    }

    override toString(): string {
        // TODO
        return '$ExpressionLambdaClosure';
    }
}

export class SegmentClosure extends Closure {
    override readonly substitutionsOnCreation = new Map<SdsParameter, EvaluatedNode>();

    constructor(readonly results: SdsResult[]) {
        super();
    }

    override equals(other: EvaluatedNode): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof SegmentClosure)) {
            return false;
        }

        // TODO
        return false;
    }

    override toString(): string {
        return `$SegmentClosure`;
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

    override equals(other: EvaluatedNode): boolean {
        return other instanceof EvaluatedEnumVariant && this.variant === other.variant;
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

    override equals(other: EvaluatedNode): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EvaluatedList)) {
            return false;
        } else if (other.elements.length !== this.elements.length) {
            return false;
        }

        return this.elements.every((e, i) => e.equals(other.elements[i]));
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

    override equals(other: EvaluatedNode): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EvaluatedMap)) {
            return false;
        } else if (other.entries.length !== this.entries.length) {
            return false;
        }

        return this.entries.every((e, i) => e.equals(other.entries[i]));
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

    override equals(other: EvaluatedNode): boolean {
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

export class EvaluatedNamedTuple extends EvaluatedNode {
    constructor(readonly entries: ResultSubstitutions) {
        super();
    }

    override readonly isFullyEvaluated: boolean = stream(this.entries.values()).every(isFullyEvaluated);

    getSubstitutionByReference(reference: SdsReference): EvaluatedNode | undefined {
        const referencedDeclaration = reference.target;
        if (!isSdsAbstractResult(referencedDeclaration)) {
            return undefined;
        }

        return this.entries.get(referencedDeclaration) ?? undefined;
    }

    getSubstitutionByIndex(index: number | undefined): EvaluatedNode | undefined {
        if (index === undefined) {
            return undefined;
        }
        return Array.from(this.entries.values())[index] ?? undefined;
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

    override equals(other: EvaluatedNode): boolean {
        if (other === this) {
            return true;
        } else if (!(other instanceof EvaluatedNamedTuple)) {
            return false;
        } else if (other.entries.size !== this.entries.size) {
            return false;
        }

        // TODO

        return true;
    }

    override toString(): string {
        const entryString = Array.from(this.entries, ([result, value]) => `${result.name} = ${value}`).join(', ');
        return `(${entryString})`;
    }
}

class UnknownEvaluatedNodeClass extends EvaluatedNode {
    override readonly isFullyEvaluated: boolean = false;

    override equals(other: EvaluatedNode): boolean {
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
