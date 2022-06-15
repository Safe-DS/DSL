package com.larsreimann.safeds.location

/**
 * A specific position in a program using the zero-based indexing of LSP.
 */
data class LspPosition(val line: LspLine, val column: LspColumn) : Comparable<LspPosition> {
    companion object {

        @JvmStatic
        fun fromInts(line: Int, column: Int): LspPosition {
            return LspPosition(
                LspLine(line),
                LspColumn(column)
            )
        }
    }

    fun toXtextPosition(): XtextPosition {
        return XtextPosition(
            line.toXtextLine(),
            column.toXtextColumn()
        )
    }

    override fun toString(): String {
        return "[$line, $column]"
    }

    override operator fun compareTo(other: LspPosition): Int {
        val lineComparison = this.line.compareTo(other.line)
        if (lineComparison != 0) {
            return lineComparison
        }

        return this.column.compareTo(other.column)
    }
}

/**
 * A line in a program. Counting starts at 0.
 *
 * @throws IllegalArgumentException If value is negative.
 */
@JvmInline
value class LspLine(val value: Int) : Comparable<LspLine> {
    init {
        require(value >= 0) { "Line must be at least 0." }
    }

    fun toXtextLine(): XtextLine {
        return XtextLine(value + 1)
    }

    override fun toString(): String {
        return value.toString()
    }

    override operator fun compareTo(other: LspLine): Int {
        return this.value.compareTo(other.value)
    }
}

/**
 * A column in a program. Counting starts at 0.
 *
 * @throws IllegalArgumentException If value is negative.
 */
@JvmInline
value class LspColumn(val value: Int) : Comparable<LspColumn> {
    init {
        require(value >= 0) { "Column must be at least 0." }
    }

    fun toXtextColumn(): XtextColumn {
        return XtextColumn(value + 1)
    }

    override fun toString(): String {
        return value.toString()
    }

    override operator fun compareTo(other: LspColumn): Int {
        return this.value.compareTo(other.value)
    }
}
