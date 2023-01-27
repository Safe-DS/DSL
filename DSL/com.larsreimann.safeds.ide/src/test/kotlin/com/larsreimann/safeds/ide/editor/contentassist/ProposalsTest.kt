package com.larsreimann.safeds.ide.editor.contentassist

import com.google.inject.Inject
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.testing.ParseHelper
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
import com.larsreimann.safeds.testing.assertions.findUniqueDeclarationOrFail
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
@InjectWith(SafeDSInjectorProvider::class)
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
                .filterIsInstance<SdsStep>()
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

            val placeholder = context.findUniqueDeclarationOrFail<SdsPlaceholder>("test_placeholder_a")
            val stepA = context.findUniqueDeclarationOrFail<SdsStep>("matching_a")
            val stepB = context.findUniqueDeclarationOrFail<SdsStep>("matching_b")

            val descriptions = listCallablesWithMatchingParameters(context, listOf(placeholder))
            descriptions.shouldContainValue(stepA)
            descriptions.shouldNotContainValue(stepB)
        }

        @Test
        fun `should contain only steps with matching parameters when a result is passed`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val result = context.findUniqueDeclarationOrFail<SdsResult>("test_result_a")
            val stepA = context.findUniqueDeclarationOrFail<SdsStep>("matching_a")
            val stepB = context.findUniqueDeclarationOrFail<SdsStep>("matching_b")

            val descriptions = listCallablesWithMatchingParameters(context, listOf(result))
            descriptions.shouldContainValue(stepA)
            descriptions.shouldNotContainValue(stepB)
        }

        @Test
        fun `should contain only steps with matching parameters when multiple declarations are passed (1)`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val result = context.findUniqueDeclarationOrFail<SdsResult>("test_result_c")
            val matchingStep = context.findUniqueDeclarationOrFail<SdsStep>("matching_multiple_c")
            val nonMatchingStep = context.findUniqueDeclarationOrFail<SdsStep>("not_matching_multiple_c")

            val descriptions = listCallablesWithMatchingParameters(context, listOf(result, result))
            descriptions.shouldContainValue(matchingStep)
            descriptions.shouldNotContainValue(nonMatchingStep)
        }

        @Test
        fun `should contain only steps with matching parameters when multiple declarations are passed (2)`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val result = context.findUniqueDeclarationOrFail<SdsResult>("test_result_c")
            val placeholder = context.findUniqueDeclarationOrFail<SdsPlaceholder>("test_placeholder_d")
            val matchingStep1 = context.findUniqueDeclarationOrFail<SdsStep>("matching_multiple_c_d")
            val matchingStep2 = context.findUniqueDeclarationOrFail<SdsStep>("matching_multiple_d_c")

            // Inverse order of placeholder and result compared to (3)
            val descriptions = listCallablesWithMatchingParameters(context, listOf(result, placeholder))
            descriptions.shouldContainValue(matchingStep1)
            descriptions.shouldContainValue(matchingStep2)
        }

        @Test
        fun `should contain only steps with matching parameters when multiple declarations are passed (3)`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val result = context.findUniqueDeclarationOrFail<SdsResult>("test_result_c")
            val placeholder = context.findUniqueDeclarationOrFail<SdsPlaceholder>("test_placeholder_d")
            val matchingStep1 = context.findUniqueDeclarationOrFail<SdsStep>("matching_multiple_c_d")
            val matchingStep2 = context.findUniqueDeclarationOrFail<SdsStep>("matching_multiple_d_c")

            // Inverse order of placeholder and result compared to (2)
            val descriptions = listCallablesWithMatchingParameters(context, listOf(placeholder, result))
            descriptions.shouldContainValue(matchingStep1)
            descriptions.shouldContainValue(matchingStep2)
        }

        @Test
        fun `should contain methods defined directly on class`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val result = context.findUniqueDeclarationOrFail<SdsResult>("test_result_c")
            val matchingMethod = context.findUniqueDeclarationOrFail<SdsFunction>("someMethod")

            // Inverse order of placeholder and result compared to (2)
            val descriptions = listCallablesWithMatchingParameters(context, listOf(result))
            descriptions.shouldContainValue(matchingMethod)
        }

        @Test
        fun `should contain methods defined on superclass`() {
            val context = parseHelper.parseProgramText(testProgram)
            context.shouldNotBeNull()

            val placeholder = context.findUniqueDeclarationOrFail<SdsPlaceholder>("test_placeholder_d")
            val matchingMethod = context.findUniqueDeclarationOrFail<SdsFunction>("someMethod")

            // Inverse order of placeholder and result compared to (2)
            val descriptions = listCallablesWithMatchingParameters(context, listOf(placeholder))
            descriptions.shouldContainValue(matchingMethod)
        }
    }
}
