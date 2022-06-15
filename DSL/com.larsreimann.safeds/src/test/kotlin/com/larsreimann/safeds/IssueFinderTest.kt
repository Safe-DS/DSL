package com.larsreimann.safeds

import com.google.inject.Inject
import com.larsreimann.safeds.emf.OriginalFilePath
import com.larsreimann.safeds.testing.CategorizedTest
import com.larsreimann.safeds.testing.FindTestRangesResult
import com.larsreimann.safeds.testing.ParseHelper
import com.larsreimann.safeds.testing.SimpleMLInjectorProvider
import com.larsreimann.safeds.testing.assertions.ExpectedIssue
import com.larsreimann.safeds.testing.assertions.shouldHaveNoIssue
import com.larsreimann.safeds.testing.assertions.shouldHaveNoSemanticError
import com.larsreimann.safeds.testing.assertions.shouldHaveNoSemanticInfo
import com.larsreimann.safeds.testing.assertions.shouldHaveNoSemanticWarning
import com.larsreimann.safeds.testing.assertions.shouldHaveNoSyntaxError
import com.larsreimann.safeds.testing.assertions.shouldHaveSemanticError
import com.larsreimann.safeds.testing.assertions.shouldHaveSemanticInfo
import com.larsreimann.safeds.testing.assertions.shouldHaveSemanticWarning
import com.larsreimann.safeds.testing.assertions.shouldHaveSyntaxError
import com.larsreimann.safeds.testing.assertions.stringify
import com.larsreimann.safeds.testing.createDynamicTestsFromResourceFolder
import com.larsreimann.safeds.testing.findTestRanges
import com.larsreimann.safeds.testing.getResourcePath
import com.larsreimann.safeds.testing.testDisplayName
import com.larsreimann.safeds.utils.outerZipBy
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.eclipse.xtext.testing.validation.ValidationTestHelper
import org.eclipse.xtext.validation.Issue
import org.junit.jupiter.api.DynamicNode
import org.junit.jupiter.api.DynamicTest.dynamicTest
import org.junit.jupiter.api.TestFactory
import org.junit.jupiter.api.extension.ExtendWith
import java.nio.file.Path
import java.util.stream.Stream

private const val SYNTAX_ERROR = "syntax_error"
private const val NO_SYNTAX_ERROR = "no_syntax_error"
private const val SEMANTIC_ERROR = "semantic_error"
private const val NO_SEMANTIC_ERROR = "no_semantic_error"
private const val SEMANTIC_WARNING = "semantic_warning"
private const val NO_SEMANTIC_WARNING = "no_semantic_warning"
private const val SEMANTIC_INFO = "semantic_info"
private const val NO_SEMANTIC_INFO = "no_semantic_info"
private const val NO_ISSUE = "no_issue"
private val validSeverities = setOf(
    SYNTAX_ERROR,
    NO_SYNTAX_ERROR,
    SEMANTIC_ERROR,
    NO_SEMANTIC_ERROR,
    SEMANTIC_WARNING,
    NO_SEMANTIC_WARNING,
    SEMANTIC_INFO,
    NO_SEMANTIC_INFO,
    NO_ISSUE,
)
private val semanticSeverities = setOf(
    SEMANTIC_ERROR,
    NO_SEMANTIC_ERROR,
    SEMANTIC_WARNING,
    NO_SEMANTIC_WARNING,
    SEMANTIC_INFO,
    NO_SEMANTIC_INFO,
)

