package com.larsreimann.safeds.constant

import com.larsreimann.safeds.safeDS.SdsProtocolQuantifiedTerm

/**
 * The possible quantifiers for an [SdsProtocolQuantifiedTerm].
 */
enum class SdsProtocolQuantifiedTermQuantifier(val quantifier: String) {
    ZeroOrOne("?"),
    ZeroOrMore("*"),
    OneOrMore("+");

    override fun toString(): String {
        return quantifier
    }
}

/**
 * Returns the [SdsProtocolQuantifiedTermQuantifier] of this [SdsProtocolQuantifiedTerm].
 *
 * @throws IllegalArgumentException If the quantifier is unknown.
 */
fun SdsProtocolQuantifiedTerm.quantifier(): SdsProtocolQuantifiedTermQuantifier {
    return SdsProtocolQuantifiedTermQuantifier.values().firstOrNull { it.quantifier == this.quantifier }
        ?: throw IllegalArgumentException("Unknown quantified term quantifier '$quantifier'.")
}
