package de.unibonn.simpleml.constant

import de.unibonn.simpleml.simpleML.SmlInfixOperation

/**
 * The possible operators for an [SmlInfixOperation].
 */
enum class SmlInfixOperationOperator(val operator: String) {

    /**
     * Disjunction.
     */
    Or("or"),

    /**
     * Conjunction.
     */
    And("and"),

    /**
     * Structural equality.
     */
    Equals("=="),

    /**
     * Negated structural equality.
     */
    NotEquals("!="),

    /**
     * Both operands point to exactly the same object (referential equality).
     */
    IdenticalTo("==="),

    /**
     * The two operands point to different objects (negated referential equality).
     */
    NotIdenticalTo("!=="),

    LessThan("<"),

    LessThanOrEquals("<="),

    GreaterThanOrEquals(">="),

    GreaterThan(">"),

    /**
     * Addition.
     */
    Plus("+"),

    /**
     * Subtraction.
     */
    Minus("-"),

    /**
     * Multiplication.
     */
    Times("*"),

    /**
     * Division.
     */
    By("/"),

    /**
     * Returns the left operand unless it is null, in which case the right operand is returned.
     */
    Elvis("?:");

    override fun toString(): String {
        return operator
    }
}

/**
 * Returns the [SmlInfixOperationOperator] of this [SmlInfixOperation].
 *
 * @throws IllegalArgumentException If the operator is unknown.
 */
fun SmlInfixOperation.operator(): SmlInfixOperationOperator {
    return SmlInfixOperationOperator.values().firstOrNull { it.operator == this.operator }
        ?: throw IllegalArgumentException("Unknown infix operator '$operator'.")
}
