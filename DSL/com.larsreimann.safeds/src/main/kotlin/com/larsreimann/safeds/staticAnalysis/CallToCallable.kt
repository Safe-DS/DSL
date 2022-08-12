package com.larsreimann.safeds.staticAnalysis

import com.larsreimann.safeds.emf.blockLambdaResultsOrEmpty
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.resultsOrEmpty
import com.larsreimann.safeds.safeDS.SdsAbstractAssignee
import com.larsreimann.safeds.safeDS.SdsAbstractCallable
import com.larsreimann.safeds.safeDS.SdsAbstractExpression
import com.larsreimann.safeds.safeDS.SdsAbstractObject
import com.larsreimann.safeds.safeDS.SdsBlockLambda
import com.larsreimann.safeds.safeDS.SdsBlockLambdaResult
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsCallableType
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsExpressionLambda
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsGoalCall
import com.larsreimann.safeds.safeDS.SdsGoalReference
import com.larsreimann.safeds.safeDS.SdsMemberAccess
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsParenthesizedExpression
import com.larsreimann.safeds.safeDS.SdsPredicate
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import org.eclipse.emf.ecore.EObject

fun SdsCall.callableOrNull(): SdsAbstractCallable? {
    return when (val abstractCallable = callableOrNull(this)) {
        is SdsAbstractCallable -> abstractCallable
        else -> null
    }
}

fun SdsGoalCall.callableOrNull(): SdsPredicate? {
    return when (val predicate = callableOrNull(this)) {
        is SdsPredicate -> predicate
        else -> null
    }
}

private fun callableOrNull(call: EObject): EObject? {
    return when (val maybeCallable = maybeCallable(call)) {
        is CallableResult.Callable -> maybeCallable.callable
        else -> null
    }
}

sealed interface CallableResult {
    object Unresolvable : CallableResult
    object NotCallable : CallableResult
    class Callable(val callable: EObject) : CallableResult
}

fun maybeCallable(call: EObject): CallableResult {
    val visited = mutableSetOf<EObject>()
    var current: EObject? = when (call) {
        is SdsGoalCall -> call.receiver
        is SdsCall -> call.receiver
        else -> throw java.lang.IllegalArgumentException("Expected either SdsGoalCall or SdsCall")
    }

    while (current != null && current !in visited) {
        visited += current

        current = when {
            current.eIsProxy() -> return CallableResult.Unresolvable
            // for SdsCall
            current is SdsAbstractCallable -> return CallableResult.Callable(current)
            current is SdsCall -> {
                val results = current.resultsOrNull()
                if (results == null || results.size != 1) {
                    return CallableResult.Unresolvable
                }

                results.first()
            }
            current is SdsAbstractAssignee -> current.assignedOrNull()
            current is SdsMemberAccess -> current.member.declaration
            current is SdsParameter -> return when (val typeOrNull = current.type) {
                null -> CallableResult.Unresolvable
                is SdsCallableType -> CallableResult.Callable(typeOrNull)
                else -> CallableResult.NotCallable
            }
            current is SdsParenthesizedExpression -> current.expression
            current is SdsReference -> current.declaration
            current is SdsResult -> return when (val typeOrNull = current.type) {
                null -> CallableResult.Unresolvable
                is SdsCallableType -> CallableResult.Callable(typeOrNull)
                else -> CallableResult.NotCallable
            }
            // for SdsGoalCall
            current is SdsPredicate -> return CallableResult.Callable(current)
            current is SdsGoalReference -> current.declaration

            else -> return CallableResult.NotCallable
        }
    }

    return CallableResult.Unresolvable
}

/**
 * Returns the list of [SdsParameter]s of the called callable or `null` if it cannot be resolved.
 */
fun SdsCall.parametersOrNull(): List<SdsParameter>? {
    return callableOrNull()?.parametersOrEmpty()
}

/**
 * Returns the list of [SdsParameter]s of the called callable or `null` if it cannot be resolved.
 */
@ExperimentalSdsApi
fun SdsGoalCall.parametersOrNull(): List<SdsParameter>? {
    return callableOrNull()?.parametersOrEmpty()
}

/**
 * Returns the list of [SdsAbstractObject]s that are returned by the called callable or `null` if it cannot be resolved.
 * Possible types depend on the called callable:
 * - [SdsBlockLambda] -> [SdsBlockLambdaResult]
 * - [SdsCallableType] -> [SdsResult]
 * - [SdsClass] -> [SdsClass]
 * - [SdsEnumVariant] -> [SdsEnumVariant]
 * - [SdsExpressionLambda] -> [SdsAbstractExpression]
 * - [SdsFunction] -> [SdsResult]
 * - [SdsStep] -> [SdsResult]
 */
fun SdsCall.resultsOrNull(): List<SdsAbstractObject>? {
    return when (val callable = this.callableOrNull()) {
        is SdsBlockLambda -> callable.blockLambdaResultsOrEmpty()
        is SdsCallableType -> callable.resultsOrEmpty()
        is SdsClass -> listOf(callable)
        is SdsEnumVariant -> listOf(callable)
        is SdsExpressionLambda -> listOf(callable.result)
        is SdsFunction -> callable.resultsOrEmpty()
        is SdsStep -> callable.resultsOrEmpty()
        else -> null
    }
}

sealed interface ResultsResult {
    object Unresolved : ResultsResult
    object NotCallable : ResultsResult
}
