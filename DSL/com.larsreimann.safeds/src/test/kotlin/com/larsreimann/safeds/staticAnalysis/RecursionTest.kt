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
class RecursionTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    private lateinit var compilationUnit: SdsCompilationUnit

    @BeforeAll
    fun reset() {
        compilationUnit = parseHelper
            .parseResource("staticAnalysis/recursion.sdstest")
            .shouldNotBeNull()
    }

    @ParameterizedTest(name = "isRecursive should return {1} for all calls in {0}")
    @MethodSource("stepSource")
    fun `should mark exactly calls that trigger recursion as recursive`(
        stepName: String,
        callsShouldBeRecursive: Boolean
    ) {
        val step = compilationUnit
            .findUniqueDeclarationOrFail<SdsStep>(stepName)
            .shouldNotBeNull()

        step.descendants<SdsCall>().toList().forEach { call ->
            NodeModelUtils.getNode(call).text.trim().asClue {
                call.isRecursive() shouldBe callsShouldBeRecursive
            }
        }
    }

    private fun stepSource(): List<Arguments> {
        return compilationUnit.descendants<SdsStep>()
            .mapNotNull { step ->
                val callsShouldBeRecursive = step.annotationCallsOrEmpty().any {
                    it.annotation.name == "CallsShouldBeRecursive"
                }
                val callsShouldNotBeRecursive = step.annotationCallsOrEmpty().any {
                    it.annotation.name == "CallsShouldNotBeRecursive"
                }
                (callsShouldBeRecursive && callsShouldNotBeRecursive).shouldNotBeTrue()

                Arguments.of(step.name, callsShouldBeRecursive)
            }
            .toList()
    }
}
