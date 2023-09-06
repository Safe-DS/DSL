import {listTestResources, resolvePathRelativeToResources} from '../../helpers/testResources';
import path from 'path';
import fs from 'fs';
import {Diagnostic} from 'vscode-languageserver-types';
import {createSafeDsServices} from '../../../src/language/safe-ds-module';
import {EmptyFileSystem} from 'langium';
import {getSyntaxErrors} from "../helpers/diagnostics";

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const root = 'formatting';
const separator = '// -----------------------------------------------------------------------------';

export const createFormatterTests = async (): Promise<FormatterTest[]> => {
    const testCases = listTestResources(root).map(async (relativeResourcePath): Promise<FormatterTest> => {
        const absolutePath = resolvePathRelativeToResources(path.join(root, relativeResourcePath));
        const program = fs.readFileSync(absolutePath).toString();
        const parts = program.split(separator);

        // Must contain exactly one separator
        if (parts.length !== 2) {
            return invalidTest(relativeResourcePath, new SeparatorError(parts.length - 1));
        }

        const originalCode = normalizeLineBreaks(parts[0]).trimEnd();
        const expectedFormattedCode = normalizeLineBreaks(parts[1]).trim();

        // Original code must not contain syntax errors
        const syntaxErrorsInOriginalCode = await getSyntaxErrors(services, originalCode);
        if (syntaxErrorsInOriginalCode.length > 0) {
            return invalidTest(relativeResourcePath, new SyntaxErrorsInOriginalCodeError(syntaxErrorsInOriginalCode));
        }

        // Expected formatted code must not contain syntax errors
        const syntaxErrorsInExpectedFormattedCode = await getSyntaxErrors(services, expectedFormattedCode);
        if (syntaxErrorsInExpectedFormattedCode.length > 0) {
            return invalidTest(relativeResourcePath, new SyntaxErrorsInExpectedFormattedCodeError(syntaxErrorsInExpectedFormattedCode));
        }

        return {
            testName: `${relativeResourcePath} should be formatted correctly`,
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
 * The file contains no or more than one separator.
 */
class SeparatorError extends Error {
    constructor(readonly number_of_separators: number) {
        super(`Expected exactly one separator but found ${number_of_separators}.`);
    }
}

/**
 * The original code contains syntax errors.
 */
class SyntaxErrorsInOriginalCodeError extends Error {
    constructor(readonly syntaxErrors: Diagnostic[]) {
        const syntaxErrorsAsString = syntaxErrors.map((e) => `- ${e.message}`).join(`\n`);

        super(`Original code has syntax errors:\n${syntaxErrorsAsString}`);
    }
}

/**
 * The expected formatted code contains syntax errors.
 */
class SyntaxErrorsInExpectedFormattedCodeError extends Error {
    constructor(readonly syntaxErrors: Diagnostic[]) {
        const syntaxErrorsAsString = syntaxErrors.map((e) => `- ${e.message}`).join(`\n`);

        super(`Expected formatted code has syntax errors:\n${syntaxErrorsAsString}`);
    }
}
