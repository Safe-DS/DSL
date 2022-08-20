package com.larsreimann.safeds.validation.other

import com.larsreimann.safeds.constant.hasSchemaKind
import com.larsreimann.safeds.emf.isNamed
import com.larsreimann.safeds.emf.isPositional
import com.larsreimann.safeds.safeDS.SdsTypeArgumentList
import com.larsreimann.safeds.staticAnalysis.linking.typeParameterOrNull
import com.larsreimann.safeds.staticAnalysis.linking.typeParametersOrNull
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import com.larsreimann.safeds.utils.duplicatesBy
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class TypeArgumentListChecker : AbstractSafeDSChecker() {

    @OptIn(ExperimentalSdsApi::class)
    @Check
    fun missingRequiredTypeParameter(sdsTypeArgumentList: SdsTypeArgumentList) {
        val requiredTypeParameters = sdsTypeArgumentList.typeParametersOrNull()
            ?.filter { !it.hasSchemaKind() } ?: return
        val givenTypeParameters = sdsTypeArgumentList.typeArguments.mapNotNull { it.typeParameterOrNull() }
        val missingRequiredTypeParameters = requiredTypeParameters - givenTypeParameters.toSet()

        missingRequiredTypeParameters.forEach {
            error(
                "The type parameter '${it.name}' is required and must be set here.",
                null,
                ErrorCode.MISSING_REQUIRED_TYPE_PARAMETER,
            )
        }
    }

    @Check
    fun noPositionalArgumentsAfterFirstNamedArgument(sdsTypeArgumentList: SdsTypeArgumentList) {
        val firstNamedTypeArgumentIndex = sdsTypeArgumentList.typeArguments.indexOfFirst { it.isNamed() }
        if (firstNamedTypeArgumentIndex == -1) {
            return
        }

        sdsTypeArgumentList.typeArguments
            .drop(firstNamedTypeArgumentIndex + 1)
            .filter { it.isPositional() }
            .forEach {
                error(
                    "After the first named type argument all type arguments must be named.",
                    it,
                    null,
                    ErrorCode.NO_POSITIONAL_TYPE_ARGUMENTS_AFTER_FIRST_NAMED_TYPE_ARGUMENT,
                )
            }
    }

    @Check
    fun tooManyTypeArguments(sdsTypeArgumentList: SdsTypeArgumentList) {
        val typeParameter = sdsTypeArgumentList.typeParametersOrNull() ?: return

        val maximumExpectedNumberOfArguments = typeParameter.size
        val actualNumberOfArguments = sdsTypeArgumentList.typeArguments.size

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
                ErrorCode.TooManyTypeArguments,
            )
        }
    }

    @Check
    fun uniqueTypeParameters(sdsTypeArgumentList: SdsTypeArgumentList) {
        sdsTypeArgumentList.typeArguments
            .duplicatesBy { it.typeParameterOrNull()?.name }
            .forEach {
                error(
                    "The type parameter '${it.typeParameterOrNull()?.name}' is already set.",
                    it,
                    null,
                    ErrorCode.UniqueTypeParameters,
                )
            }
    }

    @Check
    fun unnecessaryTypeArgumentList(sdsTypeArgumentList: SdsTypeArgumentList) {
        val typeParametersOrNull = sdsTypeArgumentList.typeParametersOrNull()
        if (typeParametersOrNull != null && typeParametersOrNull.isEmpty()) {
            info(
                "Unnecessary type argument list.",
                null,
                InfoCode.UnnecessaryTypeArgumentList,
            )
        }
    }
}
