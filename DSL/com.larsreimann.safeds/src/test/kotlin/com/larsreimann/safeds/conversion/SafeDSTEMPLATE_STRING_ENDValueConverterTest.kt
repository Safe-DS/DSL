@file:Suppress("ClassName")

package com.larsreimann.safeds.conversion

import com.google.inject.Inject
import com.larsreimann.safeds.constant.SdsFileExtension
import com.larsreimann.safeds.emf.createSdsDummyResource
import com.larsreimann.safeds.emf.createSdsNull
import com.larsreimann.safeds.emf.createSdsTemplateString
import com.larsreimann.safeds.emf.descendants
import com.larsreimann.safeds.emf.sdsExpressionStatement
import com.larsreimann.safeds.emf.sdsPipeline
import com.larsreimann.safeds.safeDS.SdsTemplateStringEnd
import com.larsreimann.safeds.serializer.SerializationResult
import com.larsreimann.safeds.serializer.serializeToFormattedString
import com.larsreimann.safeds.testing.ParseHelper
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
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
@InjectWith(SafeDSInjectorProvider::class)
class SafeDSTEMPLATE_STRING_ENDValueConverterTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Inject
    private lateinit var templateStringEndValueConverter: SafeDSTEMPLATE_STRING_ENDValueConverter

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

            val stringTemplateParts = compilationUnit.descendants<SdsTemplateStringEnd>().toList()
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
            val stringTemplate = createSdsTemplateString(
                listOf("start", "end"),
                listOf(createSdsNull())
            )

            createSdsDummyResource(fileName = "test", SdsFileExtension.Test, packageName = "test") {
                sdsPipeline("test") {
                    sdsExpressionStatement(stringTemplate)
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
