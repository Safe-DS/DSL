package com.larsreimann.safeds.constant

import com.larsreimann.safeds.safeDS.SdsPrefixOperation

/**
 * The possible operators for an [SdsPrefixOperation].
 */
enum class SdsPrefixOperationOperator(val operator: String) {

    /**
     * Logical negation.
     */
    Not("not"),

    /**
     * Arithmetic negation.
     */
    Minus("-"),
    ;

    override fun toString(): String {
        return operator
    }
}

/**
 * Returns the [SdsPrefixOperationOperator] of this [SdsPrefixOperation].
 *
 * @throws IllegalArgumentException If the operator is unknown.
 */
fun SdsPrefixOperation.operator(): SdsPrefixOperationOperator {
    return SdsPrefixOperationOperator.values().firstOrNull { it.operator == this.operator }
        ?: throw IllegalArgumentException("Unknown prefix operator '$operator'.")
}
