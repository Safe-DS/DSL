package com.larsreimann.safeds.validation.other

import com.larsreimann.safeds.emf.isNamed
import com.larsreimann.safeds.emf.isPositional
import com.larsreimann.safeds.emf.isRequired
import com.larsreimann.safeds.safeDS.SdsArgumentList
import com.larsreimann.safeds.staticAnalysis.linking.parameterOrNull
import com.larsreimann.safeds.staticAnalysis.linking.parametersOrNull
import com.larsreimann.safeds.utils.duplicatesBy
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class ArgumentListChecker : AbstractSafeDSChecker() {

    @Check
    fun missingRequiredParameter(sdsArgumentList: SdsArgumentList) {
        val parameters = sdsArgumentList.parametersOrNull() ?: return
        val requiredParameters = parameters.filter { it.isRequired() }
        val givenParameters = sdsArgumentList.arguments.mapNotNull { it.parameterOrNull() }
        val missingRequiredParameters = requiredParameters - givenParameters.toSet()

        missingRequiredParameters.forEach {
            error(
                "The parameter '${it.name}' is required and must be set here.",
                null,
                ErrorCode.MISSING_REQUIRED_PARAMETER
            )
        }
    }

    @Check
    fun noPositionalArgumentsAfterFirstNamedArgument(sdsArgumentList: SdsArgumentList) {
        val firstNamedArgumentIndex = sdsArgumentList.arguments.indexOfFirst { it.isNamed() }
        if (firstNamedArgumentIndex == -1) {
            return
        }

        sdsArgumentList.arguments
            .drop(firstNamedArgumentIndex + 1)
            .filter { it.isPositional() }
            .forEach {
                error(
                    "After the first named argument all arguments must be named.",
                    it,
                    null,
                    ErrorCode.NO_POSITIONAL_ARGUMENTS_AFTER_FIRST_NAMED_ARGUMENT
                )
            }
    }

    @Check
    fun tooManyArguments(sdsArgumentList: SdsArgumentList) {
        val parameters = sdsArgumentList.parametersOrNull()
        if (parameters == null || parameters.any { it.isVariadic }) {
            return
        }

        val maximumExpectedNumberOfArguments = parameters.size
        val actualNumberOfArguments = sdsArgumentList.arguments.size

        if (actualNumberOfArguments > maximumExpectedNumberOfArguments) {
            val minimumExpectedNumberOfArguments = parameters.filter { it.isRequired() }.size
            val message = buildString {
                append("Expected ")

                when {
                    minimumExpectedNumberOfArguments != maximumExpectedNumberOfArguments -> {
                        append("between $minimumExpectedNumberOfArguments and $maximumExpectedNumberOfArguments arguments")
                    }
                    minimumExpectedNumberOfArguments == 1 -> append("exactly 1 argument")
                    else -> append("exactly $minimumExpectedNumberOfArguments arguments")
                }

                append(" but got $actualNumberOfArguments.")
            }

            error(
                message,
                null,
                ErrorCode.TOO_MANY_ARGUMENTS
            )
        }
    }

    @Check
    fun uniqueParameters(sdsArgumentList: SdsArgumentList) {
        sdsArgumentList.arguments
            .duplicatesBy {
                val parameter = it.parameterOrNull() ?: return@duplicatesBy null
                when {
                    parameter.isVariadic -> null
                    else -> parameter.name
                }
            }
            .forEach {
                error(
                    "The parameter '${it.parameterOrNull()?.name}' is already set.",
                    it,
                    null,
                    ErrorCode.UNIQUE_PARAMETERS
                )
            }
    }
}
