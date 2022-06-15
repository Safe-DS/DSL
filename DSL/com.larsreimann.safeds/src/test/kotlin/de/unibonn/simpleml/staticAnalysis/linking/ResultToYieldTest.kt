package com.larsreimann.safeds.staticAnalysis.linking

import de.unibonn.simpleml.emf.createSmlAssignment
import de.unibonn.simpleml.emf.createSmlNull
import de.unibonn.simpleml.emf.createSmlResult
import de.unibonn.simpleml.emf.createSmlResultList
import de.unibonn.simpleml.emf.createSmlStep
import de.unibonn.simpleml.emf.createSmlWildcard
import de.unibonn.simpleml.emf.createSmlYield
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
    private lateinit var firstResult: SmlResult
    private lateinit var secondResult: SmlResult

    private lateinit var yieldOfFirstResult1: SmlYield
    private lateinit var yieldOfFirstResult2: SmlYield
    private lateinit var yieldOfSecondResult: SmlYield

    private lateinit var assignment: SmlAssignment
    private lateinit var step: SmlStep

    @BeforeEach
    fun reset() {
        firstResult = createSmlResult(name = "firstResult")
        secondResult = createSmlResult(name = "secondResult")

        yieldOfFirstResult1 = createSmlYield(firstResult)
        yieldOfFirstResult2 = createSmlYield(firstResult)
        yieldOfSecondResult = createSmlYield(secondResult)

        assignment = createSmlAssignment(
            assignees = listOf(createSmlWildcard()),
            expression = createSmlNull()
        )
        step = createSmlStep(
            name = "s",
            statements = listOf(assignment)
        )
    }

    @Nested
    inner class UniqueYieldOrNull {

        @Test
        fun `should return the unique corresponding yield`() {
            step.resultList = createSmlResultList(listOf(firstResult))
            assignment.assigneeList.assignees += yieldOfFirstResult1

            firstResult.uniqueYieldOrNull() shouldBe yieldOfFirstResult1
        }

        @Test
        fun `should return null if no corresponding yields exist`() {
            step.resultList = createSmlResultList(listOf(firstResult))

            firstResult.uniqueYieldOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if multiple corresponding yields exist`() {
            step.resultList = createSmlResultList(listOf(firstResult))
            assignment.assigneeList.assignees += listOf(yieldOfFirstResult1, yieldOfFirstResult2)

            firstResult.uniqueYieldOrNull().shouldBeNull()
        }
    }

    @Nested
    inner class YieldsOrEmpty {

        @Test
        fun `should return all corresponding yields in the body of the step`() {
            step.resultList = createSmlResultList(listOf(firstResult, secondResult))
            assignment.assigneeList.assignees += listOf(yieldOfFirstResult1, yieldOfFirstResult2, yieldOfSecondResult)

            firstResult.yieldsOrEmpty().shouldContainExactly(yieldOfFirstResult1, yieldOfFirstResult2)
        }

        @Test
        fun `should return an empty list if the result is not in a result list`() {
            firstResult.yieldsOrEmpty().shouldBeEmpty()
        }

        @Test
        fun `should return an empty list if the result is not in a step`() {
            createSmlResultList(listOf(firstResult))

            firstResult.yieldsOrEmpty().shouldBeEmpty()
        }
    }
}
