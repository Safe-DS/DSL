package com.larsreimann.safeds.location

/**
 * A range in a program from a start to an end position with some length using the one-based indexing of Xtext.
 *
 * @see XtextPosition
 * @see ProgramRangeLength
 */
data class XtextRange(val start: XtextPosition, val end: XtextPosition, val length: ProgramRangeLength) {

    companion object {

        @JvmStatic
        fun fromInts(startLine: Int, startColumn: Int, endLine: Int, endColumn: Int, length: Int): XtextRange {
            return XtextRange(
                XtextPosition.fromInts(startLine, startColumn),
                XtextPosition.fromInts(endLine, endColumn),
                ProgramRangeLength(length)
            )
        }
    }

    fun toLspRange(): LspRange {
        return LspRange(
            start.toLspPosition(),
            end.toLspPosition(),
            length
        )
    }

    override fun toString(): String {
        return "$start .. $end ($length)"
    }
}
