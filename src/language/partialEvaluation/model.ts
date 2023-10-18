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

export type PartialEvaluationResult = SimplifiedExpression | undefined;
export type ParameterSubstitutions = Map<SdsParameter, PartialEvaluationResult>;
export type ResultSubstitutions = Map<SdsAbstractResult, PartialEvaluationResult>;

export abstract class SimplifiedExpression {
    abstract equals(other: SimplifiedExpression): boolean;

    abstract toString(): string;

    /**
     * Removes any unnecessary containers from the expression.
     */
    unwrap(): SimplifiedExpression {
        return this;
    }
}

// -------------------------------------------------------------------------------------------------
// Constant expressions
// -------------------------------------------------------------------------------------------------

export abstract class ConstantExpression extends SimplifiedExpression {
    /**
     * Returns the string representation of the constant expression if it occurs in a string template.
     */
    toInterpolationString(): string {
        return this.toString();
    }
}

export class ConstantBoolean extends ConstantExpression {
    constructor(readonly value: boolean) {
        super();
    }

    override equals(other: ConstantExpression): boolean {
        return other instanceof ConstantBoolean && this.value === other.value;
    }

    override toString(): string {
        return this.value.toString();
    }
}

export class ConstantEnumVariant extends ConstantExpression {
    constructor(readonly value: SdsEnumVariant) {
        super();
    }

    override equals(other: ConstantExpression): boolean {
        return other instanceof ConstantEnumVariant && this.value === other.value;
    }

    override toString(): string {
        return this.value.name;
    }
}

export abstract class ConstantNumber extends ConstantExpression {}

export class ConstantFloat extends ConstantNumber {
    constructor(readonly value: number) {
        super();
    }

    override equals(other: ConstantExpression): boolean {
        return other instanceof ConstantFloat && this.value === other.value;
    }

    override toString(): string {
        return this.value.toString();
    }
}

export class ConstantInt extends ConstantNumber {
    constructor(readonly value: bigint) {
        super();
    }

    override equals(other: ConstantExpression): boolean {
        return other instanceof ConstantInt && this.value === other.value;
    }

    override toString(): string {
        return this.value.toString();
    }
}

export class ConstantList extends ConstantExpression {
    constructor(readonly elements: ConstantExpression[]) {
        super();
    }

    override equals(other: ConstantExpression): boolean {
        return other instanceof ConstantList && this.elements.every((e, i) => e.equals(other.elements[i]));
    }

    override toString(): string {
        return `[${this.elements.join(', ')}]`;
    }
}

export class ConstantMap extends ConstantExpression {
    constructor(readonly entries: ConstantMapEntry[]) {
        super();
    }

    override equals(other: ConstantExpression): boolean {
        return other instanceof ConstantMap && this.entries.every((e, i) => e.equals(other.entries[i]));
    }

    override toString(): string {
        return `{${this.entries.join(', ')}}`;
    }
}

export class ConstantMapEntry extends ConstantExpression {
    constructor(
        readonly key: ConstantExpression,
        readonly value: ConstantExpression,
    ) {
        super();
    }

    override equals(other: ConstantMapEntry): boolean {
        return this.key.equals(other.key) && this.value.equals(other.value);
    }

    override toString(): string {
        return `${this.key}: ${this.value}`;
    }
}

class ConstantNullClass extends ConstantExpression {
    override equals(other: ConstantExpression): boolean {
        return other instanceof ConstantNullClass;
    }

    override toString(): string {
        return 'null';
    }
}

export const ConstantNull = new ConstantNullClass();

export class ConstantString extends ConstantExpression {
    constructor(readonly value: string) {
        super();
    }

    override equals(other: ConstantExpression): boolean {
        return other instanceof ConstantString && this.value === other.value;
    }

    override toString(): string {
        return `"${this.value}"`;
    }

    override toInterpolationString(): string {
        return this.value;
    }
}

export const isConstantExpression = (result: PartialEvaluationResult): result is ConstantExpression => {
    return result instanceof ConstantExpression;
}

// -------------------------------------------------------------------------------------------------
// Partially bound expressions
// -------------------------------------------------------------------------------------------------

export abstract class PartiallyBoundExpression extends SimplifiedExpression {}

export abstract class PartiallyBoundCallable extends PartiallyBoundExpression {
    abstract readonly parameters: SdsParameter[];
    abstract readonly substitutionsOnCreation: ParameterSubstitutions;
}

export class PartiallyBoundBlockLambda extends PartiallyBoundCallable {
    constructor(
        override readonly parameters: SdsParameter[],
        readonly results: SdsBlockLambdaResult[],
        override readonly substitutionsOnCreation: ParameterSubstitutions,
    ) {
        super();
    }

    override equals(_other: SimplifiedExpression): boolean {
        // TODO
        return false
    }

    override toString(): string {
        // TODO
        return '';
    }
}

export class PartiallyBoundExpressionLambda extends PartiallyBoundCallable {
    constructor(
        override readonly parameters: SdsParameter[],
        readonly result: SdsExpression,
        override readonly substitutionsOnCreation: ParameterSubstitutions,
    ) {
        super();
    }

    override equals(_other: SimplifiedExpression): boolean {
        // TODO
        return false
    }

    override toString(): string {
        // TODO
        return '';
    }
}

export class PartiallyBoundSegment extends PartiallyBoundCallable {
    override readonly substitutionsOnCreation = new Map<SdsParameter, PartialEvaluationResult>();

    constructor(
        override readonly parameters: SdsParameter[],
        readonly results: SdsResult[],
    ) {
        super();
    }

    override equals(_other: SimplifiedExpression): boolean {
        // TODO
        return false
    }

    override toString(): string {
        // TODO
        return '';
    }
}

export class PartiallyBoundNamedTuple extends PartiallyBoundExpression {
    constructor(readonly resultSubstitutions: ResultSubstitutions) {
        super();
    }

    getSubstitutionByReference(reference: SdsReference): PartialEvaluationResult | undefined {
        const referencedDeclaration = reference.target;
        if (!isSdsAbstractResult(referencedDeclaration)) {
            return undefined;
        }

        return this.resultSubstitutions.get(referencedDeclaration) ?? undefined;
    }

    getSubstitutionByIndex(index: number | undefined): PartialEvaluationResult | undefined {
        if (index === undefined) {
            return undefined;
        }
        return Array.from(this.resultSubstitutions.values())[index] ?? undefined;
    }

    /**
     * If the record contains exactly one substitution its value is returned. Otherwise, it returns `this`.
     */
    override unwrap(): SimplifiedExpression {
        if (this.resultSubstitutions.size === 1) {
            return this.resultSubstitutions.values().next().value;
        } else {
            return this;
        }
    }

    override equals(other: SimplifiedExpression): boolean {
        if (other === this) {
            return true;
        }

        if (!(other instanceof PartiallyBoundNamedTuple)) {
            return false;
        }

        if (other.resultSubstitutions.size !== this.resultSubstitutions.size) {
            return false;
        }

        // TODO

        return true;
    }

    override toString(): string {
        const entryString = Array.from(this.resultSubstitutions, ([result, value]) => `${result.name}=${value}`).join(
            ', ',
        );
        return `{${entryString}}`;
    }
}
