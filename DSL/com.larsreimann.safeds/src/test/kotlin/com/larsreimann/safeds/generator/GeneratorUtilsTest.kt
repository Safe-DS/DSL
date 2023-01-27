@file:Suppress("ClassName")

package com.larsreimann.safeds.generator

import com.larsreimann.safeds.constant.SdsFileExtension
import com.larsreimann.safeds.emf.createSdsCompilationUnit
import com.larsreimann.safeds.emf.createSdsDummyResource
import com.larsreimann.safeds.safeDS.SafeDSFactory
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
import com.larsreimann.safeds.utils.ExperimentalSdsApi
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
@InjectWith(SafeDSInjectorProvider::class)
class GeneratorUtilsTest {

    @Nested
    inner class baseFileName {

        @Test
        fun `should keep only last segment`() {
            val resource = createSdsDummyResource(
                "dir/file",
                SdsFileExtension.Pipeline,
                createSdsCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull().shouldStartWith("file")
        }

        @Test
        fun `should remove all characters that are not legal in Safe-DS identifiers except spaces`() {
            val resource = createSdsDummyResource(
                "MyöáúName1",
                SdsFileExtension.Pipeline,
                createSdsCompilationUnit(packageName = "MyName1")
            )

            resource.baseFileNameOrNull() shouldBe "MyName1"
        }

        @Test
        fun `should replace spaces with underscores`() {
            val resource = createSdsDummyResource(
                "file with spaces",
                SdsFileExtension.Pipeline,
                createSdsCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "file_with_spaces"
        }

        @Test
        fun `should replace twice URL encoded spaces with underscores`() {
            val resource = createSdsDummyResource(
                "_skip_%2520context%2520same%2520package",
                SdsFileExtension.Pipeline,
                createSdsCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "_skip__context_same_package"
        }

        @Test
        fun `should replace dots with underscores`() {
            val resource = createSdsDummyResource(
                "file.with.dots",
                SdsFileExtension.Pipeline,
                createSdsCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "file_with_dots"
        }

        @Test
        fun `should replace dashes with underscores`() {
            val resource = createSdsDummyResource(
                "file-with-dashes",
                SdsFileExtension.Pipeline,
                createSdsCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "file_with_dashes"
        }

        @Test
        fun `should remove 'sdspipe' extension`() {
            val resource = createSdsDummyResource(
                "file",
                SdsFileExtension.Pipeline,
                createSdsCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "file"
        }

        @Test
        @OptIn(ExperimentalSdsApi::class)
        fun `should remove 'sdsschema' extension`() {
            val resource = createSdsDummyResource(
                "file",
                SdsFileExtension.Schema,
                createSdsCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "file"
        }

        @Test
        fun `should remove 'sdsstub' extension`() {
            val resource = createSdsDummyResource(
                "file",
                SdsFileExtension.Stub,
                createSdsCompilationUnit(packageName = "test")
            )

            resource.baseFileNameOrNull() shouldBe "file"
        }

        @Test
        fun `should remove 'sdstest' extension`() {
            val resource = createSdsDummyResource(
                "file",
                SdsFileExtension.Test,
                createSdsCompilationUnit(packageName = "test")
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
            val resource = createSdsDummyResource(
                "file",
                SdsFileExtension.Test,
                createSdsCompilationUnit(packageName = "test")
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
            val resource = createSdsDummyResource(
                "file",
                SdsFileExtension.Test,
                SafeDSFactory.eINSTANCE.createSdsCompilationUnit()
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
