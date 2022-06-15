package com.larsreimann.safeds.staticAnalysis.partialEvaluation

import com.larsreimann.safeds.safeDS.SdsAbstractExpression
import com.larsreimann.safeds.safeDS.SdsAbstractResult
import com.larsreimann.safeds.safeDS.SdsBlockLambdaResult
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.safeDS.SdsResult

typealias ParameterSubstitutions = Map<SdsParameter, SdsSimplifiedExpression?>

sealed interface SdsSimplifiedExpression

internal sealed interface SdsIntermediateExpression : SdsSimplifiedExpression

internal sealed interface SdsIntermediateCallable : SdsIntermediateExpression {
    val parameters: List<SdsParameter>
}

internal data class SdsIntermediateBlockLambda(
    override val parameters: List<SdsParameter>,
    val results: List<SdsBlockLambdaResult>,
    val substitutionsOnCreation: ParameterSubstitutions
) : SdsIntermediateCallable

internal data class SdsIntermediateExpressionLambda(
    override val parameters: List<SdsParameter>,
    val result: SdsAbstractExpression,
    val substitutionsOnCreation: ParameterSubstitutions
) : SdsIntermediateCallable

internal data class SdsIntermediateStep(
    override val parameters: List<SdsParameter>,
    val results: List<SdsResult>
) : SdsIntermediateCallable

internal class SdsIntermediateRecord(
    resultSubstitutions: List<Pair<SdsAbstractResult, SdsSimplifiedExpression?>>
) : SdsIntermediateExpression {
    private val resultSubstitutions = resultSubstitutions.toMap()

    fun getSubstitutionByReferenceOrNull(reference: SdsReference): SdsSimplifiedExpression? {
        val result = reference.declaration as? SdsAbstractResult ?: return null
        return resultSubstitutions[result]
    }

    fun getSubstitutionByIndexOrNull(index: Int?): SdsSimplifiedExpression? {
        if (index == null) {
            return null
        }
        return resultSubstitutions.values.toList().getOrNull(index)
    }

    /**
     * If the record contains exactly one substitution its value is returned. Otherwise, it returns `this`.
     */
    fun unwrap(): SdsSimplifiedExpression? {
        return when (resultSubstitutions.size) {
            1 -> resultSubstitutions.values.first()
            else -> this
        }
    }

    override fun toString(): String {
        return resultSubstitutions.entries.joinToString(prefix = "{", postfix = "}") { (result, value) ->
            "${result.name}=$value"
        }
    }
}

data class SdsIntermediateVariadicArguments(
    private val arguments: List<SdsSimplifiedExpression?>
) : SdsSimplifiedExpression {
    fun getArgumentByIndexOrNull(index: Int?): SdsSimplifiedExpression? {
        if (index == null) {
            return null
        }
        return arguments.getOrNull(index)
    }
}

sealed interface SdsConstantExpression : SdsSimplifiedExpression

data class SdsConstantBoolean(val value: Boolean) : SdsConstantExpression {
    override fun toString(): String = value.toString()
}

data class SdsConstantEnumVariant(val value: SdsEnumVariant) : SdsConstantExpression {
    override fun toString(): String = value.name
}

sealed class SdsConstantNumber : SdsConstantExpression {
    abstract val value: Number
}

data class SdsConstantFloat(override val value: Double) : SdsConstantNumber() {
    override fun toString(): String = value.toString()
}

data class SdsConstantInt(override val value: Int) : SdsConstantNumber() {
    override fun toString(): String = value.toString()
}

object SdsConstantNull : SdsConstantExpression {
    override fun toString(): String = "null"
}

data class SdsConstantString(val value: String) : SdsConstantExpression {
    override fun toString(): String = value
}
