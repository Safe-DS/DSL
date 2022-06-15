package com.larsreimann.safeds.validation.statements

import com.larsreimann.safeds.safeDS.SdsExpressionStatement
import com.larsreimann.safeds.staticAnalysis.expressionHasNoSideEffects
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check

class ExpressionsStatementChecker : AbstractSafeDSChecker() {

    @Check
    fun hasNoEffect(sdsExpressionStatement: SdsExpressionStatement) {
        if (sdsExpressionStatement.expression.expressionHasNoSideEffects()) {
            warning(
                "This statement does nothing.",
                null,
                WarningCode.StatementDoesNothing
            )
        }
    }
}
