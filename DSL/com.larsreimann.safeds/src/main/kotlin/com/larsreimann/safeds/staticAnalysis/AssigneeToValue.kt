package com.larsreimann.safeds.staticAnalysis

import com.larsreimann.safeds.emf.assigneesOrEmpty
import com.larsreimann.safeds.emf.closestAncestorOrNull
import com.larsreimann.safeds.safeDS.SdsAbstractAssignee
import com.larsreimann.safeds.safeDS.SdsAbstractExpression
import com.larsreimann.safeds.safeDS.SdsAbstractObject
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsCall

fun SdsAbstractAssignee.assignedOrNull(): SdsAbstractObject? {
    return when (val maybeAssigned = this.maybeAssigned()) {
        is AssignedResult.Assigned -> maybeAssigned.assigned
        else -> null
    }
}

sealed interface AssignedResult {
    object Unresolved : AssignedResult
    object NotAssigned : AssignedResult
    sealed class Assigned : AssignedResult {
        abstract val assigned: SdsAbstractObject
    }

    class AssignedExpression(override val assigned: SdsAbstractExpression) : Assigned()
    class AssignedDeclaration(override val assigned: SdsAbstractObject) : Assigned()
}

fun SdsAbstractAssignee.maybeAssigned(): AssignedResult {
    val assignment = this.closestAncestorOrNull<SdsAssignment>() ?: return AssignedResult.Unresolved
    val expression = assignment.expression ?: return AssignedResult.NotAssigned

    val thisIndex = assignment.assigneeList.assignees.indexOf(this)
    return when (expression) {
        is SdsCall -> {
            val results = expression.resultsOrNull() ?: return AssignedResult.Unresolved
            val result = results.getOrNull(thisIndex) ?: return AssignedResult.NotAssigned
            AssignedResult.AssignedDeclaration(result)
        }
        else -> when (thisIndex) {
            0 -> AssignedResult.AssignedExpression(expression)
            else -> AssignedResult.NotAssigned
        }
    }
}

fun SdsAbstractAssignee.indexOrNull(): Int? {
    val assignment = closestAncestorOrNull<SdsAssignment>() ?: return null
    return assignment.assigneesOrEmpty().indexOf(this)
}
