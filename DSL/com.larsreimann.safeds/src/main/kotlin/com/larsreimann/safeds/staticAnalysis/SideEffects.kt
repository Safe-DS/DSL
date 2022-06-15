package com.larsreimann.safeds.staticAnalysis

import de.unibonn.simpleml.emf.assigneesOrEmpty
import de.unibonn.simpleml.emf.immediateCalls
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
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsWildcard
import de.unibonn.simpleml.stdlibAccess.hasNoSideEffects

/**
 * Whether this [SmlAbstractStatement] has no side effects and, thus, can be removed.
 *
 * @param resultIfUnknown What to return if neither purity nor impurity can be proven. Note that external functions are
 * still always assumed to have side effects unless they are marked with `@Pure` or `@NoSideEffects.
 */
fun SmlAbstractStatement.statementHasNoSideEffects(resultIfUnknown: Boolean = false): Boolean {
    return when (this) {
        is SmlAssignment -> {
            assigneesOrEmpty().all { it is SmlWildcard } && expression.expressionHasNoSideEffects(resultIfUnknown)
        }
        is SmlExpressionStatement -> {
            expression.expressionHasNoSideEffects(resultIfUnknown)
        }
        else -> {
            throw IllegalArgumentException("Missing case to handle statement $this.")
        }
    }
}

/**
 * Whether this [SmlAbstractExpression] has no side effects and, thus, can be removed.
 *
 * @param resultIfUnknown What to return if neither purity nor impurity can be proven. Note that external functions are
 * still always assumed to have side effects unless they are marked with `@Pure` or `@NoSideEffects.
 */
fun SmlAbstractExpression.expressionHasNoSideEffects(resultIfUnknown: Boolean = false): Boolean {
    return when (this) {
        is SmlCall -> !isRecursive() && callableOrNull().callableHasNoSideEffects(resultIfUnknown)
        else -> true
    }
}

/**
 * Whether this [SmlAbstractCallable] has no side effects, so calls to this can be removed.
 *
 * @param resultIfUnknown What to return if neither purity nor impurity can be proven. Note that external functions are
 * still always assumed to have side effects unless they are marked with `@Pure` or `@NoSideEffects.
 */
fun SmlAbstractCallable?.callableHasNoSideEffects(resultIfUnknown: Boolean = false): Boolean {
    return when (this) {
        null -> resultIfUnknown

        is SmlAbstractLambda -> immediateCalls().all { it.expressionHasNoSideEffects(resultIfUnknown) }
        is SmlStep -> immediateCalls().all { it.expressionHasNoSideEffects(resultIfUnknown) }

        is SmlCallableType -> resultIfUnknown
        is SmlClass -> true
        is SmlEnumVariant -> true
        is SmlFunction -> hasNoSideEffects()

        else -> throw IllegalArgumentException("Cannot handle callable of type '${this::class.simpleName}'.")
    }
}
