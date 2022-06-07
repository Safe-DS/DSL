package de.unibonn.simpleml.validation.expressions

import de.unibonn.simpleml.emf.assigneesOrEmpty
import de.unibonn.simpleml.emf.blockLambdaResultsOrEmpty
import de.unibonn.simpleml.emf.closestAncestorOrNull
import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.placeholdersOrEmpty
import de.unibonn.simpleml.simpleML.SmlAbstractLambda
import de.unibonn.simpleml.simpleML.SmlArgument
import de.unibonn.simpleml.simpleML.SmlAssignment
import de.unibonn.simpleml.simpleML.SmlBlockLambda
import de.unibonn.simpleml.simpleML.SmlParenthesizedExpression
import de.unibonn.simpleml.simpleML.SmlYield
import de.unibonn.simpleml.staticAnalysis.linking.parameterOrNull
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class LambdaChecker : AbstractSimpleMLChecker() {

    @Check
    fun uniqueNames(smlBlockLambda: SmlBlockLambda) {
        val declarations =
            smlBlockLambda.parametersOrEmpty() + smlBlockLambda.placeholdersOrEmpty() + smlBlockLambda.blockLambdaResultsOrEmpty()
        declarations.reportDuplicateNames {
            "A parameter, result or placeholder with name '${it.name}' exists already in this lambda."
        }
    }

    @Check
    fun context(smlLambda: SmlAbstractLambda) {
        val context = smlLambda.closestAncestorOrNull { it !is SmlParenthesizedExpression } ?: return

        val contextIsValid = when (context) {
            is SmlArgument -> {
                when (val parameter = context.parameterOrNull()) {
                    null -> true // Resolution of parameter failed, so this already shows another error
                    else -> parameter.type != null
                }
            }
            is SmlAssignment -> context.assigneesOrEmpty().firstOrNull() is SmlYield
            else -> false
        }

        if (!contextIsValid) {
            error(
                "A lambda must either be yielded in a step or assigned to a typed parameter.",
                null,
                ErrorCode.LambdaMustBeTypedArgumentOrYielded
            )
        }
    }
}
