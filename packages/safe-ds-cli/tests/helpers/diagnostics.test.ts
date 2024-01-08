import { describe, expect, it } from 'vitest';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { URI } from 'langium';
import { diagnosticToString, DiagnosticToStringOptions } from '../../src/helpers/diagnostics.js';
import path from 'node:path';
import chalk from 'chalk';

describe('diagnosticToString', () => {
    const range = {
        start: {
            line: 0,
            character: 0,
        },
        end: {
            line: 0,
            character: 0,
        },
    };
    const message = 'message';

    const tests: DiagnosticToStringTest[] = [
        {
            testName: 'error',
            diagnostic: {
                severity: DiagnosticSeverity.Error,
                range,
                message,
            },
            expected: chalk.red(`test.sdstest:1:1: [error] message`),
        },
        {
            testName: 'warning',
            diagnostic: {
                severity: DiagnosticSeverity.Warning,
                range,
                message,
            },
            expected: chalk.yellow(`test.sdstest:1:1: [warning] message`),
        },
        {
            testName: 'warning (strict)',
            diagnostic: {
                severity: DiagnosticSeverity.Warning,
                range,
                message,
            },
            options: {
                strict: true,
            },
            expected: chalk.red(`test.sdstest:1:1: [warning] message`),
        },
        {
            testName: 'info',
            diagnostic: {
                severity: DiagnosticSeverity.Information,
                range,
                message,
            },
            expected: chalk.blue(`test.sdstest:1:1: [info] message`),
        },
        {
            testName: 'hint',
            diagnostic: {
                severity: DiagnosticSeverity.Hint,
                range,
                message,
            },
            expected: chalk.gray(`test.sdstest:1:1: [hint] message`),
        },
        {
            testName: 'with code',
            diagnostic: {
                severity: DiagnosticSeverity.Error,
                range,
                message,
                code: 'CODE',
            },
            expected: chalk.red(`test.sdstest:1:1: [error] message (CODE)`),
        },
    ];

    it.each(tests)('$testName', ({ diagnostic, options, expected }) => {
        const uri = URI.file(path.join(process.cwd(), 'test.sdstest'));
        const actual = diagnosticToString(uri, diagnostic, options);
        expect(actual).toBe(expected);
    });
});

/**
 * A test case for the `diagnosticToString` function.
 */
interface DiagnosticToStringTest {
    /**
     * A human-readable name for the test case.
     */
    testName: string;

    /**
     * The diagnostic to convert to a string.
     */
    diagnostic: Diagnostic;

    /**
     * Options for the conversion.
     */
    options?: DiagnosticToStringOptions;

    /**
     * The expected string.
     */
    expected: string;
}
