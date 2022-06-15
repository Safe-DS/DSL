package com.larsreimann.safeds.testing.assertions

import com.larsreimann.safeds.location.XtextRange
import org.eclipse.xtext.diagnostics.Severity
import org.eclipse.xtext.validation.Issue

fun List<Issue>.shouldHaveNoErrorsOrWarnings() {
    val errorsOrWarnings = this.filter { it.severity == Severity.ERROR || it.severity == Severity.WARNING }
    if (errorsOrWarnings.isNotEmpty()) {
        throw AssertionError("Expected no errors or warnings but got${errorsOrWarnings.stringify()}")
    }
}

fun List<Issue>.shouldHaveSyntaxError(expected: ExpectedIssue) {
    val syntaxErrors = this.filter { it.isSyntaxError }
    if (syntaxErrors.none { expected.matches(it) }) {
        throw AssertionError("Expected $expected but got${this.stringify()}")
    }
}

fun List<Issue>.shouldHaveNoSyntaxError(expected: ExpectedIssue) {
    val syntaxErrors = this.filter { it.isSyntaxError }
    if (syntaxErrors.any { expected.matches(it) }) {
        throw AssertionError("Expected $expected but got${this.stringify()}")
    }
}

fun List<Issue>.shouldHaveSemanticError(expected: ExpectedIssue) {
    val errors = this.filter { it.severity == Severity.ERROR }
    if (errors.none { expected.matches(it) }) {
        throw AssertionError("Expected $expected but got${this.stringify()}")
    }
}

fun List<Issue>.shouldHaveNoSemanticError(expected: ExpectedIssue) {
    val errors = this.filter { it.severity == Severity.ERROR }
    if (errors.any { expected.matches(it) }) {
        throw AssertionError("Expected $expected but got${this.stringify()}")
    }
}

fun List<Issue>.shouldHaveSemanticWarning(expected: ExpectedIssue) {
    val warnings = this.filter { it.severity == Severity.WARNING }
    if (warnings.none { expected.matches(it) }) {
        throw AssertionError("Expected $expected but got${this.stringify()}")
    }
}

fun List<Issue>.shouldHaveNoSemanticWarning(expected: ExpectedIssue) {
    val warnings = this.filter { it.severity == Severity.WARNING }
    if (warnings.any { expected.matches(it) }) {
        throw AssertionError("Expected $expected but got${this.stringify()}")
    }
}

fun List<Issue>.shouldHaveSemanticInfo(expected: ExpectedIssue) {
    val infos = this.filter { it.severity == Severity.INFO }
    if (infos.none { expected.matches(it) }) {
        throw AssertionError("Expected $expected but got${this.stringify()}")
    }
}

fun List<Issue>.shouldHaveNoSemanticInfo(expected: ExpectedIssue) {
    val infos = this.filter { it.severity == Severity.INFO }
    if (infos.any { expected.matches(it) }) {
        throw AssertionError("Expected $expected but got${this.stringify()}")
    }
}

fun List<Issue>.shouldHaveNoIssue(expected: ExpectedIssue) {
    if (this.isNotEmpty()) {
        throw AssertionError("Expected $expected but got${this.stringify()}")
    }
}

fun List<Issue>.stringify(): String {
    if (this.isEmpty()) {
        return " nothing."
    }

    return this.joinToString(prefix = ":\n", separator = "\n") { "    * $it" }
}

class ExpectedIssue(
    val severity: String,
    val message: String,
    val messageIsRegex: Boolean,
    private val range: XtextRange?
) {

    fun matches(issue: Issue): Boolean {
        return locationMatches(issue) && messageMatches(issue)
    }

    private fun locationMatches(issue: Issue): Boolean {
        return range == null || range == issue.range
    }

    private fun messageMatches(issue: Issue): Boolean {
        return when {
            message.isBlank() -> true
            !messageIsRegex -> message == issue.message
            else -> {
                val regex = Regex(message)
                regex.matches(issue.message)
            }
        }
    }

    private val Issue.range: XtextRange
        get() = XtextRange.fromInts(
            this.lineNumber,
            this.column,
            this.lineNumberEnd,
            this.columnEnd,
            this.length
        )

    override fun toString() = buildString {
        append(severity)
        if (messageIsRegex || message.isNotBlank()) {
            append(" ")
        }
        if (messageIsRegex) {
            append("r")
        }
        if (message.isNotBlank()) {
            append("\"$message\"")
        }
        range?.let { append(" at $range") }
    }
}
