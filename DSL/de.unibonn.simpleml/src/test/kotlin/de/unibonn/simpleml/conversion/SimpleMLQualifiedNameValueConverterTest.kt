@file:Suppress("ClassName")

package de.unibonn.simpleml.conversion

import com.google.inject.Inject
import de.unibonn.simpleml.constant.SmlFileExtension
import de.unibonn.simpleml.emf.createSmlCompilationUnit
import de.unibonn.simpleml.emf.createSmlDummyResource
import de.unibonn.simpleml.emf.createSmlImport
import de.unibonn.simpleml.serializer.SerializationResult
import de.unibonn.simpleml.serializer.serializeToFormattedString
import de.unibonn.simpleml.testing.ParseHelper
import de.unibonn.simpleml.testing.SimpleMLInjectorProvider
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
@InjectWith(SimpleMLInjectorProvider::class)
class SimpleMLQualifiedNameValueConverterTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Inject
    private lateinit var qualifiedNameValueConverter: QualifiedNameValueConverter

    @Nested
    inner class toValue {
        @Test
        fun `should remove backticks (direct converter call, no wildcard)`() {
            qualifiedNameValueConverter.toValue("simpleml.`package`", null) shouldBe "simpleml.package"
        }

        @Test
        fun `should remove backticks (direct converter call, with wildcard)`() {
            qualifiedNameValueConverter.toValue("simpleml.`package`.*", null) shouldBe "simpleml.package.*"
        }

        @Test
        fun `should remove backticks (file, no wildcard)`() {
            val compilationUnit =
                parseHelper.parseResource("conversion/qualifiedNameValueConverter.sdstest")
            compilationUnit.shouldNotBeNull()

            compilationUnit.name shouldBe "simpleml.package"
        }

        @Test
        fun `should remove backticks (file, with wildcard)`() {
            val compilationUnit =
                parseHelper.parseResource("conversion/qualifiedNameValueConverter.sdstest")
            compilationUnit.shouldNotBeNull()

            compilationUnit.name.shouldNotBeNull()

            val imports = compilationUnit.imports
            imports.shouldHaveSize(1)

            imports[0].importedNamespace shouldBe "simpleml.package.*"
        }
    }

    @Nested
    inner class toString {
        @Test
        fun `should escape keywords (direct converter call, no wildcard)`() {
            qualifiedNameValueConverter.toString("simpleml.package") shouldBe "simpleml.`package`"
        }

        @Test
        fun `should escape keywords (direct converter call, with wildcard)`() {
            qualifiedNameValueConverter.toString("simpleml.package.*") shouldBe "simpleml.`package`.*"
        }

        @Test
        fun `should escape keywords (creator, no wildcard)`() {
            val compilationUnit = createSmlCompilationUnit(packageName = "simpleml.package")
            createSmlDummyResource(
                "test",
                SmlFileExtension.Test,
                compilationUnit
            )

            val result = compilationUnit.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "package simpleml.`package`"
        }

        @Test
        fun `should escape keywords (creator, with wildcard)`() {
            val import = createSmlImport("simpleml.package.*")
            createSmlDummyResource(
                fileName = "test",
                SmlFileExtension.Test,
                createSmlCompilationUnit(packageName = "test", imports = listOf(import))
            )

            val result = import.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "import simpleml.`package`.*"
        }

        @Test
        fun `should not escape non-keywords (direct converter call, no wildcard)`() {
            qualifiedNameValueConverter.toString("simpleml.notAKeyword") shouldBe "simpleml.notAKeyword"
        }

        @Test
        fun `should not escape non-keywords (direct converter call, with wildcard)`() {
            qualifiedNameValueConverter.toString("simpleml.notAKeyword.*") shouldBe "simpleml.notAKeyword.*"
        }

        @Test
        fun `should not escape non-keywords (creator, no wildcard)`() {
            val compilationUnit = createSmlCompilationUnit(packageName = "simpleml.notAKeyword")
            createSmlDummyResource(
                "test",
                SmlFileExtension.Test,
                compilationUnit
            )

            val result = compilationUnit.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "package simpleml.notAKeyword"
        }

        @Test
        fun `should not escape non-keywords (creator, with wildcard)`() {
            val import = createSmlImport("simpleml.notAKeyword.*")
            createSmlDummyResource(
                fileName = "test",
                SmlFileExtension.Test,
                createSmlCompilationUnit(packageName = "test", imports = listOf(import))
            )

            val result = import.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "import simpleml.notAKeyword.*"
        }
    }
}
