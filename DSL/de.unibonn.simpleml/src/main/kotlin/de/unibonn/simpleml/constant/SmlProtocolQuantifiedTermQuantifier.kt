package de.unibonn.simpleml.constant

import de.unibonn.simpleml.simpleML.SmlProtocolQuantifiedTerm

/**
 * The possible quantifiers for an [SmlProtocolQuantifiedTerm].
 */
enum class SmlProtocolQuantifiedTermQuantifier(val quantifier: String) {
    ZeroOrOne("?"),
    ZeroOrMore("*"),
    OneOrMore("+");

    override fun toString(): String {
        return quantifier
    }
}

/**
 * Returns the [SmlProtocolQuantifiedTermQuantifier] of this [SmlProtocolQuantifiedTerm].
 *
 * @throws IllegalArgumentException If the quantifier is unknown.
 */
fun SmlProtocolQuantifiedTerm.quantifier(): SmlProtocolQuantifiedTermQuantifier {
    return SmlProtocolQuantifiedTermQuantifier.values().firstOrNull { it.quantifier == this.quantifier }
        ?: throw IllegalArgumentException("Unknown quantified term quantifier '$quantifier'.")
}
