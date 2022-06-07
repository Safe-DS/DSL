package de.unibonn.simpleml.staticAnalysis

import de.unibonn.simpleml.emf.blockLambdaResultsOrEmpty
import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.resultsOrEmpty
import de.unibonn.simpleml.simpleML.SmlAbstractAssignee
import de.unibonn.simpleml.simpleML.SmlAbstractCallable
import de.unibonn.simpleml.simpleML.SmlAbstractExpression
import de.unibonn.simpleml.simpleML.SmlAbstractObject
import de.unibonn.simpleml.simpleML.SmlBlockLambda
import de.unibonn.simpleml.simpleML.SmlBlockLambdaResult
import de.unibonn.simpleml.simpleML.SmlCall
import de.unibonn.simpleml.simpleML.SmlCallableType
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlEnumVariant
import de.unibonn.simpleml.simpleML.SmlExpressionLambda
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlMemberAccess
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlParenthesizedExpression
import de.unibonn.simpleml.simpleML.SmlReference
import de.unibonn.simpleml.simpleML.SmlResult
import de.unibonn.simpleml.simpleML.SmlStep
import org.eclipse.emf.ecore.EObject

fun SmlCall.callableOrNull(): SmlAbstractCallable? {
    return when (val maybeCallable = this.maybeCallable()) {
        is CallableResult.Callable -> maybeCallable.callable
        else -> null
    }
}

sealed interface CallableResult {
    object Unresolvable : CallableResult
    object NotCallable : CallableResult
    class Callable(val callable: SmlAbstractCallable) : CallableResult
}

fun SmlCall.maybeCallable(): CallableResult {
    val visited = mutableSetOf<EObject>()
    var current: EObject? = this.receiver
    while (current != null && current !in visited) {
        visited += current

        current = when {
            current.eIsProxy() -> return CallableResult.Unresolvable
            current is SmlAbstractCallable -> return CallableResult.Callable(current)
            current is SmlCall -> {
                val results = current.resultsOrNull()
                if (results == null || results.size != 1) {
                    return CallableResult.Unresolvable
                }

                results.first()
            }
            current is SmlAbstractAssignee -> current.assignedOrNull()
            current is SmlMemberAccess -> current.member.declaration
            current is SmlParameter -> return when (val typeOrNull = current.type) {
                null -> CallableResult.Unresolvable
                is SmlCallableType -> CallableResult.Callable(typeOrNull)
                else -> CallableResult.NotCallable
            }
            current is SmlParenthesizedExpression -> current.expression
            current is SmlReference -> current.declaration
            current is SmlResult -> return when (val typeOrNull = current.type) {
                null -> CallableResult.Unresolvable
                is SmlCallableType -> CallableResult.Callable(typeOrNull)
                else -> CallableResult.NotCallable
            }
            else -> return CallableResult.NotCallable
        }
    }

    return CallableResult.Unresolvable
}

/**
 * Returns the list of [SmlParameter]s of the called callable or `null` if it cannot be resolved.
 */
fun SmlCall.parametersOrNull(): List<SmlParameter>? {
    return callableOrNull()?.parametersOrEmpty()
}

/**
 * Returns the list of [SmlAbstractObject]s that are returned by the called callable or `null` if it cannot be resolved.
 * Possible types depend on the called callable:
 * - [SmlBlockLambda] -> [SmlBlockLambdaResult]
 * - [SmlCallableType] -> [SmlResult]
 * - [SmlClass] -> [SmlClass]
 * - [SmlEnumVariant] -> [SmlEnumVariant]
 * - [SmlExpressionLambda] -> [SmlAbstractExpression]
 * - [SmlFunction] -> [SmlResult]
 * - [SmlStep] -> [SmlResult]
 */
fun SmlCall.resultsOrNull(): List<SmlAbstractObject>? {
    return when (val callable = this.callableOrNull()) {
        is SmlBlockLambda -> callable.blockLambdaResultsOrEmpty()
        is SmlCallableType -> callable.resultsOrEmpty()
        is SmlClass -> listOf(callable)
        is SmlEnumVariant -> listOf(callable)
        is SmlExpressionLambda -> listOf(callable.result)
        is SmlFunction -> callable.resultsOrEmpty()
        is SmlStep -> callable.resultsOrEmpty()
        else -> null
    }
}

sealed interface ResultsResult {
    object Unresolved : ResultsResult
    object NotCallable : ResultsResult
}
