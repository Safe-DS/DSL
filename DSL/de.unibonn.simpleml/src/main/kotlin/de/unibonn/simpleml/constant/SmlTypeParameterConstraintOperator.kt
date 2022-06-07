package de.unibonn.simpleml.constant

import de.unibonn.simpleml.simpleML.SmlTypeParameterConstraint

/**
 * The possible operators for an [SmlTypeParameterConstraint].
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
 * Returns the [SmlTypeParameterConstraintOperator] of this [SmlTypeParameterConstraint].
 *
 * @throws IllegalArgumentException If the operator is unknown.
 */
fun SmlTypeParameterConstraint.operator(): SmlTypeParameterConstraintOperator {
    return SmlTypeParameterConstraintOperator.values().firstOrNull { it.operator == this.operator }
        ?: throw IllegalArgumentException("Unknown type parameter constraint operator '$operator'.")
}
