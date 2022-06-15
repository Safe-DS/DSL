package com.larsreimann.safeds.location

/**
 * A range in a program from a start to an end position with some length using the zero-based indexing of LSP.
 *
 * @see LspPosition
 * @see ProgramRangeLength
 */
data class LspRange(val start: LspPosition, val end: LspPosition, val length: ProgramRangeLength) {

    companion object {

        @JvmStatic
        fun fromInts(startLine: Int, startColumn: Int, endLine: Int, endColumn: Int, length: Int): LspRange {
            return LspRange(
                LspPosition.fromInts(startLine, startColumn),
                LspPosition.fromInts(endLine, endColumn),
                ProgramRangeLength(length)
            )
        }
    }

    fun toXtextRange(): XtextRange {
        return XtextRange(
            start.toXtextPosition(),
            end.toXtextPosition(),
            length
        )
    }

    override fun toString(): String {
        return "[$start .. $end]"
    }
}
