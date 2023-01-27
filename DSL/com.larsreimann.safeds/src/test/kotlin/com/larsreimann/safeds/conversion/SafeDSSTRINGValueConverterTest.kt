@file:Suppress("ClassName")

package com.larsreimann.safeds.conversion

import com.google.inject.Inject
import com.larsreimann.safeds.constant.SdsFileExtension
import com.larsreimann.safeds.emf.createSdsDummyResource
import com.larsreimann.safeds.emf.createSdsString
import com.larsreimann.safeds.emf.descendants
import com.larsreimann.safeds.emf.sdsExpressionStatement
import com.larsreimann.safeds.emf.sdsPipeline
import com.larsreimann.safeds.safeDS.SdsPipeline
import com.larsreimann.safeds.safeDS.SdsString
import com.larsreimann.safeds.serializer.SerializationResult
import com.larsreimann.safeds.serializer.serializeToFormattedString
import com.larsreimann.safeds.testing.ParseHelper
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
import com.larsreimann.safeds.testing.assertions.findUniqueDeclarationOrFail
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.eclipse.xtext.conversion.impl.STRINGValueConverter
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(InjectionExtension::class)
@InjectWith(SafeDSInjectorProvider::class)
class SafeDSSTRINGValueConverterTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Inject
    private lateinit var stringValueConverter: STRINGValueConverter

    @Nested
    inner class toValue {
        @Test
        fun `should unescape opening curly brace (direct converter call)`() {
            stringValueConverter.toValue("\"\\{\"", null) shouldBe "{"
        }

        @Test
        fun `should unescape opening curly brace (file)`() {
            val compilationUnit =
                parseHelper.parseResource("conversion/stringValueConverter.sdstest")
            compilationUnit.shouldNotBeNull()

            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("escapedOpeningBrace")

            val strings = pipeline.descendants<SdsString>().toList()
            strings.shouldHaveSize(1)
            strings[0].value shouldBe "{"
        }

        @Test
        fun `should unescape single quote (direct converter call)`() {
            stringValueConverter.toValue("\"\\'\"", null) shouldBe "'"
        }

        @Test
        fun `should unescape single quote (file)`() {
            val compilationUnit =
                parseHelper.parseResource("conversion/stringValueConverter.sdstest")
            compilationUnit.shouldNotBeNull()

            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("escapedSingleQuote")

            val strings = pipeline.descendants<SdsString>().toList()
            strings.shouldHaveSize(1)
            strings[0].value shouldBe "'"
        }
    }

    @Nested
    inner class toString {
        @Test
        fun `should escape opening curly brace (direct converter call)`() {
            stringValueConverter.toString("{") shouldBe "\"\\{\""
        }

        @Test
        fun `should keep escaped opening curly brace (file)`() {
            val compilationUnit =
                parseHelper.parseResource("conversion/stringValueConverter.sdstest")
            compilationUnit.shouldNotBeNull()

            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("escapedOpeningBrace")

            val strings = pipeline.descendants<SdsString>().toList()
            strings.shouldHaveSize(1)

            val result = strings[0].serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "\"\\{\""
        }

        @Test
        fun `should keep unescaped opening curly brace (file)`() {
            val compilationUnit =
                parseHelper.parseResource("conversion/stringValueConverter.sdstest")
            compilationUnit.shouldNotBeNull()

            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("unescapedOpeningBrace")

            val strings = pipeline.descendants<SdsString>().toList()
            strings.shouldHaveSize(1)

            val result = strings[0].serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "\"{\""
        }

        @Test
        fun `should always escape opening curly brace (creator)`() {
            val string = createSdsString("{")

            createSdsDummyResource(fileName = "test", SdsFileExtension.Test, packageName = "test") {
                sdsPipeline("test") {
                    sdsExpressionStatement(string)
                }
            }

            val result = string.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "\"\\{\""
        }

        @Test
        fun `should not escape single quote (direct converter call)`() {
            stringValueConverter.toString("'") shouldBe "\"'\""
        }

        @Test
        fun `should not escape single quote (file)`() {
            val compilationUnit =
                parseHelper.parseResource("conversion/stringValueConverter.sdstest")
            compilationUnit.shouldNotBeNull()

            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("unescapedSingleQuote")

            val strings = pipeline.descendants<SdsString>().toList()
            strings.shouldHaveSize(1)

            val result = strings[0].serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "\"'\""
        }

        @Test
        fun `should not escape single quote (creator)`() {
            val string = createSdsString("'")

            createSdsDummyResource(fileName = "test", SdsFileExtension.Test, packageName = "test") {
                sdsPipeline("test") {
                    sdsExpressionStatement(string)
                }
            }

            val result = string.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "\"'\""
        }
    }
}
