package com.larsreimann.safeds.validation.other

import de.unibonn.simpleml.emf.isNamed
import de.unibonn.simpleml.emf.isPositional
import de.unibonn.simpleml.emf.isRequired
import com.larsreimann.safeds.safeDS.SdsArgumentList
import de.unibonn.simpleml.staticAnalysis.linking.parameterOrNull
import de.unibonn.simpleml.staticAnalysis.linking.parametersOrNull
import de.unibonn.simpleml.utils.duplicatesBy
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class ArgumentListChecker : AbstractSimpleMLChecker() {

    @Check
    fun missingRequiredParameter(smlArgumentList: SmlArgumentList) {
        val parameters = smlArgumentList.parametersOrNull() ?: return
        val requiredParameters = parameters.filter { it.isRequired() }
        val givenParameters = smlArgumentList.arguments.mapNotNull { it.parameterOrNull() }
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
    fun noPositionalArgumentsAfterFirstNamedArgument(smlArgumentList: SmlArgumentList) {
        val firstNamedArgumentIndex = smlArgumentList.arguments.indexOfFirst { it.isNamed() }
        if (firstNamedArgumentIndex == -1) {
            return
        }

        smlArgumentList.arguments
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
    fun tooManyArguments(smlArgumentList: SmlArgumentList) {
        val parameters = smlArgumentList.parametersOrNull()
        if (parameters == null || parameters.any { it.isVariadic }) {
            return
        }

        val maximumExpectedNumberOfArguments = parameters.size
        val actualNumberOfArguments = smlArgumentList.arguments.size

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
    fun uniqueParameters(smlArgumentList: SmlArgumentList) {
        smlArgumentList.arguments
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
