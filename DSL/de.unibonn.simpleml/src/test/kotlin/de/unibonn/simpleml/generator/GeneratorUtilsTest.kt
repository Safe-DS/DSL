@file:Suppress("ClassName")

package de.unibonn.simpleml.generator

import de.unibonn.simpleml.constant.SmlFileExtension
import de.unibonn.simpleml.emf.createSmlCompilationUnit
import de.unibonn.simpleml.emf.createSmlDummyResource
import de.unibonn.simpleml.simpleML.SimpleMLFactory
import de.unibonn.simpleml.testing.SimpleMLInjectorProvider
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldStartWith
import org.eclipse.emf.common.util.URI
import org.eclipse.xtext.resource.XtextResource
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(InjectionExtension::class)
@InjectWith(SimpleMLInjectorProvider::class)
class GeneratorUtilsTest {

    @Nested
    inner class baseFileName {

        @Test
        fun `should keep only last segment`() {
            val resource = createSmlDummyResource(
                "dir/file",
                SmlFileExtension.Flow,
                createSmlCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull().shouldStartWith("file")
        }

        @Test
        fun `should remove all characters that are not legal in Simple-ML identifiers except spaces`() {
            val resource = createSmlDummyResource(
                "MyöáúName1",
                SmlFileExtension.Flow,
                createSmlCompilationUnit(packageName = "MyName1")
            )

            resource.baseFileNameOrNull() shouldBe "MyName1"
        }

        @Test
        fun `should replace spaces with underscores`() {
            val resource = createSmlDummyResource(
                "file with spaces",
                SmlFileExtension.Flow,
                createSmlCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "file_with_spaces"
        }

        @Test
        fun `should replace twice URL encoded spaces with underscores`() {
            val resource = createSmlDummyResource(
                "_skip_%2520context%2520same%2520package",
                SmlFileExtension.Flow,
                createSmlCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "_skip__context_same_package"
        }

        @Test
        fun `should replace dots with underscores`() {
            val resource = createSmlDummyResource(
                "file.with.dots",
                SmlFileExtension.Flow,
                createSmlCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "file_with_dots"
        }

        @Test
        fun `should replace dashes with underscores`() {
            val resource = createSmlDummyResource(
                "file-with-dashes",
                SmlFileExtension.Flow,
                createSmlCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "file_with_dashes"
        }

        @Test
        fun `should remove 'sdsflow' extension`() {
            val resource = createSmlDummyResource(
                "file",
                SmlFileExtension.Flow,
                createSmlCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "file"
        }

        @Test
        fun `should remove 'sdsstub' extension`() {
            val resource = createSmlDummyResource(
                "file",
                SmlFileExtension.Stub,
                createSmlCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "file"
        }

        @Test
        fun `should remove 'sdstest' extension`() {
            val resource = createSmlDummyResource(
                "file",
                SmlFileExtension.Test,
                createSmlCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "file"
        }

        @Test
        fun `should not remove other extension`() {
            val uri = URI.createURI("dummy:/test.other")
            val resource = XtextResource(uri)

            resource.baseFileNameOrNull() shouldBe "test_other"
        }

        @Test
        fun `should return null if the resource has no URI`() {
            val resource = XtextResource(null)

            resource.baseFileNameOrNull().shouldBeNull()
        }
    }

    @Nested
    inner class baseGeneratedFilePath {

        @Test
        fun `should return the base path for generated files if possible`() {
            val resource = createSmlDummyResource(
                "file",
                SmlFileExtension.Test,
                createSmlCompilationUnit(packageName = "test")
            )

            resource.baseGeneratedFilePathOrNull() shouldBe "test/gen_file"
        }

        @Test
        fun `should return null if the resource has no compilation unit`() {
            val uri = URI.createURI("dummy:/test.other")
            val resource = XtextResource(uri)

            resource.baseGeneratedFilePathOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if the compilation unit has no package`() {
            val resource = createSmlDummyResource(
                "file",
                SmlFileExtension.Test,
                SimpleMLFactory.eINSTANCE.createSmlCompilationUnit()
            )

            resource.baseGeneratedFilePathOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if the resource has no URI`() {
            val resource = XtextResource(null)

            resource.baseGeneratedFilePathOrNull()
        }
    }
}
