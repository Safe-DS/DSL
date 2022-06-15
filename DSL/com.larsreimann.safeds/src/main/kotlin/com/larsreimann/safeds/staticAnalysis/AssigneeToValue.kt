package com.larsreimann.safeds.staticAnalysis

import de.unibonn.simpleml.emf.assigneesOrEmpty
import de.unibonn.simpleml.emf.closestAncestorOrNull
import com.larsreimann.safeds.safeDS.SdsAbstractAssignee
import com.larsreimann.safeds.safeDS.SdsAbstractExpression
import com.larsreimann.safeds.safeDS.SdsAbstractObject
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsCall

fun SmlAbstractAssignee.assignedOrNull(): SmlAbstractObject? {
    return when (val maybeAssigned = this.maybeAssigned()) {
        is AssignedResult.Assigned -> maybeAssigned.assigned
        else -> null
    }
}

sealed interface AssignedResult {
    object Unresolved : AssignedResult
    object NotAssigned : AssignedResult
    sealed class Assigned : AssignedResult {
        abstract val assigned: SmlAbstractObject
    }

    class AssignedExpression(override val assigned: SmlAbstractExpression) : Assigned()
    class AssignedDeclaration(override val assigned: SmlAbstractObject) : Assigned()
}

fun SmlAbstractAssignee.maybeAssigned(): AssignedResult {
    val assignment = this.closestAncestorOrNull<SmlAssignment>() ?: return AssignedResult.Unresolved
    val expression = assignment.expression ?: return AssignedResult.NotAssigned

    val thisIndex = assignment.assigneeList.assignees.indexOf(this)
    return when (expression) {
        is SmlCall -> {
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

fun SmlAbstractAssignee.indexOrNull(): Int? {
    val assignment = closestAncestorOrNull<SmlAssignment>() ?: return null
    return assignment.assigneesOrEmpty().indexOf(this)
}
