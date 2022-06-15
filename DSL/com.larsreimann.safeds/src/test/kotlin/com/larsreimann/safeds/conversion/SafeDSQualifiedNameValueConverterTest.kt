@file:Suppress("ClassName")

package com.larsreimann.safeds.conversion

import com.google.inject.Inject
import com.larsreimann.safeds.constant.SdsFileExtension
import com.larsreimann.safeds.emf.createSdsCompilationUnit
import com.larsreimann.safeds.emf.createSdsDummyResource
import com.larsreimann.safeds.emf.createSdsImport
import com.larsreimann.safeds.serializer.SerializationResult
import com.larsreimann.safeds.serializer.serializeToFormattedString
import com.larsreimann.safeds.testing.ParseHelper
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.eclipse.xtext.conversion.impl.QualifiedNameValueConverter
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(InjectionExtension::class)
@InjectWith(SafeDSInjectorProvider::class)
class SafeDSQualifiedNameValueConverterTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Inject
    private lateinit var qualifiedNameValueConverter: QualifiedNameValueConverter

    @Nested
    inner class toValue {
        @Test
        fun `should remove backticks (direct converter call, no wildcard)`() {
            qualifiedNameValueConverter.toValue("safeds.`package`", null) shouldBe "safeds.package"
        }

        @Test
        fun `should remove backticks (direct converter call, with wildcard)`() {
            qualifiedNameValueConverter.toValue("safeds.`package`.*", null) shouldBe "safeds.package.*"
        }

        @Test
        fun `should remove backticks (file, no wildcard)`() {
            val compilationUnit =
                parseHelper.parseResource("conversion/qualifiedNameValueConverter.sdstest")
            compilationUnit.shouldNotBeNull()

            compilationUnit.name shouldBe "safeds.package"
        }

        @Test
        fun `should remove backticks (file, with wildcard)`() {
            val compilationUnit =
                parseHelper.parseResource("conversion/qualifiedNameValueConverter.sdstest")
            compilationUnit.shouldNotBeNull()

            compilationUnit.name.shouldNotBeNull()

            val imports = compilationUnit.imports
            imports.shouldHaveSize(1)

            imports[0].importedNamespace shouldBe "safeds.package.*"
        }
    }

    @Nested
    inner class toString {
        @Test
        fun `should escape keywords (direct converter call, no wildcard)`() {
            qualifiedNameValueConverter.toString("safeds.package") shouldBe "safeds.`package`"
        }

        @Test
        fun `should escape keywords (direct converter call, with wildcard)`() {
            qualifiedNameValueConverter.toString("safeds.package.*") shouldBe "safeds.`package`.*"
        }

        @Test
        fun `should escape keywords (creator, no wildcard)`() {
            val compilationUnit = createSdsCompilationUnit(packageName = "safeds.package")
            createSdsDummyResource(
                "test",
                SdsFileExtension.Test,
                compilationUnit
            )

            val result = compilationUnit.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "package safeds.`package`"
        }

        @Test
        fun `should escape keywords (creator, with wildcard)`() {
            val import = createSdsImport("safeds.package.*")
            createSdsDummyResource(
                fileName = "test",
                SdsFileExtension.Test,
                createSdsCompilationUnit(packageName = "test", imports = listOf(import))
            )

            val result = import.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "import safeds.`package`.*"
        }

        @Test
        fun `should not escape non-keywords (direct converter call, no wildcard)`() {
            qualifiedNameValueConverter.toString("safeds.notAKeyword") shouldBe "safeds.notAKeyword"
        }

        @Test
        fun `should not escape non-keywords (direct converter call, with wildcard)`() {
            qualifiedNameValueConverter.toString("safeds.notAKeyword.*") shouldBe "safeds.notAKeyword.*"
        }

        @Test
        fun `should not escape non-keywords (creator, no wildcard)`() {
            val compilationUnit = createSdsCompilationUnit(packageName = "safeds.notAKeyword")
            createSdsDummyResource(
                "test",
                SdsFileExtension.Test,
                compilationUnit
            )

            val result = compilationUnit.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "package safeds.notAKeyword"
        }

        @Test
        fun `should not escape non-keywords (creator, with wildcard)`() {
            val import = createSdsImport("safeds.notAKeyword.*")
            createSdsDummyResource(
                fileName = "test",
                SdsFileExtension.Test,
                createSdsCompilationUnit(packageName = "test", imports = listOf(import))
            )

            val result = import.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "import safeds.notAKeyword.*"
        }
    }
}
