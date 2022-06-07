package de.unibonn.simpleml.validation.statements

import de.unibonn.simpleml.simpleML.SmlExpressionStatement
import de.unibonn.simpleml.staticAnalysis.expressionHasNoSideEffects
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check

class ExpressionsStatementChecker : AbstractSimpleMLChecker() {

    @Check
    fun hasNoEffect(smlExpressionStatement: SmlExpressionStatement) {
        if (smlExpressionStatement.expression.expressionHasNoSideEffects()) {
            warning(
                "This statement does nothing.",
                null,
                WarningCode.StatementDoesNothing
            )
        }
    }
}
