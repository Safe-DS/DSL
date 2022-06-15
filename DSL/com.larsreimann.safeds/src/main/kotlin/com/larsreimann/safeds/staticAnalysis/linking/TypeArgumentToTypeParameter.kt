package com.larsreimann.safeds.staticAnalysis.linking

import com.larsreimann.safeds.emf.closestAncestorOrNull
import com.larsreimann.safeds.emf.isNamed
import com.larsreimann.safeds.emf.isResolved
import com.larsreimann.safeds.emf.typeParametersOrEmpty
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.safeDS.SdsTypeArgument
import com.larsreimann.safeds.safeDS.SdsTypeArgumentList
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import com.larsreimann.safeds.staticAnalysis.callableOrNull

/**
 * Returns the [SdsTypeParameter] that corresponds to this [SdsTypeArgument] or `null` if it cannot be resolved.
 */
fun SdsTypeArgument.typeParameterOrNull(): SdsTypeParameter? {
    return when {
        this.isNamed() -> typeParameter
        else -> {
            val typeArgumentList = closestAncestorOrNull<SdsTypeArgumentList>() ?: return null

            // Cannot match positional type argument if it is preceded by named type arguments
            val firstNamedTypeArgumentIndex = typeArgumentList.typeArguments.indexOfFirst { it.isNamed() }
            val thisIndex = typeArgumentList.typeArguments.indexOf(this)
            if (firstNamedTypeArgumentIndex != -1 && thisIndex > firstNamedTypeArgumentIndex) {
                return null
            }

            typeArgumentList.typeParametersOrNull()?.getOrNull(thisIndex)
        }
    }
}

/**
 * Returns the list of [SdsTypeParameter]s that corresponds to this list of [SdsTypeArgument]s or `null` if it cannot
 * not be resolved.
 */
fun SdsTypeArgumentList.typeParametersOrNull(): List<SdsTypeParameter>? {
    return when (val parent = eContainer()) {
        is SdsCall -> {
            when (val callable = parent.callableOrNull()) {
                is SdsClass -> callable.typeParametersOrEmpty()
                is SdsEnumVariant -> callable.typeParametersOrEmpty()
                is SdsFunction -> callable.typeParametersOrEmpty()
                else -> null
            }
        }
        is SdsNamedType -> {
            val declaration = parent.declaration
            when {
                !declaration.isResolved() -> null
                declaration is SdsClass -> declaration.typeParametersOrEmpty()
                declaration is SdsEnumVariant -> declaration.typeParametersOrEmpty()
                else -> null
            }
        }
        else -> null
    }
}
