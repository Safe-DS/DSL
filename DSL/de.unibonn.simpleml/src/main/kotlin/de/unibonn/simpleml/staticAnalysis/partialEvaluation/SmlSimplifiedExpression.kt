package de.unibonn.simpleml.staticAnalysis.partialEvaluation

import de.unibonn.simpleml.simpleML.SmlAbstractExpression
import de.unibonn.simpleml.simpleML.SmlAbstractResult
import de.unibonn.simpleml.simpleML.SmlBlockLambdaResult
import de.unibonn.simpleml.simpleML.SmlEnumVariant
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlReference
import de.unibonn.simpleml.simpleML.SmlResult

typealias ParameterSubstitutions = Map<SmlParameter, SmlSimplifiedExpression?>

sealed interface SmlSimplifiedExpression

internal sealed interface SmlIntermediateExpression : SmlSimplifiedExpression

internal sealed interface SmlIntermediateCallable : SmlIntermediateExpression {
    val parameters: List<SmlParameter>
}

internal data class SmlIntermediateBlockLambda(
    override val parameters: List<SmlParameter>,
    val results: List<SmlBlockLambdaResult>,
    val substitutionsOnCreation: ParameterSubstitutions
) : SmlIntermediateCallable

internal data class SmlIntermediateExpressionLambda(
    override val parameters: List<SmlParameter>,
    val result: SmlAbstractExpression,
    val substitutionsOnCreation: ParameterSubstitutions
) : SmlIntermediateCallable

internal data class SmlIntermediateStep(
    override val parameters: List<SmlParameter>,
    val results: List<SmlResult>
) : SmlIntermediateCallable

internal class SmlIntermediateRecord(
    resultSubstitutions: List<Pair<SmlAbstractResult, SmlSimplifiedExpression?>>
) : SmlIntermediateExpression {
    private val resultSubstitutions = resultSubstitutions.toMap()

    fun getSubstitutionByReferenceOrNull(reference: SmlReference): SmlSimplifiedExpression? {
        val result = reference.declaration as? SmlAbstractResult ?: return null
        return resultSubstitutions[result]
    }

    fun getSubstitutionByIndexOrNull(index: Int?): SmlSimplifiedExpression? {
        if (index == null) {
            return null
        }
        return resultSubstitutions.values.toList().getOrNull(index)
    }

    /**
     * If the record contains exactly one substitution its value is returned. Otherwise, it returns `this`.
     */
    fun unwrap(): SmlSimplifiedExpression? {
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

data class SmlIntermediateVariadicArguments(
    private val arguments: List<SmlSimplifiedExpression?>
) : SmlSimplifiedExpression {
    fun getArgumentByIndexOrNull(index: Int?): SmlSimplifiedExpression? {
        if (index == null) {
            return null
        }
        return arguments.getOrNull(index)
    }
}

sealed interface SmlConstantExpression : SmlSimplifiedExpression

data class SmlConstantBoolean(val value: Boolean) : SmlConstantExpression {
    override fun toString(): String = value.toString()
}

data class SmlConstantEnumVariant(val value: SmlEnumVariant) : SmlConstantExpression {
    override fun toString(): String = value.name
}

sealed class SmlConstantNumber : SmlConstantExpression {
    abstract val value: Number
}

data class SmlConstantFloat(override val value: Double) : SmlConstantNumber() {
    override fun toString(): String = value.toString()
}

data class SmlConstantInt(override val value: Int) : SmlConstantNumber() {
    override fun toString(): String = value.toString()
}

object SmlConstantNull : SmlConstantExpression {
    override fun toString(): String = "null"
}

data class SmlConstantString(val value: String) : SmlConstantExpression {
    override fun toString(): String = value
}
