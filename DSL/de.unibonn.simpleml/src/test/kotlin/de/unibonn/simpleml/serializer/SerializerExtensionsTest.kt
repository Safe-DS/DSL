@file:Suppress("ClassName")

package de.unibonn.simpleml.serializer

import com.google.inject.Inject
import de.unibonn.simpleml.emf.createSmlCompilationUnit
import de.unibonn.simpleml.simpleML.SimpleMLPackage
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.testing.ParseHelper
import de.unibonn.simpleml.testing.SimpleMLInjectorProvider
import de.unibonn.simpleml.testing.assertions.findUniqueDeclarationOrFail
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldNotContain
import io.kotest.matchers.types.shouldBeInstanceOf
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(InjectionExtension::class)
@InjectWith(SimpleMLInjectorProvider::class)
class SerializerExtensionsTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    private val factory = SimpleMLPackage.eINSTANCE.simpleMLFactory

    @Nested
    inner class serializeToFormattedString {

        @Test
        fun `should serialize and format a complete EMF model created from a resource`() {
            val compilationUnit =
                parseHelper.parseResource("serialization/extensionsTest.sdstest")
            compilationUnit.shouldNotBeNull()

            val result = compilationUnit.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code.shouldBe(
                """
                |package tests
                |
                |class MyClass {
                |    attr myAttribute: Int
                |}
                """.trimMargin()
            )
        }

        @Test
        fun `should serialize and format a subtree of the EMF model from a resource`() {
            val compilationUnit =
                parseHelper.parseResource("serialization/extensionsTest.sdstest")
            compilationUnit.shouldNotBeNull()

            val `class` = compilationUnit.findUniqueDeclarationOrFail<SmlClass>("MyClass")

            val result = `class`.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code.shouldBe(
                """class MyClass {
                |    attr myAttribute: Int
                |}
                """.trimMargin()
            )
        }

        @Test
        fun `should use line feed as line separator`() {
            val compilationUnit =
                parseHelper.parseResource("serialization/extensionsTest.sdstest")
            compilationUnit.shouldNotBeNull()

            val `class` = compilationUnit.findUniqueDeclarationOrFail<SmlClass>("MyClass")

            val result = `class`.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code.count { it == '\n' } shouldBe 2

            if (System.lineSeparator() != "\n") {
                result.code.shouldNotContain(System.lineSeparator())
            }
        }

        @Test
        fun `should not serialize EObjects without Resource`() {
            val compilationUnit = createSmlCompilationUnit(packageName = "test")

            val result = compilationUnit.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.NotInResourceFailure>()
        }

        @Test
        fun `should not serialize wrong EMF models`() {
            val compilationUnit = factory.createSmlCompilationUnit().apply {
                // Missing SmlAnnotationCallHolder
                members += factory.createSmlClass().apply {
                    name = "tests"
                }
            }

            val dummyResource = XtextResource()
            dummyResource.contents += compilationUnit

            val result = compilationUnit.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.WrongEmfModelStructureFailure>()
        }
    }
}
