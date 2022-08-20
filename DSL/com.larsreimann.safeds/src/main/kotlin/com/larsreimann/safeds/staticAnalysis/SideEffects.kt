package com.larsreimann.safeds.staticAnalysis

import com.larsreimann.safeds.emf.assigneesOrEmpty
import com.larsreimann.safeds.emf.immediateCalls
import com.larsreimann.safeds.safeDS.SdsAbstractCallable
import com.larsreimann.safeds.safeDS.SdsAbstractExpression
import com.larsreimann.safeds.safeDS.SdsAbstractLambda
import com.larsreimann.safeds.safeDS.SdsAbstractStatement
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsCallableType
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsExpressionStatement
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsPredicate
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsWildcard
import com.larsreimann.safeds.stdlibAccess.hasNoSideEffects

/**
 * Whether this [SdsAbstractStatement] has no side effects and, thus, can be removed.
 *
 * @param resultIfUnknown What to return if neither purity nor impurity can be proven. Note that external functions are
 * still always assumed to have side effects unless they are marked with `@Pure` or `@NoSideEffects.
 */
fun SdsAbstractStatement.statementHasNoSideEffects(resultIfUnknown: Boolean = false): Boolean {
    return when (this) {
        is SdsAssignment -> {
            assigneesOrEmpty().all { it is SdsWildcard } && expression.expressionHasNoSideEffects(resultIfUnknown)
        }
        is SdsExpressionStatement -> {
            expression.expressionHasNoSideEffects(resultIfUnknown)
        }
        else -> {
            throw IllegalArgumentException("Missing case to handle statement $this.")
        }
    }
}

/**
 * Whether this [SdsAbstractExpression] has no side effects and, thus, can be removed.
 *
 * @param resultIfUnknown What to return if neither purity nor impurity can be proven. Note that external functions are
 * still always assumed to have side effects unless they are marked with `@Pure` or `@NoSideEffects.
 */
fun SdsAbstractExpression.expressionHasNoSideEffects(resultIfUnknown: Boolean = false): Boolean {
    return when (this) {
        is SdsCall -> !isRecursive() && callableOrNull().callableHasNoSideEffects(resultIfUnknown)
        else -> true
    }
}

/**
 * Whether this [SdsAbstractCallable] has no side effects, so calls to this can be removed.
 *
 * @param resultIfUnknown What to return if neither purity nor impurity can be proven. Note that external functions are
 * still always assumed to have side effects unless they are marked with `@Pure` or `@NoSideEffects.
 */
fun SdsAbstractCallable?.callableHasNoSideEffects(resultIfUnknown: Boolean = false): Boolean {
    return when (this) {
        null -> resultIfUnknown

        is SdsAbstractLambda -> immediateCalls().all { it.expressionHasNoSideEffects(resultIfUnknown) }
        is SdsStep -> immediateCalls().all { it.expressionHasNoSideEffects(resultIfUnknown) }

        is SdsCallableType -> resultIfUnknown
        is SdsClass -> true
        is SdsEnumVariant -> true
        is SdsFunction -> hasNoSideEffects()
        // TODO: Correct?
        is SdsPredicate -> false

        else -> throw IllegalArgumentException("Cannot handle callable of type '${this::class.simpleName}'.")
    }
}
