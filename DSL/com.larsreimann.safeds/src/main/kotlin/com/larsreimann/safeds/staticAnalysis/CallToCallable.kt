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
import com.larsreimann.safeds.safeDS.SdsMemberAccess
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsParenthesizedExpression
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsStep
import org.eclipse.emf.ecore.EObject

fun SdsCall.callableOrNull(): SdsAbstractCallable? {
    return when (val maybeCallable = this.maybeCallable()) {
        is CallableResult.Callable -> maybeCallable.callable
        else -> null
    }
}

sealed interface CallableResult {
    object Unresolvable : CallableResult
    object NotCallable : CallableResult
    class Callable(val callable: SdsAbstractCallable) : CallableResult
}

fun SdsCall.maybeCallable(): CallableResult {
    val visited = mutableSetOf<EObject>()
    var current: EObject? = this.receiver
    while (current != null && current !in visited) {
        visited += current

        current = when {
            current.eIsProxy() -> return CallableResult.Unresolvable
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
