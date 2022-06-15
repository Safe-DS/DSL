package com.larsreimann.safeds.testing

import de.unibonn.simpleml.location.XtextPosition
import de.unibonn.simpleml.location.XtextRange
import de.unibonn.simpleml.testing.FindTestRangesResult.CloseWithoutOpenFailure
import de.unibonn.simpleml.testing.FindTestRangesResult.OpenWithoutCloseFailure
import de.unibonn.simpleml.testing.FindTestRangesResult.Success
import de.unibonn.simpleml.testing.TestMarker.CLOSE
import de.unibonn.simpleml.testing.TestMarker.OPEN

/**
 * Finds test ranges, i.e. parts of the program delimited by opening and closing test markers. They are sorted by the
 * position of their opening test markers. In case opening and closing markers don't match an error value is returned.
 * Nested test markers are supported.
 *
 * @param program The program with test markers.
 * @return A wrapper that indicates success of failure.
 * @see FindTestRangesResult
 * @see TestMarker
 */
fun findTestRanges(program: String): FindTestRangesResult {
    var currentLine = 1
    var currentColumn = 1
    var previousChar: Char? = null

    val testRangeStarts = ArrayDeque<TestRangeStart>()
    val finishedLocations = mutableListOf<XtextRange>()

    program.toCharArray().forEachIndexed { currentIndex, currentChar ->
        when (currentChar) {
            OPEN -> {
                currentColumn++

                testRangeStarts.addLast(
                    TestRangeStart(currentLine, currentColumn, currentIndex)
                )
            }
            CLOSE -> {
                currentColumn++

                if (testRangeStarts.isEmpty()) {
                    return CloseWithoutOpenFailure(
                        XtextPosition.fromInts(
                            line = currentLine,
                            column = currentColumn - 1
                        )
                    )
                }

                finishedLocations += testRangeStarts.removeLast().toProgramRange(
                    endLine = currentLine,
                    endColumn = currentColumn - 1,
                    endIndex = currentIndex - 1
                )
            }
            '\r' -> {
                currentLine++
                currentColumn = 1
            }
            '\n' -> {
                if (previousChar != '\r') {
                    currentLine++
                    currentColumn = 1
                }
            }
            else -> {
                currentColumn++
            }
        }

        previousChar = currentChar
    }

    return when {
        testRangeStarts.isEmpty() -> Success(finishedLocations.sortedBy { it.start })
        else -> OpenWithoutCloseFailure(
            testRangeStarts.map {
                XtextPosition.fromInts(it.startLine, it.startColumn - 1)
            }
        )
    }
}

/**
 * A wrapper that indicates success of failure of the `findTestRanges` method.
 */
@Suppress("MemberVisibilityCanBePrivate")
sealed interface FindTestRangesResult {

    /**
     * Opening and closing test markers matched and program ranges were successfully created.
     */
    class Success(val ranges: List<XtextRange>) : FindTestRangesResult

    /**
     * Something went wrong when creating program ranges.
     */
    sealed interface Failure : FindTestRangesResult {

        /**
         * A human-readable description of what went wrong.
         */
        val message: String
    }

    /**
     * Found a closing test marker without a previous opening test marker.
     */
    class CloseWithoutOpenFailure(val position: XtextPosition) : Failure {
        override val message: String
            get() {
                return "Found '$CLOSE' without previous '$OPEN' at $position."
            }
    }

    /**
     * Reached the end of the program but there were still unclosed opening test markers.
     */
    class OpenWithoutCloseFailure(val positions: List<XtextPosition>) : Failure {
        override val message: String
            get() {
                return "Found '$OPEN' without following '$CLOSE' at ${positions.joinToString()}."
            }
    }
}

/**
 * Stores where a test range starts.
 */
private class TestRangeStart(val startLine: Int, val startColumn: Int, val startIndex: Int) {
    fun toProgramRange(endLine: Int, endColumn: Int, endIndex: Int): XtextRange {
        return XtextRange.fromInts(
            startLine,
            startColumn,
            endLine,
            endColumn,
            length = endIndex - startIndex
        )
    }
}
