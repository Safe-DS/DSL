package com.larsreimann.safeds.validation.statements

import com.larsreimann.safeds.emf.assigneesOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsBlockLambdaResult
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsWildcard
import com.larsreimann.safeds.safeDS.SdsYield
import com.larsreimann.safeds.staticAnalysis.AssignedResult
import com.larsreimann.safeds.staticAnalysis.expressionHasNoSideEffects
import com.larsreimann.safeds.staticAnalysis.maybeAssigned
import com.larsreimann.safeds.staticAnalysis.resultsOrNull
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import com.larsreimann.safeds.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check

class AssignmentChecker : AbstractSafeDSChecker() {

    @Check
    fun unnecessaryAssigneeList(sdsAssignment: SdsAssignment) {
        if (sdsAssignment.assigneesOrEmpty().all { it is SdsWildcard }) {
            info(
                "This assignment can be converted to an expression statement.",
                null,
                InfoCode.UnnecessaryAssignment
            )
        }
    }

    @Check
    fun assigneeWithoutValue(sdsAssignment: SdsAssignment) {
        sdsAssignment.assigneesOrEmpty()
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
    fun hasNoEffect(sdsAssignment: SdsAssignment) {
        if (sdsAssignment.assigneesOrEmpty()
            .any { it is SdsPlaceholder || it is SdsYield || it is SdsBlockLambdaResult }
        ) {
            return
        }

        if (sdsAssignment.expression.expressionHasNoSideEffects()) {
            warning(
                "This statement does nothing.",
                null,
                WarningCode.StatementDoesNothing
            )
        }
    }

    @Check
    fun ignoredResultOfCall(sdsAssignment: SdsAssignment) {
        val expression = sdsAssignment.expression
        if (expression is SdsCall) {
            val results = (expression.resultsOrNull() ?: listOf())
            val unassignedResults = results.drop(sdsAssignment.assigneesOrEmpty().size)

            unassignedResults
                .filterIsInstance<SdsAbstractDeclaration>()
                .forEach {
                    warning(
                        "The result '${it.name}' is implicitly ignored.",
                        Literals.SDS_ASSIGNMENT__ASSIGNEE_LIST,
                        WarningCode.ImplicitlyIgnoredResultOfCall
                    )
                }
        }
    }
}
