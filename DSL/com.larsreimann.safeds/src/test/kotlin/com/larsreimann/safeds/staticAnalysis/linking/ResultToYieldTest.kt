package com.larsreimann.safeds.staticAnalysis.linking

import com.larsreimann.safeds.emf.createSdsAssignment
import com.larsreimann.safeds.emf.createSdsNull
import com.larsreimann.safeds.emf.createSdsResult
import com.larsreimann.safeds.emf.createSdsResultList
import com.larsreimann.safeds.emf.createSdsStep
import com.larsreimann.safeds.emf.createSdsWildcard
import com.larsreimann.safeds.emf.createSdsYield
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsYield
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class ResultToYieldTest {
    private lateinit var firstResult: SdsResult
    private lateinit var secondResult: SdsResult

    private lateinit var yieldOfFirstResult1: SdsYield
    private lateinit var yieldOfFirstResult2: SdsYield
    private lateinit var yieldOfSecondResult: SdsYield

    private lateinit var assignment: SdsAssignment
    private lateinit var step: SdsStep

    @BeforeEach
    fun reset() {
        firstResult = createSdsResult(name = "firstResult")
        secondResult = createSdsResult(name = "secondResult")

        yieldOfFirstResult1 = createSdsYield(firstResult)
        yieldOfFirstResult2 = createSdsYield(firstResult)
        yieldOfSecondResult = createSdsYield(secondResult)

        assignment = createSdsAssignment(
            assignees = listOf(createSdsWildcard()),
            expression = createSdsNull()
        )
        step = createSdsStep(
            name = "s",
            statements = listOf(assignment)
        )
    }

    @Nested
    inner class UniqueYieldOrNull {

        @Test
        fun `should return the unique corresponding yield`() {
            step.resultList = createSdsResultList(listOf(firstResult))
            assignment.assigneeList.assignees += yieldOfFirstResult1

            firstResult.uniqueYieldOrNull() shouldBe yieldOfFirstResult1
        }

        @Test
        fun `should return null if no corresponding yields exist`() {
            step.resultList = createSdsResultList(listOf(firstResult))

            firstResult.uniqueYieldOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if multiple corresponding yields exist`() {
            step.resultList = createSdsResultList(listOf(firstResult))
            assignment.assigneeList.assignees += listOf(yieldOfFirstResult1, yieldOfFirstResult2)

            firstResult.uniqueYieldOrNull().shouldBeNull()
        }
    }

    @Nested
    inner class YieldsOrEmpty {

        @Test
        fun `should return all corresponding yields in the body of the step`() {
            step.resultList = createSdsResultList(listOf(firstResult, secondResult))
            assignment.assigneeList.assignees += listOf(yieldOfFirstResult1, yieldOfFirstResult2, yieldOfSecondResult)

            firstResult.yieldsOrEmpty().shouldContainExactly(yieldOfFirstResult1, yieldOfFirstResult2)
        }

        @Test
        fun `should return an empty list if the result is not in a result list`() {
            firstResult.yieldsOrEmpty().shouldBeEmpty()
        }

        @Test
        fun `should return an empty list if the result is not in a step`() {
            createSdsResultList(listOf(firstResult))

            firstResult.yieldsOrEmpty().shouldBeEmpty()
        }
    }
}
