@file:Suppress("ClassName")

package de.unibonn.simpleml.conversion

import com.google.inject.Inject
import de.unibonn.simpleml.constant.SmlFileExtension
import de.unibonn.simpleml.emf.createSmlClass
import de.unibonn.simpleml.emf.createSmlCompilationUnit
import de.unibonn.simpleml.emf.createSmlDummyResource
import de.unibonn.simpleml.serializer.SerializationResult
import de.unibonn.simpleml.serializer.serializeToFormattedString
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.testing.ParseHelper
import de.unibonn.simpleml.testing.SimpleMLInjectorProvider
import de.unibonn.simpleml.testing.assertions.findUniqueDeclarationOrFail
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.eclipse.xtext.conversion.impl.IDValueConverter
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(InjectionExtension::class)
@InjectWith(SimpleMLInjectorProvider::class)
class SimpleMLIDValueConverterTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Inject
    private lateinit var idValueConverter: IDValueConverter

    @Nested
    inner class toValue {
        @Test
        fun `should remove backticks (direct converter call)`() {
            idValueConverter.toValue("`package`", null) shouldBe "package"
        }

        @Test
        fun `should remove backticks (file)`() {
            val compilationUnit =
                parseHelper.parseResource("conversion/idValueConverter.sdstest")
            compilationUnit.shouldNotBeNull()

            val `class` = compilationUnit.findUniqueDeclarationOrFail<SmlClass>("class")
            `class`.shouldNotBeNull()
        }
    }

    @Nested
    inner class toString {
        @Test
        fun `should escape keywords (direct converter call)`() {
            idValueConverter.toString("package") shouldBe "`package`"
        }

        @Test
        fun `should escape keywords (creator)`() {
            val `class` = createSmlClass("class")
            val compilationUnit = createSmlCompilationUnit(packageName = "test", members = listOf(`class`))
            createSmlDummyResource("test", SmlFileExtension.Test, compilationUnit)

            val result = `class`.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "class `class`"
        }

        @Test
        fun `should not escape non-keywords (direct converter call)`() {
            idValueConverter.toString("notAKeyword") shouldBe "notAKeyword"
        }

        @Test
        fun `should not escape non-keywords (creator)`() {
            val `class` = createSmlClass("notAKeyword")
            val compilationUnit = createSmlCompilationUnit(packageName = "notAKeyword", members = listOf(`class`))
            createSmlDummyResource("test", SmlFileExtension.Test, compilationUnit)

            val result = `class`.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "class notAKeyword"
        }
    }
}
