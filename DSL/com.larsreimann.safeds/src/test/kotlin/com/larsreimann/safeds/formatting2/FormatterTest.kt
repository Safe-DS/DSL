package com.larsreimann.safeds.formatting2

import com.google.inject.Inject
import com.larsreimann.safeds.testing.CategorizedTest
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
import com.larsreimann.safeds.testing.createDynamicTestsFromResourceFolder
import com.larsreimann.safeds.testing.getResourcePath
import com.larsreimann.safeds.testing.testDisplayName
import com.larsreimann.safeds.testing.withSystemLineBreaks
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.eclipse.xtext.testing.formatter.FormatterTestHelper
import org.junit.jupiter.api.DynamicNode
import org.junit.jupiter.api.DynamicTest
import org.junit.jupiter.api.TestFactory
import org.junit.jupiter.api.extension.ExtendWith
import java.nio.file.Path
import java.util.stream.Stream

@ExtendWith(InjectionExtension::class)
@InjectWith(SafeDSInjectorProvider::class)
class FormatterTest {

    @Inject
    lateinit var formatter: FormatterTestHelper

    private val separator = Regex("// -*")

    @TestFactory
    fun `should be formatted properly`(): Stream<out DynamicNode> {
        return javaClass.classLoader
            .getResourcePath("formatting")
            ?.createDynamicTestsFromResourceFolder(::validateTestFile, ::createTest)
            ?: Stream.empty()
    }

    /**
     * Checks if the given program is a valid test. If there are issues a description of the issue is returned, otherwise
     * this returns null.
     */
    @Suppress("UNUSED_PARAMETER")
    private fun validateTestFile(resourcePath: Path, filePath: Path, program: String): String? {
        if (separator !in program) {
            return "Did not find a separator between the original and the formatted code."
        }

        return null
    }

    private fun createTest(resourcePath: Path, filePath: Path, program: String) = sequence {
        yield(
            CategorizedTest(
                "formatter tests",
                DynamicTest.dynamicTest(testDisplayName(resourcePath, filePath), filePath.toUri()) {
                    assertFormatted(toBeFormatted(program), expectedResult(program))
                }
            )
        )
    }

    private fun toBeFormatted(program: String): String {
        return program.split(separator)[0].trim()
    }

    private fun expectedResult(program: String): String {
        return program
            .split(separator)[1]
            .trim()
            .withSystemLineBreaks()
    }

    private fun assertFormatted(toBeFormatted: String, expectedResult: String) {
        formatter.assertFormatted {
            it.toBeFormatted = toBeFormatted
            it.expectation = expectedResult + System.lineSeparator()
        }
    }
}
