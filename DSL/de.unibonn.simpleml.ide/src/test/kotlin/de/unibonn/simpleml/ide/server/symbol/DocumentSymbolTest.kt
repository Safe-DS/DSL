package de.unibonn.simpleml.ide.server.symbol

import de.unibonn.simpleml.ide.AbstractSimpleMLLanguageServerTest
import de.unibonn.simpleml.location.LspRange
import de.unibonn.simpleml.testing.CategorizedTest
import de.unibonn.simpleml.testing.FindTestRangesResult
import de.unibonn.simpleml.testing.createDynamicTestsFromResourceFolder
import de.unibonn.simpleml.testing.findTestRanges
import de.unibonn.simpleml.testing.getResourcePath
import de.unibonn.simpleml.testing.testDisplayName
import org.eclipse.lsp4j.SymbolKind
import org.junit.jupiter.api.DynamicNode
import org.junit.jupiter.api.DynamicTest
import org.junit.jupiter.api.TestFactory
import java.nio.file.Path
import java.util.stream.Stream

class DocumentSymbolTest : AbstractSimpleMLLanguageServerTest() {

    @TestFactory
    fun `should provide correct symbols`(): Stream<out DynamicNode> {
        return javaClass.classLoader
            .getResourcePath("symbols")
            ?.createDynamicTestsFromResourceFolder(::validateTestFile, ::createTest)
            ?: Stream.empty()
    }

    /**
     * Checks if the given program is a valid test. If there are issues a description of the issue is returned, otherwise
     * this returns null.
     */
    @Suppress("UNUSED_PARAMETER")
    private fun validateTestFile(resourcePath: Path, filePath: Path, program: String): String? {
        val symbolComments = try {
            symbolComments(program)
        } catch (e: IllegalArgumentException) {
            return e.message
        }

        // Must contain at least one comment
        if (symbolComments.isEmpty()) {
            return "No expected symbol is specified."
        }

        // Opening and closing test markers must match
        val locations = when (val locationsResult = findTestRanges(program)) {
            is FindTestRangesResult.Success -> locationsResult.ranges
            is FindTestRangesResult.Failure -> return locationsResult.message
        }

        // Must contain the same amount of test markers and symbols
        if (symbolComments.size != locations.size) {
            return "Test file contains ${symbolComments.size} symbol comments but ${locations.size} ranges."
        }

        // Must be able to parse the test file
        // This code fails with Guice configuration errors:
        //
        // 1) [Guice/MissingImplementation]: No implementation for String annotated with
        // @Named(value="file.extensions") was bound.
        // val compilationUnit = parseHelper.parse(program)
        //     ?: return "Could not parse test file."
        //
        // // Must not have syntax errors
        // val syntaxErrors = validationHelper.validate(compilationUnit).filter { it.isSyntaxError }
        // if (syntaxErrors.isNotEmpty()) {
        //     return "File has syntax errors${syntaxErrors.stringify()}"
        // }

        return null
    }

    private fun createTest(resourcePath: Path, filePath: Path, program: String) = sequence {
        val expectedSymbols = expectedSymbols(program)
        yield(
            CategorizedTest(
                "symbol tests",
                DynamicTest.dynamicTest(testDisplayName(resourcePath, filePath), filePath.toUri()) {
                    testDocumentSymbol {
                        it.model = program
                        it.expectedSymbols = expectedSymbols.joinToString("")
                    }
                }
            )
        )
    }

    private fun symbolComments(program: String): List<SymbolComment> {
        return """//\s*(?<kind>\S+)\s*"(?<name>[^"]*)"\s*(?:in\s*"(?<containerName>[^"]*)")?"""
            .toRegex()
            .findAll(program)
            .map {
                SymbolComment(
                    enumValueOf(it.groupValues[1]),
                    it.groupValues[2],
                    it.groupValues[3]
                )
            }
            .toList()
    }

    private fun expectedSymbols(program: String): List<ExpectedSymbol> {
        val ranges = findTestRanges(program) as? FindTestRangesResult.Success ?: return emptyList()
        val symbolComments = symbolComments(program)

        return ranges.ranges.zip(symbolComments) { range, comment ->
            ExpectedSymbol(comment.kind, comment.name, range.toLspRange(), comment.containerName)
        }
    }
}

private data class SymbolComment(val kind: SymbolKind, val name: String, val containerName: String?)

private data class ExpectedSymbol(
    val kind: SymbolKind,
    val name: String,
    val range: LspRange,
    val containerName: String?
) {
    private val indent = "    "

    override fun toString() = buildString {
        appendLine("symbol \"$name\" {")
        appendLine("${indent}kind: ${kind.value}")
        appendLine("${indent}location: MyModel.smltest $range")

        if (!containerName.isNullOrEmpty()) {
            appendLine("${indent}container: \"$containerName\"")
        }

        appendLine("}")
    }
}
