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

/* c8 ignore start */
export type ParameterSubstitutions = Map<SdsParameter, SimplifiedExpression | undefined>;
export type ResultSubstitutions = Map<SdsAbstractResult, SimplifiedExpression | undefined>;

export abstract class SimplifiedExpression {
    /**
     * Removes any unnecessary containers from the expression.
     */
    unwrap(): SimplifiedExpression {
        return this;
    }
}

export abstract class IntermediateExpression extends SimplifiedExpression {}

export abstract class IntermediateCallable extends IntermediateExpression {}

export class IntermediateBlockLambda extends IntermediateCallable {
    constructor(
        readonly parameters: SdsParameter[],
        readonly results: SdsBlockLambdaResult[],
        readonly substitutionsOnCreation: ParameterSubstitutions,
    ) {
        super();
    }
}

export class IntermediateExpressionLambda extends IntermediateCallable {
    constructor(
        readonly parameters: SdsParameter[],
        readonly result: SdsExpression,
        readonly substitutionsOnCreation: ParameterSubstitutions,
    ) {
        super();
    }
}

export class IntermediateStep extends IntermediateCallable {
    constructor(
        readonly parameters: SdsParameter[],
        readonly results: SdsResult[],
    ) {
        super();
    }
}

export class IntermediateRecord extends IntermediateExpression {
    constructor(readonly resultSubstitutions: ResultSubstitutions) {
        super();
    }

    getSubstitutionByReferenceOrNull(reference: SdsReference): SimplifiedExpression | null {
        const referencedDeclaration = reference.target;
        if (!isSdsAbstractResult(referencedDeclaration)) {
            return null;
        }

        return this.resultSubstitutions.get(referencedDeclaration) ?? null;
    }

    getSubstitutionByIndexOrNull(index: number | null): SimplifiedExpression | null {
        if (index === null) {
            return null;
        }
        return Array.from(this.resultSubstitutions.values())[index] ?? null;
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

    override toString(): string {
        const entryString = Array.from(this.resultSubstitutions, ([result, value]) => `${result.name}=${value}`).join(
            ', ',
        );
        return `{${entryString}}`;
    }
}

export class IntermediateVariadicArguments extends IntermediateExpression {
    constructor(readonly arguments_: (SimplifiedExpression | null)[]) {
        super();
    }

    getArgumentByIndexOrNull(index: number | null): SimplifiedExpression | null {
        if (index === null) {
            return null;
        }
        return this.arguments_[index] ?? null;
    }
}

export abstract class ConstantExpression extends SimplifiedExpression {
    abstract equals(other: ConstantExpression): boolean;

    abstract override toString(): string;

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

    equals(other: ConstantExpression): boolean {
        return other instanceof ConstantBoolean && this.value === other.value;
    }

    toString(): string {
        return this.value.toString();
    }
}

export class ConstantEnumVariant extends ConstantExpression {
    constructor(readonly value: SdsEnumVariant) {
        super();
    }

    equals(other: ConstantExpression): boolean {
        return other instanceof ConstantEnumVariant && this.value === other.value;
    }

    toString(): string {
        return this.value.name;
    }
}

export abstract class ConstantNumber extends ConstantExpression {}

export class ConstantFloat extends ConstantNumber {
    constructor(readonly value: number) {
        super();
    }

    equals(other: ConstantExpression): boolean {
        return other instanceof ConstantFloat && this.value === other.value;
    }

    toString(): string {
        return this.value.toString();
    }
}

export class ConstantInt extends ConstantNumber {
    constructor(readonly value: bigint) {
        super();
    }

    equals(other: ConstantExpression): boolean {
        return other instanceof ConstantInt && this.value === other.value;
    }

    toString(): string {
        return this.value.toString();
    }
}

class ConstantNullClass extends ConstantExpression {
    equals(other: ConstantExpression): boolean {
        return other instanceof ConstantNullClass;
    }

    toString(): string {
        return 'null';
    }
}

export const ConstantNull = new ConstantNullClass();

export class ConstantString extends ConstantExpression {
    constructor(readonly value: string) {
        super();
    }

    equals(other: ConstantExpression): boolean {
        return other instanceof ConstantString && this.value === other.value;
    }

    toString(): string {
        return `"${this.value}"`;
    }

    override toInterpolationString(): string {
        return this.value;
    }
}

/* c8 ignore stop */
