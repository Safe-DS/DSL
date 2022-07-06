package com.larsreimann.safeds.staticAnalysis

import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.safeDS.SdsAbstractGoalCallable
import com.larsreimann.safeds.safeDS.SdsGoalCall
import com.larsreimann.safeds.safeDS.SdsGoalReference
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsPredicate
import com.larsreimann.safeds.safeDS.SdsSchemaEffectPredicate
import com.larsreimann.safeds.safeDS.SdsSchemaEffectReference
import com.larsreimann.safeds.staticAnalysis.schema.schemaEffectPredicate
import org.eclipse.emf.ecore.EObject

fun SdsGoalCall.goalCallableOrNull(): SdsAbstractGoalCallable? {
    return when (val maybeCallable = this.maybeCallable()) {
        is GoalCallableResult.Callable -> maybeCallable.callable
        else -> null
    }
}

sealed interface GoalCallableResult {
    object Unresolvable : GoalCallableResult
    object NotCallable : GoalCallableResult
    class Callable(val callable: SdsAbstractGoalCallable) : GoalCallableResult
}

fun SdsGoalCall.maybeCallable(): GoalCallableResult {
    val visited = mutableSetOf<EObject>()
    var current: EObject? = this.receiver
    while (current != null && current !in visited) {
        visited += current

        current = when {
            current.eIsProxy() -> return GoalCallableResult.Unresolvable
            current is SdsAbstractGoalCallable -> return GoalCallableResult.Callable(current)
            current is SdsSchemaEffectReference -> current.schemaEffectPredicate()
            current is SdsGoalReference -> current.declaration
            else -> return GoalCallableResult.NotCallable
        }
    }

    return GoalCallableResult.Unresolvable
}

/**
 * Returns the list of [SdsParameter]s of the called goalCallable or `null` if it cannot be resolved.
 */
fun SdsGoalCall.parametersOrNull(): List<SdsParameter>? {
    return when (val goalCallable = goalCallableOrNull()) {
        is SdsPredicate -> goalCallable.parametersOrEmpty()
        is SdsSchemaEffectPredicate -> goalCallable.parametersOrEmpty()
        else -> null
    }
}
