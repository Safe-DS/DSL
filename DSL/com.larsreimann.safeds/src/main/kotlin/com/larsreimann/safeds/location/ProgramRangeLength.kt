package com.larsreimann.safeds.location

/**
 * The number of characters in a program range (Xtext/LSP). This value must be non-negative.
 *
 * @throws IllegalArgumentException If value is negative.
 *
 * @see XtextRange
 * @see LspRange
 */
@JvmInline
value class ProgramRangeLength(val value: Int) {
    init {
        require(value >= 0) { "Length must be at least 0." }
    }

    override fun toString(): String {
        val chars = if (value == 1) "char" else "chars"
        return "$value $chars"
    }
}
