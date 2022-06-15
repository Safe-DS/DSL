package com.larsreimann.safeds.constant

import com.larsreimann.safeds.safeDS.SdsTypeParameterConstraintGoal

/**
 * The possible operators for an [SmlTypeParameterConstraintGoal].
 */
enum class SmlTypeParameterConstraintOperator(val operator: String) {

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
 * Returns the [SmlTypeParameterConstraintOperator] of this [SmlTypeParameterConstraintGoal].
 *
 * @throws IllegalArgumentException If the operator is unknown.
 */
fun SmlTypeParameterConstraintGoal.operator(): SmlTypeParameterConstraintOperator {
    return SmlTypeParameterConstraintOperator.values().firstOrNull { it.operator == this.operator }
        ?: throw IllegalArgumentException("Unknown type parameter constraint operator '$operator'.")
}
