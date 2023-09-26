import {
    SdsAbstractResult,
    SdsBlockLambdaResult,
    SdsEnumVariant,
    SdsExpression,
    SdsParameter,
    SdsResult,
} from '../generated/ast.js';

/* c8 ignore start */
export type ParameterSubstitutions = Map<SdsParameter, SdsSimplifiedExpression | undefined>;
export type ResultSubstitutions = Map<SdsAbstractResult, SdsSimplifiedExpression | undefined>;

export abstract class SdsSimplifiedExpression {
    /**
     * Removes any unnecessary containers from the expression.
     */
    unwrap(): SdsSimplifiedExpression {
        return this;
    }
}

export abstract class SdsIntermediateExpression extends SdsSimplifiedExpression {}

export abstract class SdsIntermediateCallable extends SdsIntermediateExpression {}

export class SdsIntermediateBlockLambda extends SdsIntermediateCallable {
    constructor(
        readonly parameters: SdsParameter[],
        readonly results: SdsBlockLambdaResult[],
        readonly substitutionsOnCreation: ParameterSubstitutions,
    ) {
        super();
    }
}

export class SdsIntermediateExpressionLambda extends SdsIntermediateCallable {
    constructor(
        readonly parameters: SdsParameter[],
        readonly result: SdsExpression,
        readonly substitutionsOnCreation: ParameterSubstitutions,
    ) {
        super();
    }
}

export class SdsIntermediateStep extends SdsIntermediateCallable {
    constructor(
        readonly parameters: SdsParameter[],
        readonly results: SdsResult[],
    ) {
        super();
    }
}

export class SdsIntermediateRecord extends SdsIntermediateExpression {
    constructor(readonly resultSubstitutions: ResultSubstitutions) {
        super();
    }

    //     fun getSubstitutionByReferenceOrNull(reference: SdsReference): SdsSimplifiedExpression? {
    //             val result = reference.declaration as? SdsAbstractResult ?: return null
    //             return resultSubstitutions[result]
    //         }
    //
    //         fun getSubstitutionByIndexOrNull(index: Int?): SdsSimplifiedExpression? {
    //         if (index == null) {
    //         return null
    //     }
    //     return resultSubstitutions.values.toList().getOrNull(index)
    // }
    // }

    /**
     * If the record contains exactly one substitution its value is returned. Otherwise, it returns `this`.
     */
    override unwrap(): SdsSimplifiedExpression {
        if (this.resultSubstitutions.size === 1) {
            return this.resultSubstitutions.values().next().value;
        } else {
            return this;
        }
    }

    //     override fun toString(): String {
    //         return resultSubstitutions.entries.joinToString(prefix = "{", postfix = "}") { (result, value) ->
    //             "${result.name}=$value"
    //         }
    //     }
}

export class SdsIntermediateVariadicArguments extends SdsIntermediateExpression {
    constructor(readonly arguments_: (SdsSimplifiedExpression | null)[]) {
        super();
    }

    getArgumentByIndexOrNull(index: number | null): SdsSimplifiedExpression | null {
        if (index === null) {
            return null;
        }
        return this.arguments_[index] ?? null;
    }
}

export abstract class SdsConstantExpression extends SdsSimplifiedExpression {
    abstract equals(other: SdsConstantExpression): boolean;

    abstract override toString(): string;
}

export class SdsConstantBoolean extends SdsConstantExpression {
    constructor(readonly value: boolean) {
        super();
    }

    equals(other: SdsConstantExpression): boolean {
        return other instanceof SdsConstantBoolean && this.value === other.value;
    }

    toString(): string {
        return this.value.toString();
    }
}

export class SdsConstantEnumVariant extends SdsConstantExpression {
    constructor(readonly value: SdsEnumVariant) {
        super();
    }

    equals(other: SdsConstantExpression): boolean {
        return other instanceof SdsConstantEnumVariant && this.value === other.value;
    }

    toString(): string {
        return this.value.name;
    }
}

export abstract class SdsConstantNumber extends SdsConstantExpression {}

export class SdsConstantFloat extends SdsConstantNumber {
    constructor(readonly value: number) {
        super();
    }

    equals(other: SdsConstantExpression): boolean {
        return other instanceof SdsConstantFloat && this.value === other.value;
    }

    toString(): string {
        return this.value.toString();
    }
}

export class SdsConstantInt extends SdsConstantNumber {
    constructor(readonly value: bigint) {
        super();
    }

    equals(other: SdsConstantExpression): boolean {
        return other instanceof SdsConstantInt && this.value === other.value;
    }

    toString(): string {
        return this.value.toString();
    }
}

export class SdsConstantNull extends SdsConstantExpression {
    equals(other: SdsConstantExpression): boolean {
        return other instanceof SdsConstantNull;
    }

    toString(): string {
        return 'null';
    }
}

export class SdsConstantString extends SdsConstantExpression {
    constructor(readonly value: string) {
        super();
    }

    equals(other: SdsConstantExpression): boolean {
        return other instanceof SdsConstantString && this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}

/* c8 ignore stop */
