import {listTestResources, resolvePathRelativeToResources} from "../helpers/testResources";
import path from "path";
import fs from "fs";
import {validationHelper} from "langium/test";
import {Diagnostic} from "vscode-languageserver-types";
import {createSafeDsServices} from "../../src/language-server/safe-ds-module";
import {EmptyFileSystem} from "langium";

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const separator = '// -----------------------------------------------------------------------------';

export const createFormatterTests = async (): Promise<FormatterTest[]> => {
    const testCases = listTestResources('formatting').map(async (pathRelativeToResources): Promise<FormatterTest> => {
        const absolutePath = resolvePathRelativeToResources(path.join('formatting', pathRelativeToResources));
        const program = fs.readFileSync(absolutePath).toString();
        const parts = program.split(separator);

        // Must contain exactly one separator
        if (parts.length !== 2) {
            return {
                testName: `INVALID TEST FILE [${pathRelativeToResources}]`,
                originalCode: '',
                expectedFormattedCode: '',
                error: new SeparatorError(parts.length - 1),
            };
        }

        // Original code must not contain syntax errors
        const originalCode = normalizeLineBreaks(parts[0]).trimEnd();
        const expectedFormattedCode = normalizeLineBreaks(parts[1]).trim();

        const validationResult = await validationHelper(services)(parts[0]);
        const syntaxErrors = validationResult.diagnostics.filter(
            (d) => d.severity === 1 && (d.code === 'lexing-error' || d.code === 'parsing-error'),
        );

        if (syntaxErrors.length > 0) {
            return {
                testName: `INVALID TEST FILE [${pathRelativeToResources}]`,
                originalCode,
                expectedFormattedCode,
                error: new SyntaxErrorsInOriginalCodeError(syntaxErrors),
            };
        }

        return {
            testName: `${pathRelativeToResources} should be formatted correctly`,
            originalCode,
            expectedFormattedCode,
        };
    });

    return Promise.all(testCases);
};

const normalizeLineBreaks = (code: string): string => {
    return code.replace(/\r\n?/gu, '\n');
};

interface FormatterTest {
    testName: string;
    originalCode: string;
    expectedFormattedCode: string;
    error?: Error;
}

class SeparatorError extends Error {
    constructor(readonly number_of_separators: number) {
        super(`Expected exactly one separator but found ${number_of_separators}.`);
    }
}

class SyntaxErrorsInOriginalCodeError extends Error {
    constructor(readonly syntaxErrors: Diagnostic[]) {
        const syntaxErrorsAsString = syntaxErrors.map((e) => `- ${e.message}`).join(`\n`);

        super(`Original code has syntax errors:\n${syntaxErrorsAsString}`);
    }
}
