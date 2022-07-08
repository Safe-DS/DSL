package com.larsreimann.safeds.staticAnalysis.linking

import com.larsreimann.safeds.emf.asResolvedOrNull
import com.larsreimann.safeds.emf.closestAncestorOrNull
import com.larsreimann.safeds.emf.isNamed
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.safeDS.SdsAnnotationCall
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsArgumentList
import com.larsreimann.safeds.safeDS.SdsAtomicSchemaEffect
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsGoalArgument
import com.larsreimann.safeds.safeDS.SdsGoalArgumentList
import com.larsreimann.safeds.safeDS.SdsGoalCall
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.staticAnalysis.parametersOrNull
import com.larsreimann.safeds.staticAnalysis.schema.ParameterTypesOrEmpty
import com.larsreimann.safeds.staticAnalysis.typing.Type
import com.larsreimann.safeds.staticAnalysis.typing.VariadicType
import com.larsreimann.safeds.utils.ExperimentalSdsApi

/**
 * Returns the [SdsParameter] that corresponds to this [SdsArgument] or `null` if it cannot be resolved.
 */
fun SdsArgument.parameterOrNull(): SdsParameter? {
    return when {
        isNamed() -> parameter.asResolvedOrNull()
        else -> {
            val argumentList = closestAncestorOrNull<SdsArgumentList>() ?: return null
            val parameters = argumentList.parametersOrNull() ?: return null
            val lastParameter = parameters.lastOrNull()

            val firstNamedArgumentIndex = argumentList.arguments.indexOfFirst { it.isNamed() }
            val thisIndex = argumentList.arguments.indexOf(this)

            return when {
                lastParameter?.isVariadic == true && thisIndex >= parameters.size - 1 -> lastParameter
                firstNamedArgumentIndex != -1 && thisIndex > firstNamedArgumentIndex -> null
                else -> parameters.getOrNull(thisIndex)
            }
        }
    }
}

/**
 * Returns the list of [SdsParameter]s that corresponds to this list of [SdsArgument]s or `null` if it cannot be
 * resolved.
 */
fun SdsArgumentList.parametersOrNull(): List<SdsParameter>? {
    return when (val parent = this.eContainer()) {
        is SdsAnnotationCall -> parent.annotation.asResolvedOrNull()?.parametersOrEmpty()
        is SdsCall -> parent.parametersOrNull()
        else -> null
    }
}

/**
 * Returns the [SdsParameter] that corresponds to this [SdsGoalArgument] or `null` if it cannot be resolved.
 */
@ExperimentalSdsApi
fun SdsGoalArgument.parameterOrNull(): SdsParameter? {
    return when {
        isNamed() -> parameter.asResolvedOrNull()
        else -> {
            val goalArgumentList = closestAncestorOrNull<SdsGoalArgumentList>() ?: return null
            val parameters = goalArgumentList.parametersOrNull() ?: return null
            val lastParameter = parameters.lastOrNull()

            val firstNamedArgumentIndex = goalArgumentList.arguments.indexOfFirst { it.isNamed() }
            val thisIndex = goalArgumentList.arguments.indexOf(this)

            return when {
                lastParameter?.isVariadic == true && thisIndex >= parameters.size - 1 -> lastParameter
                firstNamedArgumentIndex != -1 && thisIndex > firstNamedArgumentIndex -> null
                else -> parameters.getOrNull(thisIndex)
            }
        }
    }
}

/**
 * Returns the list of [SdsParameter]s that corresponds to this list of [SdsGoalArgument]s or `null` if it cannot be
 * resolved.
 */
@ExperimentalSdsApi
fun SdsGoalArgumentList.parametersOrNull(): List<SdsParameter>? {
    return when (val parent = this.eContainer()) {
        is SdsGoalCall -> parent.parametersOrNull()
        else -> null
    }
}

/**
 * Returns the [Type] of [SdsGoalArgument] if the receiver is a [SdsAtomicSchemaEffect] or `null` if it cannot be resolved.
 */
@ExperimentalSdsApi
fun SdsGoalArgument.parameterTypeOrNull(): Type? {
    val goalArgumentList = closestAncestorOrNull<SdsGoalArgumentList>() ?: return null
    val receiver = closestAncestorOrNull<SdsGoalCall>()?.receiver ?: return null

    when (receiver) {
        is SdsAtomicSchemaEffect -> {
            val parametersTypes = receiver.ParameterTypesOrEmpty()
            val lastParameterType = parametersTypes.lastOrNull()
            val thisIndex = goalArgumentList.arguments.indexOf(this)
            return when {
                lastParameterType is VariadicType && thisIndex >= parametersTypes.size - 1 -> lastParameterType
                else -> parametersTypes.getOrNull(thisIndex)
            }
        }
        else -> return null
    }
}