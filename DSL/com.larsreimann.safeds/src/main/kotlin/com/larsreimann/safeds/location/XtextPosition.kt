package com.larsreimann.safeds.location

/**
 * A specific position in a program using the one-based indexing of Xtext.
 */
data class XtextPosition(val line: XtextLine, val column: XtextColumn) : Comparable<XtextPosition> {
    companion object {

        @JvmStatic
        fun fromInts(line: Int, column: Int): XtextPosition {
            return XtextPosition(
                XtextLine(line),
                XtextColumn(column)
            )
        }
    }

    fun toLspPosition(): LspPosition {
        return LspPosition(
            line.toLspLine(),
            column.toLspColumn()
        )
    }

    override fun toString(): String {
        return "$line:$column"
    }

    override operator fun compareTo(other: XtextPosition): Int {
        val lineComparison = this.line.compareTo(other.line)
        if (lineComparison != 0) {
            return lineComparison
        }

        return this.column.compareTo(other.column)
    }
}

/**
 * A line in a program. Counting starts at 1.
 *
 * @throws IllegalArgumentException If value is less than 1.
 */
@JvmInline
value class XtextLine(val value: Int) : Comparable<XtextLine> {
    init {
        require(value >= 1) { "Line must be at least 1." }
    }

    fun toLspLine(): LspLine {
        return LspLine(value - 1)
    }

    override fun toString(): String {
        return value.toString()
    }

    override operator fun compareTo(other: XtextLine): Int {
        return this.value.compareTo(other.value)
    }
}

/**
 * A column in a program. Counting starts at 1.
 *
 * @throws IllegalArgumentException If value is less than 1.
 */
@JvmInline
value class XtextColumn(val value: Int) : Comparable<XtextColumn> {
    init {
        require(value >= 1) { "Column must be at least 1." }
    }

    fun toLspColumn(): LspColumn {
        return LspColumn(value - 1)
    }

    override fun toString(): String {
        return value.toString()
    }

    override operator fun compareTo(other: XtextColumn): Int {
        return this.value.compareTo(other.value)
    }
}
