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
import com.larsreimann.safeds.safeDS.SdsTemplateStringInner
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
class SafeDSTEMPLATE_STRING_INNERValueConverterTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Inject
    private lateinit var templateStringInnerValueConverter: SafeDSTEMPLATE_STRING_INNERValueConverter

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

            val stringTemplateParts = compilationUnit.descendants<SdsTemplateStringInner>().toList()
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
            val stringTemplate = createSdsTemplateString(
                listOf("start", "inner", "end"),
                listOf(createSdsNull(), createSdsNull())
            )

            createSdsDummyResource(fileName = "test", SdsFileExtension.Test, packageName = "test") {
                sdsPipeline("test") {
                    sdsExpressionStatement(stringTemplate)
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
