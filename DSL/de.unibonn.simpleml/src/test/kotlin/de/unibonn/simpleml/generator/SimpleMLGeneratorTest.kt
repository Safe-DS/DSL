package de.unibonn.simpleml.generator

import com.google.inject.Inject
import de.unibonn.simpleml.constant.SmlFileExtension.Flow
import de.unibonn.simpleml.constant.SmlFileExtension.Stub
import de.unibonn.simpleml.constant.SmlFileExtension.Test
import de.unibonn.simpleml.emf.OriginalFilePath
import de.unibonn.simpleml.emf.resourceSetOrNull
import de.unibonn.simpleml.testing.CategorizedTest
import de.unibonn.simpleml.testing.ParseHelper
import de.unibonn.simpleml.testing.ResourceName
import de.unibonn.simpleml.testing.SimpleMLInjectorProvider
import de.unibonn.simpleml.testing.assertions.stringify
import de.unibonn.simpleml.testing.createDynamicTestsFromResourceFolder
import de.unibonn.simpleml.testing.getResourcePath
import de.unibonn.simpleml.testing.testDisplayName
import de.unibonn.simpleml.testing.withSystemLineBreaks
import io.kotest.assertions.forEachAsClue
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import org.eclipse.emf.ecore.resource.ResourceSet
import org.eclipse.xtext.diagnostics.Severity
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.eclipse.xtext.testing.validation.ValidationTestHelper
import org.eclipse.xtext.validation.Issue
import org.eclipse.xtext.xbase.testing.CompilationTestHelper
import org.junit.jupiter.api.DynamicNode
import org.junit.jupiter.api.DynamicTest
import org.junit.jupiter.api.TestFactory
import org.junit.jupiter.api.extension.ExtendWith
import java.nio.file.Files
import java.nio.file.Path
import java.util.stream.Stream
import kotlin.io.path.extension
import kotlin.io.path.name
import kotlin.io.path.readText
import kotlin.streams.asSequence

@ExtendWith(InjectionExtension::class)
@InjectWith(SimpleMLInjectorProvider::class)
class SimpleMLGeneratorTest {

    @Inject
    private lateinit var compilationTestHelper: CompilationTestHelper

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Inject
    private lateinit var validationHelper: ValidationTestHelper

    @TestFactory
    fun `should compile test files correctly`(): Stream<out DynamicNode> {
        return javaClass.classLoader
            .getResourcePath("generator")
            ?.createDynamicTestsFromResourceFolder(::validateTestFile, ::createTest)
            ?: Stream.empty()
    }

    /**
     * Checks if the given program is a valid test. If there are issues a description of the issue is returned,
     * otherwise this returns `null`.
     */
    @Suppress("UNUSED_PARAMETER")
    private fun validateTestFile(resourcePath: Path, filePath: Path, program: String): String? {

        // Must be able to parse the test file
        if (parseHelper.parseProgramText(program) == null) {
            return "Could not parse test file."
        }

        // Must not have errors
        val errors = actualIssues(resourcePath, filePath, program).filter { it.severity == Severity.ERROR }
        if (errors.isNotEmpty()) {
            return "Program has errors:${errors.stringify()}"
        }

        return null
    }

    private fun actualIssues(resourcePath: Path, filePath: Path, program: String): List<Issue> {
        val context = context(resourcePath, filePath)
        val parsingResult = parseHelper.parseProgramText(program, context) ?: return emptyList()
        parsingResult.eResource().eAdapters().add(OriginalFilePath(filePath.toString()))
        return validationHelper.validate(parsingResult)
    }

    @Suppress("UNUSED_PARAMETER")
    private fun createTest(resourcePath: Path, filePath: Path, program: String) = sequence {
        yield(
            CategorizedTest(
                "valid test file",
                DynamicTest.dynamicTest(testDisplayName(resourcePath, filePath), filePath.toUri()) {
                    generatorTest(resourcePath, filePath)
                }
            )
        )
    }

    private fun generatorTest(resourcePath: Path, filePath: Path) {
        val expectedOutputs = expectedOutputs(filePath)
        val actualOutputs = actualOutputs(resourcePath, filePath)

        // File paths should match exactly
        actualOutputs.map { it.filePath }.shouldContainExactlyInAnyOrder(expectedOutputs.map { it.filePath })

        // Contents should match
        actualOutputs.forEachAsClue { actualOutput ->
            val expectedOutput = expectedOutputs.first { it.filePath == actualOutput.filePath }
            actualOutput.content.withSystemLineBreaks() shouldBe expectedOutput.content.withSystemLineBreaks()
        }
    }

    private data class OutputFile(val filePath: String, val content: String)

    private fun context(resourcePath: Path, filePath: Path): List<ResourceName> {
        val root = filePath.parent

        return Files.walk(root)
            .asSequence()
            .filter { it.extension in setOf(Flow.extension, Stub.extension, Test.extension) }
            .filter { it.name.startsWith("_skip_") }
            .map { resourceName(resourcePath, it) }
            .toList()
    }

    private fun expectedOutputs(filePath: Path): List<OutputFile> {
        val root = filePath.parent

        return Files.walk(root)
            .asSequence()
            .filter { it.extension == "py" }
            .map {
                OutputFile(
                    root.relativize(it).toUnixString(),
                    it.readText()
                )
            }
            .toList()
    }

    private fun actualOutputs(resourcePath: Path, filePath: Path): List<OutputFile> {
        var actualOutput: List<OutputFile> = emptyList()

        compilationTestHelper.compile(resourceSet(resourcePath, filePath)) { result ->
            actualOutput = result.allGeneratedResources.map {
                OutputFile(it.key.normalizePathPrefix(), it.value.toString())
            }
        }

        return actualOutput
    }

    private fun resourceSet(resourcePath: Path, filePath: Path): ResourceSet {
        val context = context(resourcePath, filePath)
        return parseHelper
            .parseResource(resourceName(resourcePath, filePath), context)
            ?.resourceSetOrNull()
            .shouldNotBeNull()
    }

    private fun resourceName(resourcePath: Path, filePath: Path): ResourceName {
        return resourcePath
            .parent
            .relativize(filePath)
            .toUnixString()
    }

    private fun Path.toUnixString(): String {
        return this.toString().replace("\\", "/")
    }

    private fun String.normalizePathPrefix(): String {
        return this
            .removePrefix("/myProject/./")
            .replace("src-gen", "output")
    }
}
