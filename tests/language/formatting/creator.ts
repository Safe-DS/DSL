import { listTestResources, resolvePathRelativeToResources } from '../../helpers/testResources';
import path from 'path';
import fs from 'fs';
import { validationHelper } from 'langium/test';
import { Diagnostic } from 'vscode-languageserver-types';
import { createSafeDsServices } from '../../../src/language/safe-ds-module';
import { EmptyFileSystem } from 'langium';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const separator = '// -----------------------------------------------------------------------------';

export const createFormatterTests = async (): Promise<FormatterTest[]> => {
    const testCases = listTestResources('formatting').map(async (pathRelativeToResources): Promise<FormatterTest> => {
        const absolutePath = resolvePathRelativeToResources(path.join('formatting', pathRelativeToResources));
        const program = fs.readFileSync(absolutePath).toString();
        const parts = program.split(separator);

        // Must contain exactly one separator
        if (parts.length !== 2) {
            return invalidTest(pathRelativeToResources, new SeparatorError(parts.length - 1));
        }

        // Original code must not contain syntax errors
        const originalCode = normalizeLineBreaks(parts[0]).trimEnd();
        const expectedFormattedCode = normalizeLineBreaks(parts[1]).trim();

        const validationResult = await validationHelper(services)(parts[0]);
        const syntaxErrors = validationResult.diagnostics.filter(
            (d) => d.severity === 1 && (d.code === 'lexing-error' || d.code === 'parsing-error'),
        );

        if (syntaxErrors.length > 0) {
            return invalidTest(pathRelativeToResources, new SyntaxErrorsInOriginalCodeError(syntaxErrors));
        }

        return {
            testName: `${pathRelativeToResources} should be formatted correctly`,
            originalCode,
            expectedFormattedCode,
        };
    });

    return Promise.all(testCases);
};

/**
 * Report a test that has errors.
 *
 * @param pathRelativeToResources The path to the test file relative to the resources directory.
 * @param error The error that occurred.
 */
const invalidTest = (pathRelativeToResources: string, error: Error): FormatterTest => {
    return {
        testName: `INVALID TEST FILE [${pathRelativeToResources}]`,
        originalCode: '',
        expectedFormattedCode: '',
        error,
    };
};

/**
 * Normalizes line breaks to `\n`.
 *
 * @param code The code to normalize.
 * @return The normalized code.
 */
const normalizeLineBreaks = (code: string): string => {
    return code.replace(/\r\n?/gu, '\n');
};

/**
 * A description of a formatter test.
 */
interface FormatterTest {
    /**
     * The name of the test.
     */
    testName: string;

    /**
     * The original code before formatting.
     */
    originalCode: string;

    /**
     * The expected formatted code.
     */
    expectedFormattedCode: string;

    /**
     * An error that occurred while creating the test. If this is undefined, the test is valid.
     */
    error?: Error;
}

/**
 * The file contained no or more than one separator.
 */
class SeparatorError extends Error {
    constructor(readonly number_of_separators: number) {
        super(`Expected exactly one separator but found ${number_of_separators}.`);
    }
}

/**
 * The original code contained syntax errors.
 */
class SyntaxErrorsInOriginalCodeError extends Error {
    constructor(readonly syntaxErrors: Diagnostic[]) {
        const syntaxErrorsAsString = syntaxErrors.map((e) => `- ${e.message}`).join(`\n`);

        super(`Original code has syntax errors:\n${syntaxErrorsAsString}`);
    }
}
