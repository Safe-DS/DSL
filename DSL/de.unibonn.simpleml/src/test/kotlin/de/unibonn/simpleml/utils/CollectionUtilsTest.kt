package de.unibonn.simpleml.utils

import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class CollectionUtilsTest {

    @Nested
    inner class DuplicatesBy {

        @Test
        fun `should keep only elements that are mapped to same non-null label as other element`() {
            val actualResult = listOf(1, 1, 2, null).duplicatesBy { element -> element?.let { it + 1 } }
            actualResult.shouldContainExactly(1, 1)
        }
    }

    @Nested
    inner class UniqueBy {

        @Test
        fun `should keep only elements that are mapped to unique non-null label`() {
            val actualResult = listOf(1, 1, 2, null).uniqueBy { element -> element?.let { it + 1 } }
            actualResult.shouldContainExactly(2)
        }
    }

    @Nested
    inner class UniqueOrNull {

        @Test
        fun `should return the sole element of the list if no filter is provided`() {
            listOf(1).uniqueOrNull() shouldBe 1
        }

        @Test
        fun `should return null if the list is empty and no filter is provided`() {
            emptyList<Any>().uniqueOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if the list has multiple elements and no filter is provided`() {
            listOf(1, 2).uniqueOrNull().shouldBeNull()
        }

        @Test
        fun `should return the unique element that matches the filter`() {
            listOf(1, 2).uniqueOrNull { it < 2 } shouldBe 1
        }

        @Test
        fun `should return null if no element matches the filter`() {
            listOf(1, 2).uniqueOrNull { it < 1 }.shouldBeNull()
        }

        @Test
        fun `should return null if multiple elements match the filter`() {
            listOf(1, 2).uniqueOrNull { true }.shouldBeNull()
        }
    }

    @Nested
    inner class NullIfEmptyElse {

        @Test
        fun `should return null if the list is empty`() {
            emptyList<Int>().nullIfEmptyElse { it }.shouldBeNull()
        }

        @Test
        fun `should call the initializer if the list is not empty`() {
            listOf(1, 2, 3).nullIfEmptyElse { list -> list.map { it + 1 } }.shouldContainExactly(2, 3, 4)
        }
    }

    @Nested
    inner class OuterZipBy {

        @Test
        fun `should zip the two lists while padding the shorter list with nulls at the end (left shorter)`() {
            val actualResult = outerZipBy(listOf(3), listOf(1, 2)) { a, b -> a to b }
            actualResult.shouldContainExactly(3 to 1, null to 2)
        }

        @Test
        fun `should zip the two lists while padding the shorter list with nulls at the end (right shorter)`() {
            val actualResult = outerZipBy(listOf(1, 2), listOf(3)) { a, b -> a to b }
            actualResult.shouldContainExactly(1 to 3, 2 to null)
        }
    }
}
