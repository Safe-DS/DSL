package com.larsreimann.safeds.stdlibAccess

import com.google.inject.Inject
import com.larsreimann.safeds.constant.SdsFileExtension
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.testing.ParseHelper
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
import com.larsreimann.safeds.testing.assertions.findUniqueDeclarationOrFail
import io.kotest.matchers.booleans.shouldBeFalse
import io.kotest.matchers.booleans.shouldBeTrue
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

private const val testRoot = "stdlibAccess/annotations"

@ExtendWith(InjectionExtension::class)
@InjectWith(SafeDSInjectorProvider::class)
class StdlibAnnotationsTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Nested
    inner class DescriptionOrNull {

        @Test
        fun `should return description if it exists and is unique`() = withCompilationUnit("description") {
            val testData = findUniqueDeclarationOrFail<SdsFunction>("functionWithUniqueDescription")
            testData.descriptionOrNull() shouldBe "Lorem ipsum"
        }

        @Test
        fun `should return null if description is not unique`() = withCompilationUnit("description") {
            val testData = findUniqueDeclarationOrFail<SdsFunction>("functionWithMultipleDescriptions")
            testData.descriptionOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if declaration does not have a description`() = withCompilationUnit("description") {
            val testData = findUniqueDeclarationOrFail<SdsFunction>("functionWithoutDescription")
            testData.descriptionOrNull().shouldBeNull()
        }
    }

    @Nested
    inner class IsDeprecated {

        @Test
        fun `should return false if the declaration is not deprecated`() = withCompilationUnit("deprecated") {
            val testData = findUniqueDeclarationOrFail<SdsFunction>("nonDeprecatedFunction")
            testData.isDeprecated().shouldBeFalse()
        }

        @Test
        fun `should return true if the declaration is deprecated`() = withCompilationUnit("deprecated") {
            val testData = findUniqueDeclarationOrFail<SdsFunction>("deprecatedFunction")
            testData.isDeprecated().shouldBeTrue()
        }
    }

    @Nested
    inner class IsPure {

        @Test
        fun `should return false if the function is not pure`() = withCompilationUnit("pure") {
            val testData = findUniqueDeclarationOrFail<SdsFunction>("impureFunction")
            testData.isPure().shouldBeFalse()
        }

        @Test
        fun `should return true if the function is pure`() = withCompilationUnit("pure") {
            val testData = findUniqueDeclarationOrFail<SdsFunction>("pureFunction")
            testData.isPure().shouldBeTrue()
        }
    }

    @Nested
    inner class IsRepeatable {

        @Test
        fun `should return false if the annotation is not repeatable`() = withCompilationUnit("repeatable") {
            val testData = findUniqueDeclarationOrFail<SdsAnnotation>("UnrepeatableAnnotation")
            testData.isRepeatable().shouldBeFalse()
        }

        @Test
        fun `should return true if the annotation is repeatable`() = withCompilationUnit("repeatable") {
            val testData = findUniqueDeclarationOrFail<SdsAnnotation>("RepeatableAnnotation")
            testData.isRepeatable().shouldBeTrue()
        }
    }

    @Nested
    inner class PythonModuleOrNull {

        @Test
        fun `should return Python module if it exists and is unique`() = withCompilationUnit("pythonModule") {
            pythonModuleOrNull() shouldBe "python_module"
        }

        @Test
        fun `should return null if Python module is not unique`() =
            withCompilationUnit("pythonModuleMultipleAnnotations") {
                pythonModuleOrNull().shouldBeNull()
            }

        @Test
        fun `should return null if compilation unit does not have a Python module`() =
            withCompilationUnit("pythonModuleMissing") {
                pythonModuleOrNull().shouldBeNull()
            }
    }

    @Nested
    inner class PythonNameOrNull {

        @Test
        fun `should return Python name if it exists and is unique`() = withCompilationUnit("pythonName") {
            val testData = findUniqueDeclarationOrFail<SdsFunction>("functionWithUniquePythonName")
            testData.pythonNameOrNull() shouldBe "function_with_python_name"
        }

        @Test
        fun `should return null if Python name is not unique`() = withCompilationUnit("pythonName") {
            val testData = findUniqueDeclarationOrFail<SdsFunction>("functionWithMultiplePythonNames")
            testData.pythonNameOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if compilation unit does not have a Python name`() = withCompilationUnit("pythonName") {
            val testData = findUniqueDeclarationOrFail<SdsFunction>("functionWithoutPythonName")
            testData.pythonNameOrNull().shouldBeNull()
        }
    }

    @Nested
    inner class SinceVersionOrNull {

        @Test
        fun `should return version if it exists and is unique`() = withCompilationUnit("since") {
            val testData = findUniqueDeclarationOrFail<SdsFunction>("functionWithUniqueSince")
            testData.sinceVersionOrNull() shouldBe "1.0.0"
        }

        @Test
        fun `should return null if version is not unique`() = withCompilationUnit("since") {
            val testData = findUniqueDeclarationOrFail<SdsFunction>("functionWithoutSince")
            testData.sinceVersionOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if declaration does not specify the version it was added`() =
            withCompilationUnit("since") {
                val testData = findUniqueDeclarationOrFail<SdsFunction>("functionWithMultipleSinces")
                testData.sinceVersionOrNull().shouldBeNull()
            }
    }

    @Nested
    inner class ValidTargets {

        @Test
        fun `should return targets if it exists and is unique`() = withCompilationUnit("target") {
            val testData = findUniqueDeclarationOrFail<SdsAnnotation>("AnnotationWithUniqueTarget")
            testData.validTargets().shouldContainExactly(StdlibEnums.AnnotationTarget.Class)
        }

        @Test
        fun `should return all possible targets if targets is not unique`() = withCompilationUnit("target") {
            val testData = findUniqueDeclarationOrFail<SdsAnnotation>("AnnotationWithoutTarget")
            testData.validTargets() shouldBe StdlibEnums.AnnotationTarget.values()
        }

        @Test
        fun `should return all possible targets if annotation does not restrict its targets`() =
            withCompilationUnit("target") {
                val testData = findUniqueDeclarationOrFail<SdsAnnotation>("AnnotationWithMultipleTargets")
                testData.validTargets() shouldBe StdlibEnums.AnnotationTarget.values()
            }
    }

    private fun withCompilationUnit(resourceName: String, check: SdsCompilationUnit.() -> Unit) {
        parseHelper
            .parseResource("$testRoot/$resourceName.${SdsFileExtension.Test}")
            .shouldNotBeNull()
            .check()
    }
}
