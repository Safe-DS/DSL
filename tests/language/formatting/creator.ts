import {listSafeDsFiles, uriToShortenedResourceName} from '../../helpers/testResources.js';
import fs from 'fs';
import { Diagnostic } from 'vscode-languageserver-types';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { EmptyFileSystem, URI } from 'langium';
import { getSyntaxErrors } from '../../helpers/diagnostics.js';
import { TestDescription } from '../../helpers/testDescription.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const rootResourceName = 'formatting';
const separator = '// -----------------------------------------------------------------------------';

export const createFormattingTests = async (): Promise<FormattingTest[]> => {
    const testCases = listSafeDsFiles(rootResourceName).map(createFormattingTest);
    return Promise.all(testCases);
};

const createFormattingTest = async (uri: URI): Promise<FormattingTest> => {
    const shortenedResourceName = uriToShortenedResourceName(uri, rootResourceName);
    const program = fs.readFileSync(uri.fsPath).toString();
    const parts = program.split(separator);

    // Must contain exactly one separator
    if (parts.length !== 2) {
        return invalidTest(shortenedResourceName, new SeparatorError(parts.length - 1));
    }

    const originalCode = normalizeLineBreaks(parts[0]).trimEnd();
    const expectedFormattedCode = normalizeLineBreaks(parts[1]).trim();

    // Original code must not contain syntax errors
    const syntaxErrorsInOriginalCode = await getSyntaxErrors(services, originalCode);
    if (syntaxErrorsInOriginalCode.length > 0) {
        return invalidTest(shortenedResourceName, new SyntaxErrorsInOriginalCodeError(syntaxErrorsInOriginalCode));
    }

    // Expected formatted code must not contain syntax errors
    const syntaxErrorsInExpectedFormattedCode = await getSyntaxErrors(services, expectedFormattedCode);
    if (syntaxErrorsInExpectedFormattedCode.length > 0) {
        return invalidTest(
            shortenedResourceName,
            new SyntaxErrorsInExpectedFormattedCodeError(syntaxErrorsInExpectedFormattedCode),
        );
    }

    return {
        testName: `[${shortenedResourceName}] should be formatted correctly`,
        originalCode,
        expectedFormattedCode,
    };
};

/**
 * Report a test that has errors.
 *
 * @param relativeResourcePath The path to the test file relative to the `resources` directory.
 * @param error The error that occurred.
 */
const invalidTest = (relativeResourcePath: string, error: Error): FormattingTest => {
    return {
        testName: `INVALID TEST FILE [${relativeResourcePath}]`,
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
 * A description of a formatting test.
 */
interface FormattingTest extends TestDescription {
    /**
     * The original code before formatting.
     */
    originalCode: string;

    /**
     * The expected formatted code.
     */
    expectedFormattedCode: string;
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
