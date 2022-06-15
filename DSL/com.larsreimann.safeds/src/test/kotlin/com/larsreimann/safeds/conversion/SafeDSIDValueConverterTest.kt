@file:Suppress("ClassName")

package com.larsreimann.safeds.conversion

import com.google.inject.Inject
import com.larsreimann.safeds.constant.SdsFileExtension
import com.larsreimann.safeds.emf.createSdsClass
import com.larsreimann.safeds.emf.createSdsCompilationUnit
import com.larsreimann.safeds.emf.createSdsDummyResource
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.serializer.SerializationResult
import com.larsreimann.safeds.serializer.serializeToFormattedString
import com.larsreimann.safeds.testing.ParseHelper
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
import com.larsreimann.safeds.testing.assertions.findUniqueDeclarationOrFail
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
@InjectWith(SafeDSInjectorProvider::class)
class SafeDSIDValueConverterTest {

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

            val `class` = compilationUnit.findUniqueDeclarationOrFail<SdsClass>("class")
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
            val `class` = createSdsClass("class")
            val compilationUnit = createSdsCompilationUnit(packageName = "test", members = listOf(`class`))
            createSdsDummyResource("test", SdsFileExtension.Test, compilationUnit)

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
            val `class` = createSdsClass("notAKeyword")
            val compilationUnit = createSdsCompilationUnit(packageName = "notAKeyword", members = listOf(`class`))
            createSdsDummyResource("test", SdsFileExtension.Test, compilationUnit)

            val result = `class`.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "class notAKeyword"
        }
    }
}
