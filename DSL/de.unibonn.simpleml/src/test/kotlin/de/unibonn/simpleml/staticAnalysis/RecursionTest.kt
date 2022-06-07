package de.unibonn.simpleml.staticAnalysis

import com.google.inject.Inject
import de.unibonn.simpleml.emf.annotationCallsOrEmpty
import de.unibonn.simpleml.emf.descendants
import de.unibonn.simpleml.simpleML.SmlCall
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.simpleML.SmlStep
import de.unibonn.simpleml.testing.ParseHelper
import de.unibonn.simpleml.testing.SimpleMLInjectorProvider
import de.unibonn.simpleml.testing.assertions.findUniqueDeclarationOrFail
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
@InjectWith(SimpleMLInjectorProvider::class)
class RecursionTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    private lateinit var compilationUnit: SmlCompilationUnit

    @BeforeAll
    fun reset() {
        compilationUnit = parseHelper
            .parseResource("staticAnalysis/recursion.smltest")
            .shouldNotBeNull()
    }

    @ParameterizedTest(name = "isRecursive should return {1} for all calls in {0}")
    @MethodSource("stepSource")
    fun `should mark exactly calls that trigger recursion as recursive`(
        stepName: String,
        callsShouldBeRecursive: Boolean
    ) {
        val step = compilationUnit
            .findUniqueDeclarationOrFail<SmlStep>(stepName)
            .shouldNotBeNull()

        step.descendants<SmlCall>().toList().forEach { call ->
            NodeModelUtils.getNode(call).text.trim().asClue {
                call.isRecursive() shouldBe callsShouldBeRecursive
            }
        }
    }

    private fun stepSource(): List<Arguments> {
        return compilationUnit.descendants<SmlStep>()
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
