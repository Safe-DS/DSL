package com.larsreimann.safeds.ide.editor.contentassist

import com.google.inject.Inject
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsStep
import de.unibonn.simpleml.testing.ParseHelper
import de.unibonn.simpleml.testing.SimpleMLInjectorProvider
import de.unibonn.simpleml.testing.assertions.findUniqueDeclarationOrFail
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.maps.shouldContainValue
import io.kotest.matchers.maps.shouldContainValues
import io.kotest.matchers.maps.shouldNotContainValue
import io.kotest.matchers.nulls.shouldNotBeNull
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(InjectionExtension::class)
@InjectWith(SimpleMLInjectorProvider::class)
class ProposalsTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    private val testProgram = """
        |package test
        |
        |step primitive_empty() {}
        |step primitive_boolean(b: Boolean) {}
        |step primitive_float(f: Float) {}
        |step primitive_int(i: Int) {}
        |step primitive_string(s: String) {}
        |
        |class A()
        |class B()
        |class C() {
        |    fun someMethod()
        |}
        |class D() sub C
        |
        |step matching_a(a: A) {}
        |step matching_b(b: B) {}
        |step matching_multiple_c(c1: C, c2: C) {}
        |step not_matching_multiple_c(c: C) {}
        |step matching_multiple_c_d(c: C, d: D) {}
        |step matching_multiple_d_c(d: D, c: C) {}
        |
        |step test_callee() -> (test_result_a: A, test_result_c: C) {
        |    val test_placeholder_a = A();
        |    val test_placeholder_d = D();
        |}
    """.trimMargin()

    @Nested
    inner class ListCallablesWithOnlyPrimitiveParameters {

        @Test
        fun `should contain steps with primitive parameters`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val steps = context.members
                .asSequence()
                .filterIsInstance<SmlStep>()
                .filter { it.name.startsWith("primitive") }
                .toList()
            steps.shouldHaveSize(5)

            val descriptions = listCallablesWithOnlyPrimitiveParameters(context)
            descriptions.shouldContainValues(*steps.toTypedArray())
        }
    }

    @Nested
    inner class ListCallablesWithMatchingParameters {

        @Test
        fun `should contain only steps with matching parameters when a placeholder is passed`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val placeholder = context.findUniqueDeclarationOrFail<SmlPlaceholder>("test_placeholder_a")
            val workflowStepA = context.findUniqueDeclarationOrFail<SmlStep>("matching_a")
            val workflowStepB = context.findUniqueDeclarationOrFail<SmlStep>("matching_b")

            val descriptions = listCallablesWithMatchingParameters(context, listOf(placeholder))
            descriptions.shouldContainValue(workflowStepA)
            descriptions.shouldNotContainValue(workflowStepB)
        }

        @Test
        fun `should contain only steps with matching parameters when a result is passed`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val result = context.findUniqueDeclarationOrFail<SmlResult>("test_result_a")
            val workflowStepA = context.findUniqueDeclarationOrFail<SmlStep>("matching_a")
            val workflowStepB = context.findUniqueDeclarationOrFail<SmlStep>("matching_b")

            val descriptions = listCallablesWithMatchingParameters(context, listOf(result))
            descriptions.shouldContainValue(workflowStepA)
            descriptions.shouldNotContainValue(workflowStepB)
        }

        @Test
        fun `should contain only steps with matching parameters when multiple declarations are passed (1)`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val result = context.findUniqueDeclarationOrFail<SmlResult>("test_result_c")
            val matchingWorkflow = context.findUniqueDeclarationOrFail<SmlStep>("matching_multiple_c")
            val nonMatchingWorkflow = context.findUniqueDeclarationOrFail<SmlStep>("not_matching_multiple_c")

            val descriptions = listCallablesWithMatchingParameters(context, listOf(result, result))
            descriptions.shouldContainValue(matchingWorkflow)
            descriptions.shouldNotContainValue(nonMatchingWorkflow)
        }

        @Test
        fun `should contain only steps with matching parameters when multiple declarations are passed (2)`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val result = context.findUniqueDeclarationOrFail<SmlResult>("test_result_c")
            val placeholder = context.findUniqueDeclarationOrFail<SmlPlaceholder>("test_placeholder_d")
            val matchingWorkflow1 = context.findUniqueDeclarationOrFail<SmlStep>("matching_multiple_c_d")
            val matchingWorkflow2 = context.findUniqueDeclarationOrFail<SmlStep>("matching_multiple_d_c")

            // Inverse order of placeholder and result compared to (3)
            val descriptions = listCallablesWithMatchingParameters(context, listOf(result, placeholder))
            descriptions.shouldContainValue(matchingWorkflow1)
            descriptions.shouldContainValue(matchingWorkflow2)
        }

        @Test
        fun `should contain only steps with matching parameters when multiple declarations are passed (3)`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val result = context.findUniqueDeclarationOrFail<SmlResult>("test_result_c")
            val placeholder = context.findUniqueDeclarationOrFail<SmlPlaceholder>("test_placeholder_d")
            val matchingWorkflow1 = context.findUniqueDeclarationOrFail<SmlStep>("matching_multiple_c_d")
            val matchingWorkflow2 = context.findUniqueDeclarationOrFail<SmlStep>("matching_multiple_d_c")

            // Inverse order of placeholder and result compared to (2)
            val descriptions = listCallablesWithMatchingParameters(context, listOf(placeholder, result))
            descriptions.shouldContainValue(matchingWorkflow1)
            descriptions.shouldContainValue(matchingWorkflow2)
        }

        @Test
        fun `should contain methods defined directly on class`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val result = context.findUniqueDeclarationOrFail<SmlResult>("test_result_c")
            val matchingMethod = context.findUniqueDeclarationOrFail<SmlFunction>("someMethod")

            // Inverse order of placeholder and result compared to (2)
            val descriptions = listCallablesWithMatchingParameters(context, listOf(result))
            descriptions.shouldContainValue(matchingMethod)
        }

        @Test
        fun `should contain methods defined on superclass`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val placeholder = context.findUniqueDeclarationOrFail<SmlPlaceholder>("test_placeholder_d")
            val matchingMethod = context.findUniqueDeclarationOrFail<SmlFunction>("someMethod")

            // Inverse order of placeholder and result compared to (2)
            val descriptions = listCallablesWithMatchingParameters(context, listOf(placeholder))
            descriptions.shouldContainValue(matchingMethod)
        }
    }
}
