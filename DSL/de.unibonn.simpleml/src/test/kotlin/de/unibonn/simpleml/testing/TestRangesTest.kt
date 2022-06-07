package de.unibonn.simpleml.testing

import de.unibonn.simpleml.location.XtextPosition
import de.unibonn.simpleml.location.XtextRange
import de.unibonn.simpleml.testing.FindTestRangesResult.CloseWithoutOpenFailure
import de.unibonn.simpleml.testing.FindTestRangesResult.OpenWithoutCloseFailure
import de.unibonn.simpleml.testing.FindTestRangesResult.Success
import de.unibonn.simpleml.testing.TestMarker.CLOSE
import de.unibonn.simpleml.testing.TestMarker.OPEN
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.junit.jupiter.api.Test

class TestRangesTest {

    @Test
    fun `should find all ranges enclosed by test markers in order of opening markers`() {
        val result = findTestRanges("text${OPEN}text$CLOSE\n${OPEN}text$CLOSE")
        result.shouldBeInstanceOf<Success>()
        result.ranges.shouldHaveSize(2)

        result.ranges[0] shouldBe XtextRange.fromInts(
            startLine = 1,
            startColumn = 6,
            endLine = 1,
            endColumn = 10,
            length = 4
        )

        result.ranges[1] shouldBe XtextRange.fromInts(
            startLine = 2,
            startColumn = 2,
            endLine = 2,
            endColumn = 6,
            length = 4
        )
    }

    @Test
    fun `should handle nested test markers`() {
        val result = findTestRanges("$OPEN\n    $OPEN$CLOSE\n$CLOSE")
        result.shouldBeInstanceOf<Success>()
        result.ranges.shouldHaveSize(2)

        result.ranges[0] shouldBe XtextRange.fromInts(
            startLine = 1,
            startColumn = 2,
            endLine = 3,
            endColumn = 1,
            length = 8
        )

        result.ranges[1] shouldBe XtextRange.fromInts(
            startLine = 2,
            startColumn = 6,
            endLine = 2,
            endColumn = 6,
            length = 0
        )
    }

    @Test
    fun `should handle line feed (Unix)`() {
        val result = findTestRanges("\n$OPEN\n$CLOSE")
        result.shouldBeInstanceOf<Success>()
        result.ranges.shouldHaveSize(1)

        result.ranges[0] shouldBe XtextRange.fromInts(
            startLine = 2,
            startColumn = 2,
            endLine = 3,
            endColumn = 1,
            length = 1
        )
    }

    @Test
    fun `should handle carriage return (MacOS)`() {
        val result = findTestRanges("\r$OPEN\r$CLOSE")
        result.shouldBeInstanceOf<Success>()
        result.ranges.shouldHaveSize(1)

        result.ranges[0] shouldBe XtextRange.fromInts(
            startLine = 2,
            startColumn = 2,
            endLine = 3,
            endColumn = 1,
            length = 1
        )
    }

    @Test
    fun `should handle carriage return + line feed (Windows)`() {
        val result = findTestRanges("\r\n$OPEN\r\n$CLOSE")
        result.shouldBeInstanceOf<Success>()
        result.ranges.shouldHaveSize(1)

        result.ranges[0] shouldBe XtextRange.fromInts(
            startLine = 2,
            startColumn = 2,
            endLine = 3,
            endColumn = 1,
            length = 2
        )
    }

    @Test
    fun `should report closing test markers without matching opening test marker`() {
        val result = findTestRanges("$OPEN\n$CLOSE$CLOSE")
        result.shouldBeInstanceOf<CloseWithoutOpenFailure>()
        result.position shouldBe XtextPosition.fromInts(line = 2, column = 2)
        result.message shouldBe "Found '$CLOSE' without previous '$OPEN' at 2:2."
    }

    @Test
    fun `should report opening test markers without matching closing test marker`() {
        val result = findTestRanges("$OPEN\n$OPEN$OPEN$CLOSE")
        result.shouldBeInstanceOf<OpenWithoutCloseFailure>()

        result.positions.shouldHaveSize(2)
        result.positions[0] shouldBe XtextPosition.fromInts(line = 1, column = 1)
        result.positions[1] shouldBe XtextPosition.fromInts(line = 2, column = 1)

        result.message shouldBe "Found '$OPEN' without following '$CLOSE' at 1:1, 2:1."
    }
}
