package com.larsreimann.safeds.validation.statements

import de.unibonn.simpleml.emf.assigneesOrEmpty
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsBlockLambdaResult
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsWildcard
import com.larsreimann.safeds.safeDS.SdsYield
import de.unibonn.simpleml.staticAnalysis.AssignedResult
import de.unibonn.simpleml.staticAnalysis.expressionHasNoSideEffects
import de.unibonn.simpleml.staticAnalysis.maybeAssigned
import de.unibonn.simpleml.staticAnalysis.resultsOrNull
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import de.unibonn.simpleml.validation.codes.InfoCode
import de.unibonn.simpleml.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check

class AssignmentChecker : AbstractSimpleMLChecker() {

    @Check
    fun unnecessaryAssigneeList(smlAssignment: SmlAssignment) {
        if (smlAssignment.assigneesOrEmpty().all { it is SmlWildcard }) {
            info(
                "This assignment can be converted to an expression statement.",
                null,
                InfoCode.UnnecessaryAssignment
            )
        }
    }

    @Check
    fun assigneeWithoutValue(smlAssignment: SmlAssignment) {
        smlAssignment.assigneesOrEmpty()
            .filter { it.maybeAssigned() == AssignedResult.NotAssigned }
            .forEach {
                error(
                    "No value is assigned to this assignee.",
                    it,
                    null,
                    ErrorCode.ASSIGNEE_WITHOUT_VALUE
                )
            }
    }

    @Check
    fun hasNoEffect(smlAssignment: SmlAssignment) {
        if (smlAssignment.assigneesOrEmpty()
            .any { it is SmlPlaceholder || it is SmlYield || it is SmlBlockLambdaResult }
        ) {
            return
        }

        if (smlAssignment.expression.expressionHasNoSideEffects()) {
            warning(
                "This statement does nothing.",
                null,
                WarningCode.StatementDoesNothing
            )
        }
    }

    @Check
    fun ignoredResultOfCall(smlAssignment: SmlAssignment) {
        val expression = smlAssignment.expression
        if (expression is SmlCall) {
            val results = (expression.resultsOrNull() ?: listOf())
            val unassignedResults = results.drop(smlAssignment.assigneesOrEmpty().size)

            unassignedResults
                .filterIsInstance<SmlAbstractDeclaration>()
                .forEach {
                    warning(
                        "The result '${it.name}' is implicitly ignored.",
                        Literals.SML_ASSIGNMENT__ASSIGNEE_LIST,
                        WarningCode.ImplicitlyIgnoredResultOfCall
                    )
                }
        }
    }
}
