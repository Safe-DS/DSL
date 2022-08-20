package com.larsreimann.safeds.constant

import com.larsreimann.safeds.safeDS.SdsTypeParameterConstraint
import com.larsreimann.safeds.utils.ExperimentalSdsApi

/**
 * The possible operators for an [SdsTypeParameterConstraint].
 */
@ExperimentalSdsApi
enum class SdsTypeParameterConstraintOperator(val operator: String) {

    /**
     * Left operand is a subclass of the right operand. Each class is a subclass of itself for the purpose of this
     * operator.
     */
    SubclassOf("sub"),

    /**
     * Left operand is a superclass of the right operand. Each class is a superclass of itself for the purpose of this
     * operator.
     */
    SuperclassOf("super");

    override fun toString(): String {
        return operator
    }
}

/**
 * Returns the [SdsTypeParameterConstraintOperator] of this [SdsTypeParameterConstraint].
 *
 * @throws IllegalArgumentException If the operator is unknown.
 */
@ExperimentalSdsApi
fun SdsTypeParameterConstraint.operator(): SdsTypeParameterConstraintOperator {
    return SdsTypeParameterConstraintOperator.values().firstOrNull { it.operator == this.operator }
        ?: throw IllegalArgumentException("Unknown type parameter constraint operator '$operator'.")
}
