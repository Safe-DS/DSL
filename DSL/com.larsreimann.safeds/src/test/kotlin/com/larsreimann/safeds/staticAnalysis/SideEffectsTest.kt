package com.larsreimann.safeds.staticAnalysis

import com.google.inject.Inject
import com.larsreimann.safeds.emf.annotationCallsOrEmpty
import com.larsreimann.safeds.emf.descendants
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.testing.ParseHelper
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
import com.larsreimann.safeds.testing.assertions.findUniqueDeclarationOrFail
import io.kotest.assertions.asClue
import io.kotest.matchers.booleans.shouldNotBeTrue
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import org.eclipse.xtext.nodemodel.util.NodeModelUtils
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.Arguments
import org.junit.jupiter.params.provider.MethodSource

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ExtendWith(InjectionExtension::class)
@InjectWith(SafeDSInjectorProvider::class)
class SideEffectsTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    private lateinit var compilationUnit: SdsCompilationUnit

    @BeforeAll
    fun reset() {
        compilationUnit = parseHelper
            .parseResource("staticAnalysis/sideEffects.sdstest")
            .shouldNotBeNull()
    }

    @ParameterizedTest(name = "isPureExpression should return {1} for all calls in {0}")
    @MethodSource("stepSource")
    fun `should mark exactly calls that trigger recursion as recursive`(
        stepName: String,
        callsShouldBePure: Boolean
    ) {
        val step = compilationUnit
            .findUniqueDeclarationOrFail<SdsStep>(stepName)
            .shouldNotBeNull()

        step.descendants<SdsCall>().toList().forEach { call ->
            NodeModelUtils.getNode(call).text.trim().asClue {
                call.expressionHasNoSideEffects() shouldBe callsShouldBePure
            }
        }
    }

    private fun stepSource(): List<Arguments> {
        return compilationUnit.descendants<SdsStep>()
            .mapNotNull { step ->
                val shouldHaveNoSideEffects = step.annotationCallsOrEmpty().any {
                    it.annotation.name == "ShouldHaveNoSideEffects"
                }
                val shouldHaveSideEffects = step.annotationCallsOrEmpty().any {
                    it.annotation.name == "ShouldHaveSideEffects"
                }
                (shouldHaveNoSideEffects && shouldHaveSideEffects).shouldNotBeTrue()

                Arguments.of(step.name, shouldHaveNoSideEffects)
            }
            .toList()
    }
}
