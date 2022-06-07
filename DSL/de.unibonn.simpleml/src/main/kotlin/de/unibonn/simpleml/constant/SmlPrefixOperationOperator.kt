package de.unibonn.simpleml.constant

import de.unibonn.simpleml.simpleML.SmlPrefixOperation

/**
 * The possible operators for an [SmlPrefixOperation].
 */
enum class SmlPrefixOperationOperator(val operator: String) {

    /**
     * Logical negation.
     */
    Not("not"),

    /**
     * Arithmetic negation.
     */
    Minus("-");

    override fun toString(): String {
        return operator
    }
}

/**
 * Returns the [SmlPrefixOperationOperator] of this [SmlPrefixOperation].
 *
 * @throws IllegalArgumentException If the operator is unknown.
 */
fun SmlPrefixOperation.operator(): SmlPrefixOperationOperator {
    return SmlPrefixOperationOperator.values().firstOrNull { it.operator == this.operator }
        ?: throw IllegalArgumentException("Unknown prefix operator '$operator'.")
}
