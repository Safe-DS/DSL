@file:Suppress("ClassName")

package de.unibonn.simpleml.conversion

import com.google.inject.Inject
import de.unibonn.simpleml.constant.SmlFileExtension
import de.unibonn.simpleml.emf.createSmlDummyResource
import de.unibonn.simpleml.emf.createSmlNull
import de.unibonn.simpleml.emf.createSmlTemplateString
import de.unibonn.simpleml.emf.descendants
import de.unibonn.simpleml.emf.smlExpressionStatement
import de.unibonn.simpleml.emf.smlWorkflow
import de.unibonn.simpleml.serializer.SerializationResult
import de.unibonn.simpleml.serializer.serializeToFormattedString
import de.unibonn.simpleml.simpleML.SmlTemplateStringInner
import de.unibonn.simpleml.testing.ParseHelper
import de.unibonn.simpleml.testing.SimpleMLInjectorProvider
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(InjectionExtension::class)
@InjectWith(SimpleMLInjectorProvider::class)
class SimpleMLTEMPLATE_STRING_INNERValueConverterTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Inject
    private lateinit var templateStringInnerValueConverter: SimpleMLTEMPLATE_STRING_INNERValueConverter

    @Nested
    inner class toValue {
        @Test
        fun `should remove delimiters (direct converter call)`() {
            templateStringInnerValueConverter.toValue("}}inner{{", null) shouldBe "inner"
        }

        @Test
        fun `should remove delimiters (file)`() {
            val compilationUnit = parseHelper.parseResource(
                "conversion/templateStringPartValueConverter.sdstest"
            ) // readProgramTextFromResource(resourceName)?.let { parseHelper.parse(it) }
            compilationUnit.shouldNotBeNull()

            val stringTemplateParts = compilationUnit.descendants<SmlTemplateStringInner>().toList()
            stringTemplateParts.shouldHaveSize(1)

            stringTemplateParts[0].value shouldBe "inner"
        }
    }

    @Nested
    inner class toString {
        @Test
        fun `should add delimiters (direct converter call)`() {
            templateStringInnerValueConverter.toString("inner") shouldBe "}}inner{{"
        }

        @Test
        fun `should add delimiters (creator)`() {
            val stringTemplate = createSmlTemplateString(
                listOf("start", "inner", "end"),
                listOf(createSmlNull(), createSmlNull())
            )

            createSmlDummyResource(fileName = "test", SmlFileExtension.Test, packageName = "test") {
                smlWorkflow("test") {
                    smlExpressionStatement(stringTemplate)
                }
            }

            val expressions = stringTemplate.expressions
            expressions.shouldHaveSize(5)

            val result = expressions[2].serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "}}inner{{"
        }
    }
}
