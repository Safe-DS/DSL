@file:Suppress("ClassName")

package com.larsreimann.safeds.conversion

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
import com.larsreimann.safeds.safeDS.SdsTemplateStringEnd
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
class SafeSDTEMPLATE_STRING_ENDValueConverterTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Inject
    private lateinit var templateStringEndValueConverter: SimpleMLTEMPLATE_STRING_ENDValueConverter

    @Nested
    inner class toValue {
        @Test
        fun `should remove delimiters (direct converter call)`() {
            templateStringEndValueConverter.toValue("}}end\"", null) shouldBe "end"
        }

        @Test
        fun `should remove delimiters (file)`() {
            val compilationUnit = parseHelper.parseResource(
                "conversion/templateStringPartValueConverter.sdstest"
            ) // readProgramTextFromResource(resourceName)?.let { parseHelper.parse(it) }
            compilationUnit.shouldNotBeNull()

            val stringTemplateParts = compilationUnit.descendants<SmlTemplateStringEnd>().toList()
            stringTemplateParts.shouldHaveSize(1)

            stringTemplateParts[0].value shouldBe "end"
        }
    }

    @Nested
    inner class toString {
        @Test
        fun `should add delimiters (direct converter call)`() {
            templateStringEndValueConverter.toString("end") shouldBe "}}end\""
        }

        @Test
        fun `should add delimiters (creator)`() {
            val stringTemplate = createSmlTemplateString(
                listOf("start", "end"),
                listOf(createSmlNull())
            )

            createSmlDummyResource(fileName = "test", SmlFileExtension.Test, packageName = "test") {
                smlWorkflow("test") {
                    smlExpressionStatement(stringTemplate)
                }
            }

            val expressions = stringTemplate.expressions
            expressions.shouldHaveSize(3)

            val result = expressions[2].serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "}}end\""
        }
    }
}
