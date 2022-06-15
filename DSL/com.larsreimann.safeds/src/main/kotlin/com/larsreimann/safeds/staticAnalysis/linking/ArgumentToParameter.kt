package com.larsreimann.safeds.staticAnalysis.linking

import de.unibonn.simpleml.emf.asResolvedOrNull
import de.unibonn.simpleml.emf.closestAncestorOrNull
import de.unibonn.simpleml.emf.isNamed
import de.unibonn.simpleml.emf.parametersOrEmpty
import com.larsreimann.safeds.safeDS.SdsAnnotationCall
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsArgumentList
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsParameter
import de.unibonn.simpleml.staticAnalysis.parametersOrNull

/**
 * Returns the [SmlParameter] that corresponds to this [SmlArgument] or `null` if it cannot be resolved.
 */
fun SmlArgument.parameterOrNull(): SmlParameter? {
    return when {
        isNamed() -> parameter.asResolvedOrNull()
        else -> {
            val argumentList = closestAncestorOrNull<SmlArgumentList>() ?: return null
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
 * Returns the list of [SmlParameter]s that corresponds to this list of [SmlArgument]s or `null` if it cannot be
 * resolved.
 */
fun SmlArgumentList.parametersOrNull(): List<SmlParameter>? {
    return when (val parent = this.eContainer()) {
        is SmlAnnotationCall -> parent.annotation.asResolvedOrNull()?.parametersOrEmpty()
        is SmlCall -> parent.parametersOrNull()
        else -> null
    }
}
