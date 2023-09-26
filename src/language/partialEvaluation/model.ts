import {
    SdsAbstractResult,
    SdsBlockLambdaResult,
    SdsEnumVariant,
    SdsExpression,
    SdsParameter,
    SdsResult,
} from '../generated/ast.js';

/* c8 ignore start */
type ParameterSubstitutions = Map<SdsParameter, SdsSimplifiedExpression | undefined>;
type ResultSubstitutions = Map<SdsAbstractResult, SdsSimplifiedExpression | undefined>;

type SdsSimplifiedExpression = SdsIntermediateExpression | SdsConstantExpression;

type SdsIntermediateExpression = SdsIntermediateCallable | SdsIntermediateRecord;

type SdsIntermediateCallable = SdsIntermediateBlockLambda | SdsIntermediateExpressionLambda | SdsIntermediateStep;

class SdsIntermediateBlockLambda {
    constructor(
        readonly parameters: SdsParameter[],
        readonly results: SdsBlockLambdaResult[],
        readonly substitutionsOnCreation: ParameterSubstitutions,
    ) {}
}

class SdsIntermediateExpressionLambda {
    constructor(
        readonly parameters: SdsParameter[],
        readonly result: SdsExpression,
        readonly substitutionsOnCreation: ParameterSubstitutions,
    ) {}
}

class SdsIntermediateStep {
    constructor(
        readonly parameters: SdsParameter[],
        readonly results: SdsResult[],
    ) {}
}

class SdsIntermediateRecord {
    constructor(readonly resultSubstitutions: ResultSubstitutions) {}

    // getSubstitutionByReferenceOrUndefined(reference: SdsReference): SdsSimplifiedExpression | undefined {
    //     if (!isSdsAbstractResult(reference.declaration)) {
    //         return undefined;
    //     }
    //
    //
    //
    //     const result = reference.declaration as SdsAbstractResult;
    // }
}

// internal class SdsIntermediateRecord(
//     resultSubstitutions: List<Pair<SdsAbstractResult, SdsSimplifiedExpression?>>
// ) : SdsIntermediateExpression {
// private val resultSubstitutions = resultSubstitutions.toMap()
//
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
//
//     /**
//      * If the record contains exactly one substitution its value is returned. Otherwise, it returns `this`.
//      */
//     fun unwrap(): SdsSimplifiedExpression? {
//         return when (resultSubstitutions.size) {
//         1 -> resultSubstitutions.values.first()
// else -> this
// }
// }
//
//     override fun toString(): String {
//         return resultSubstitutions.entries.joinToString(prefix = "{", postfix = "}") { (result, value) ->
//             "${result.name}=$value"
//         }
//     }
// }
//
// data class SdsIntermediateVariadicArguments(
//     private val arguments: List<SdsSimplifiedExpression?>
// ) : SdsSimplifiedExpression {
//     fun getArgumentByIndexOrNull(index: Int?): SdsSimplifiedExpression? {
//         if (index == null) {
//         return null
//     }
//     return arguments.getOrNull(index)
// }
// }

export type SdsConstantExpression =
    | SdsConstantBoolean
    | SdsConstantEnumVariant
    | SdsConstantNumber
    | SdsConstantNull
    | SdsConstantString;

class SdsConstantBoolean {
    constructor(readonly value: boolean) {}

    equals(other: SdsConstantExpression): boolean {
        return other instanceof SdsConstantBoolean && this.value === other.value;
    }

    toString(): string {
        return this.value.toString();
    }
}

class SdsConstantEnumVariant {
    constructor(readonly value: SdsEnumVariant) {}

    equals(other: SdsConstantExpression): boolean {
        return other instanceof SdsConstantEnumVariant && this.value === other.value;
    }

    toString(): string {
        return this.value.name;
    }
}

type SdsConstantNumber = SdsConstantFloat | SdsConstantInt;

class SdsConstantFloat {
    constructor(readonly value: number) {}

    equals(other: SdsConstantExpression): boolean {
        return other instanceof SdsConstantFloat && this.value === other.value;
    }

    toString(): string {
        return this.value.toString();
    }
}

class SdsConstantInt {
    constructor(readonly value: bigint) {}

    equals(other: SdsConstantExpression): boolean {
        return other instanceof SdsConstantInt && this.value === other.value;
    }

    toString(): string {
        return this.value.toString();
    }
}

class SdsConstantNull {
    equals(other: SdsConstantExpression): boolean {
        return other instanceof SdsConstantNull;
    }

    toString(): string {
        return 'null';
    }
}

class SdsConstantString {
    constructor(readonly value: string) {}

    equals(other: SdsConstantExpression): boolean {
        return other instanceof SdsConstantString && this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}
/* c8 ignore stop */