@ExtendWith(InjectionExtension::class)
@InjectWith(SimpleMLInjectorProvider::class)
class IssueFinderTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Inject
    private lateinit var validationHelper: ValidationTestHelper

    @TestFactory
    fun `should parse test files correctly`(): Stream<out DynamicNode> {
        return javaClass.classLoader
            .getResourcePath("grammar")
            ?.createDynamicTestsFromResourceFolder(::validateTestFile, ::createTest)
            ?: Stream.empty()
    }

    @TestFactory
    fun `should validate test files correctly`(): Stream<out DynamicNode> {
        return javaClass.classLoader
            .getResourcePath("validation")
            ?.createDynamicTestsFromResourceFolder(::validateTestFile, ::createTest)
            ?: Stream.empty()
    }

    /**
     * Checks if the given program is a valid test. If there are issues a description of the issue is returned,
     * otherwise this returns `null`.
     */
    private fun validateTestFile(
        @Suppress("UNUSED_PARAMETER") resourcePath: Path,
        filePath: Path,
        program: String
    ): String? {
        val severities = severities(program)

        // Must contain at least one severity
        if (severities.isEmpty()) {
            return "No expected issue is specified."
        }

        // Severities must be valid
        severities.forEach {
            if (it !in validSeverities) {
                return "Severity '$it' is invalid."
            }
        }

        // Opening and closing test markers must match
        val locations = when (val locationsResult = findTestRanges(program)) {
            is FindTestRangesResult.Success -> locationsResult.ranges
            is FindTestRangesResult.Failure -> return locationsResult.message
        }

        // Must not contain more locations markers than severities
        if (severities.size < locations.size) {
            return "Test file contains more locations (»«) than severities."
        }

        // Must be able to parse the test file
        if (parseHelper.parseProgramText(program) == null) {
            return "Could not parse test file."
        }

        // Must not combine syntax errors with checks of semantic errors
        if (severities.intersect(semanticSeverities).isNotEmpty()) {
            if (severities.contains(SYNTAX_ERROR)) {
                return "Cannot combine severity 'syntax_error' with check of semantic errors."
            }

            val syntaxErrors = actualIssues(program, filePath).filter { it.isSyntaxError }
            if (syntaxErrors.isNotEmpty()) {
                return "File checks for semantic issues but has syntax errors${syntaxErrors.stringify()}"
            }
        }

        return null
    }

    private fun createTest(resourcePath: Path, filePath: Path, program: String) = sequence {
        expectedIssues(program)
            .groupBy { it.severity to it.message }
            .keys
            .forEach { (severity, message) ->
                yield(
                    CategorizedTest(
                        severity,
                        dynamicTest(testDisplayName(resourcePath, filePath, message), filePath.toUri()) {
                            parsingTest(program, filePath, severity, message)
                        }
                    )
                )
            }
    }

    private fun parsingTest(program: String, filePath: Path, severity: String, message: String) {
        val actualIssues = actualIssues(program, filePath)
        expectedIssues(program)
            .filter { it.severity == severity && it.message == message }
            .forEach {
                when (it.severity) {
                    SYNTAX_ERROR -> actualIssues.shouldHaveSyntaxError(it)
                    NO_SYNTAX_ERROR -> actualIssues.shouldHaveNoSyntaxError(it)
                    SEMANTIC_ERROR -> actualIssues.shouldHaveSemanticError(it)
                    NO_SEMANTIC_ERROR -> actualIssues.shouldHaveNoSemanticError(it)
                    SEMANTIC_WARNING -> actualIssues.shouldHaveSemanticWarning(it)
                    NO_SEMANTIC_WARNING -> actualIssues.shouldHaveNoSemanticWarning(it)
                    SEMANTIC_INFO -> actualIssues.shouldHaveSemanticInfo(it)
                    NO_SEMANTIC_INFO -> actualIssues.shouldHaveNoSemanticInfo(it)
                    NO_ISSUE -> actualIssues.shouldHaveNoIssue(it)
                }
            }
    }

    private fun expectedIssues(program: String): List<ExpectedIssue> {
        val locations = when (val locationsResult = findTestRanges(program)) {
            is FindTestRangesResult.Success -> locationsResult.ranges
            else -> return emptyList()
        }

        return outerZipBy(severitiesAndMessages(program), locations) { severityAndMessage, location ->
            ExpectedIssue(
                severityAndMessage!!.severity,
                severityAndMessage.message,
                severityAndMessage.messageIsRegex,
                location
            )
        }
    }

    private fun severities(program: String): List<String> {
        return severitiesAndMessages(program).map { it.severity }
    }

    private fun severitiesAndMessages(program: String): List<ExpectedIssue> {
        return """//\s*(?<severity>\S+)\s*(?:(?<regex>r)?"(?<message>[^"]*)")?"""
            .toRegex()
            .findAll(program)
            .map {
                ExpectedIssue(
                    it.groupValues[1],
                    it.groupValues[3],
                    it.groupValues[2] == "r",
                    null
                )
            }
            .toList()
    }

    private fun actualIssues(program: String, filePath: Path): List<Issue> {
        val parsingResult = parseHelper.parseProgramText(program) ?: return emptyList()
        parsingResult.eResource().eAdapters().add(OriginalFilePath(filePath.toString()))
        return validationHelper.validate(parsingResult)
    }
}
