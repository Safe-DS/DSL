package com.larsreimann.safeds.validation.expressions

import com.larsreimann.safeds.emf.assigneesOrEmpty
import com.larsreimann.safeds.emf.blockLambdaResultsOrEmpty
import com.larsreimann.safeds.emf.closestAncestorOrNull
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.placeholdersOrEmpty
import com.larsreimann.safeds.safeDS.SdsAbstractLambda
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsBlockLambda
import com.larsreimann.safeds.safeDS.SdsParenthesizedExpression
import com.larsreimann.safeds.safeDS.SdsYield
import com.larsreimann.safeds.staticAnalysis.linking.parameterOrNull
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class LambdaChecker : AbstractSafeDSChecker() {

    @Check
    fun uniqueNames(sdsBlockLambda: SdsBlockLambda) {
        val declarations =
            sdsBlockLambda.parametersOrEmpty() + sdsBlockLambda.placeholdersOrEmpty() + sdsBlockLambda.blockLambdaResultsOrEmpty()
        declarations.reportDuplicateNames {
            "A parameter, result or placeholder with name '${it.name}' exists already in this lambda."
        }
    }

    @Check
    fun context(sdsLambda: SdsAbstractLambda) {
        val context = sdsLambda.closestAncestorOrNull { it !is SdsParenthesizedExpression } ?: return

        val contextIsValid = when (context) {
            is SdsArgument -> {
                when (val parameter = context.parameterOrNull()) {
                    null -> true // Resolution of parameter failed, so this already shows another error
                    else -> parameter.type != null
                }
            }
            is SdsAssignment -> context.assigneesOrEmpty().firstOrNull() is SdsYield
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
