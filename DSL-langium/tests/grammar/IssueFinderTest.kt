//class IssueFinderTest {
//
//    @com.google.inject.Inject
//    private lateinit var parseHelper: com.larsreimann.safeds.testing.ParseHelper
//
//    @com.google.inject.Inject
//    private lateinit var validationHelper: org.eclipse.xtext.testing.validation.ValidationTestHelper
//
//    @org.junit.jupiter.api.TestFactory
//    fun `should parse test files correctly`(): java.util.stream.Stream<out org.junit.jupiter.api.DynamicNode> {
//        return javaClass.classLoader
//            .getResourcePath("grammar")
//            ?.createDynamicTestsFromResourceFolder(::validateTestFile, ::createTest)
//            ?: java.util.stream.Stream.empty()
//    }
//
//    @org.junit.jupiter.api.TestFactory
//    fun `should validate test files correctly`(): java.util.stream.Stream<out org.junit.jupiter.api.DynamicNode> {
//        return javaClass.classLoader
//            .getResourcePath("validation")
//            ?.createDynamicTestsFromResourceFolder(::validateTestFile, ::createTest)
//            ?: java.util.stream.Stream.empty()
//    }
//
//    /**
//     * Checks if the given program is a valid test. If there are issues a description of the issue is returned,
//     * otherwise this returns `null`.
//     */
//    private fun validateTestFile(
//        @Suppress("UNUSED_PARAMETER") resourcePath: java.nio.file.Path,
//        filePath: java.nio.file.Path,
//        program: String
//    ): String? {
//        val severities = severities(program)
//
//        // Must contain at least one severity
//        if (severities.isEmpty()) {
//            return "No expected issue is specified."
//        }
//
//        // Severities must be valid
//        severities.forEach {
//            if (it !in com.larsreimann.safeds.validSeverities) {
//                return "Severity '$it' is invalid."
//            }
//        }
//
//        // Opening and closing test markers must match
//        val locations = when (val locationsResult = com.larsreimann.safeds.testing.findTestRanges(program)) {
//            is com.larsreimann.safeds.testing.FindTestRangesResult.Success -> locationsResult.ranges
//            is com.larsreimann.safeds.testing.FindTestRangesResult.Failure -> return locationsResult.message
//        }
//
//        // Must not contain more locations markers than severities
//        if (severities.size < locations.size) {
//            return "Test file contains more locations (»«) than severities."
//        }
//
//        // Must be able to parse the test file
//        if (parseHelper.parseProgramText(program) == null) {
//            return "Could not parse test file."
//        }
//
//        // Must not combine syntax errors with checks of semantic errors
//        if (severities.intersect(com.larsreimann.safeds.semanticSeverities).isNotEmpty()) {
//            if (severities.contains(com.larsreimann.safeds.SYNTAX_ERROR)) {
//                return "Cannot combine severity 'syntax_error' with check of semantic errors."
//            }
//
//            val syntaxErrors = actualIssues(program, filePath).filter { it.isSyntaxError }
//            if (syntaxErrors.isNotEmpty()) {
//                return "File checks for semantic issues but has syntax errors${syntaxErrors.stringify()}"
//            }
//        }
//
//        return null
//    }
//
//    private fun createTest(resourcePath: java.nio.file.Path, filePath: java.nio.file.Path, program: String) = sequence {
//        expectedIssues(program)
//            .groupBy { it.severity to it.message }
//            .keys
//            .forEach { (severity, message) ->
//                yield(
//                    com.larsreimann.safeds.testing.CategorizedTest(
//                        severity,
//                        org.junit.jupiter.api.DynamicTest.dynamicTest(
//                            com.larsreimann.safeds.testing.testDisplayName(
//                                resourcePath,
//                                filePath,
//                                message
//                            ), filePath.toUri()
//                        ) {
//                            parsingTest(program, filePath, severity, message)
//                        }
//                    )
//                )
//            }
//    }
//
//    private fun parsingTest(program: String, filePath: java.nio.file.Path, severity: String, message: String) {
//        val actualIssues = actualIssues(program, filePath)
//        expectedIssues(program)
//            .filter { it.severity == severity && it.message == message }
//            .forEach {
//                when (it.severity) {
//                    com.larsreimann.safeds.SYNTAX_ERROR -> actualIssues.shouldHaveSyntaxError(it)
//                    com.larsreimann.safeds.NO_SYNTAX_ERROR -> actualIssues.shouldHaveNoSyntaxError(it)
//                    com.larsreimann.safeds.SEMANTIC_ERROR -> actualIssues.shouldHaveSemanticError(it)
//                    com.larsreimann.safeds.NO_SEMANTIC_ERROR -> actualIssues.shouldHaveNoSemanticError(it)
//                    com.larsreimann.safeds.SEMANTIC_WARNING -> actualIssues.shouldHaveSemanticWarning(it)
//                    com.larsreimann.safeds.NO_SEMANTIC_WARNING -> actualIssues.shouldHaveNoSemanticWarning(it)
//                    com.larsreimann.safeds.SEMANTIC_INFO -> actualIssues.shouldHaveSemanticInfo(it)
//                    com.larsreimann.safeds.NO_SEMANTIC_INFO -> actualIssues.shouldHaveNoSemanticInfo(it)
//                    com.larsreimann.safeds.NO_ISSUE -> actualIssues.shouldHaveNoIssue(it)
//                }
//            }
//    }
//
//    private fun expectedIssues(program: String): List<com.larsreimann.safeds.testing.assertions.ExpectedIssue> {
//        val locations = when (val locationsResult = com.larsreimann.safeds.testing.findTestRanges(program)) {
//            is com.larsreimann.safeds.testing.FindTestRangesResult.Success -> locationsResult.ranges
//            else -> return emptyList()
//        }
//
//        return com.larsreimann.safeds.utils.outerZipBy(
//            severitiesAndMessages(program),
//            locations
//        ) { severityAndMessage, location ->
//            com.larsreimann.safeds.testing.assertions.ExpectedIssue(
//                severityAndMessage!!.severity,
//                severityAndMessage.message,
//                severityAndMessage.messageIsRegex,
//                location
//            )
//        }
//    }
//
//    private fun severities(program: String): List<String> {
//        return severitiesAndMessages(program).map { it.severity }
//    }
//
//    private fun severitiesAndMessages(program: String): List<com.larsreimann.safeds.testing.assertions.ExpectedIssue> {
//        return """//\s*(?<severity>\S+)\s*(?:(?<regex>r)?"(?<message>[^"]*)")?"""
//            .toRegex()
//            .findAll(program)
//            .map {
//                com.larsreimann.safeds.testing.assertions.ExpectedIssue(
//                    it.groupValues[1],
//                    it.groupValues[3],
//                    it.groupValues[2] == "r",
//                    null
//                )
//            }
//            .toList()
//    }
//
//    private fun actualIssues(program: String, filePath: java.nio.file.Path): List<org.eclipse.xtext.validation.Issue> {
//        val parsingResult = parseHelper.parseProgramText(program) ?: return emptyList()
//        parsingResult.eResource().eAdapters().add(com.larsreimann.safeds.emf.OriginalFilePath(filePath.toString()))
//        return validationHelper.validate(parsingResult)
//    }
//}
