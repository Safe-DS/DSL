package com.larsreimann.safeds.validation.other

import com.larsreimann.safeds.emf.isNamed
import com.larsreimann.safeds.emf.isPositional
import com.larsreimann.safeds.safeDS.SdsTypeArgumentList
import com.larsreimann.safeds.staticAnalysis.linking.typeParameterOrNull
import com.larsreimann.safeds.staticAnalysis.linking.typeParametersOrNull
import com.larsreimann.safeds.utils.duplicatesBy
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class TypeArgumentListChecker : AbstractSafeDSChecker() {

    @Check
    fun missingRequiredTypeParameter(smlTypeArgumentList: SdsTypeArgumentList) {
        val requiredTypeParameters = smlTypeArgumentList.typeParametersOrNull() ?: return
        val givenTypeParameters = smlTypeArgumentList.typeArguments.mapNotNull { it.typeParameterOrNull() }
        val missingRequiredTypeParameters = requiredTypeParameters - givenTypeParameters.toSet()

        missingRequiredTypeParameters.forEach {
            error(
                "The type parameter '${it.name}' is required and must be set here.",
                null,
                ErrorCode.MISSING_REQUIRED_TYPE_PARAMETER
            )
        }
    }

    @Check
    fun noPositionalArgumentsAfterFirstNamedArgument(smlTypeArgumentList: SdsTypeArgumentList) {
        val firstNamedTypeArgumentIndex = smlTypeArgumentList.typeArguments.indexOfFirst { it.isNamed() }
        if (firstNamedTypeArgumentIndex == -1) {
            return
        }

        smlTypeArgumentList.typeArguments
            .drop(firstNamedTypeArgumentIndex + 1)
            .filter { it.isPositional() }
            .forEach {
                error(
                    "After the first named type argument all type arguments must be named.",
                    it,
                    null,
                    ErrorCode.NO_POSITIONAL_TYPE_ARGUMENTS_AFTER_FIRST_NAMED_TYPE_ARGUMENT
                )
            }
    }

    @Check
    fun tooManyTypeArguments(smlTypeArgumentList: SdsTypeArgumentList) {
        val typeParameter = smlTypeArgumentList.typeParametersOrNull() ?: return

        val maximumExpectedNumberOfArguments = typeParameter.size
        val actualNumberOfArguments = smlTypeArgumentList.typeArguments.size

        if (actualNumberOfArguments > maximumExpectedNumberOfArguments) {
            val message = buildString {
                append("Expected ")

                when (maximumExpectedNumberOfArguments) {
                    1 -> append("exactly 1 type argument")
                    else -> append("exactly $maximumExpectedNumberOfArguments type arguments")
                }

                append(" but got $actualNumberOfArguments.")
            }

            error(
                message,
                null,
                ErrorCode.TooManyTypeArguments
            )
        }
    }

    @Check
    fun uniqueTypeParameters(smlTypeArgumentList: SdsTypeArgumentList) {
        smlTypeArgumentList.typeArguments
            .duplicatesBy { it.typeParameterOrNull()?.name }
            .forEach {
                error(
                    "The type parameter '${it.typeParameterOrNull()?.name}' is already set.",
                    it,
                    null,
                    ErrorCode.UniqueTypeParameters
                )
            }
    }

    @Check
    fun unnecessaryTypeArgumentList(smlTypeArgumentList: SdsTypeArgumentList) {
        val typeParametersOrNull = smlTypeArgumentList.typeParametersOrNull()
        if (typeParametersOrNull != null && typeParametersOrNull.isEmpty()) {
            info(
                "Unnecessary type argument list.",
                null,
                InfoCode.UnnecessaryTypeArgumentList
            )
        }
    }
}
