import {
    listTestsResourcesGroupedByParentDirectory,
    resolvePathRelativeToResources,
} from '../../helpers/testResources.js';
import path from 'path';
import fs from 'fs';
import { findTestChecks } from '../../helpers/testChecks.js';
import { URI } from 'vscode-uri';
import { getSyntaxErrors, SyntaxErrorsInCodeError } from '../../helpers/diagnostics.js';
import { EmptyFileSystem } from 'langium';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { DocumentUri, Range } from 'vscode-languageserver-types';
import { clearDocuments } from 'langium/test';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const root = 'validation';

export const createValidationTests = (): Promise<ValidationTest[]> => {
    const pathsGroupedByParentDirectory = listTestsResourcesGroupedByParentDirectory(root);
    const testCases = Object.entries(pathsGroupedByParentDirectory).map(([dirname, paths]) =>
        createValidationTest(dirname, paths),
    );

    return Promise.all(testCases);
};

const createValidationTest = async (
    relativeParentDirectoryPath: string,
    relativeResourcePaths: string[],
): Promise<ValidationTest> => {
    const uris: string[] = [];
    const issues: ExpectedIssue[] = [];

    for (const relativeResourcePath of relativeResourcePaths) {
        const absolutePath = resolvePathRelativeToResources(path.join(root, relativeResourcePath));
        const uri = URI.file(absolutePath).toString();
        uris.push(uri);

        const code = fs.readFileSync(absolutePath).toString();

        // File must not contain any syntax errors
        await clearDocuments(services);
        const syntaxErrors = await getSyntaxErrors(services, code);
        if (syntaxErrors.length > 0) {
            return invalidTest(
                `INVALID TEST FILE [${relativeResourcePath}]`,
                new SyntaxErrorsInCodeError(syntaxErrors),
            );
        }

        const checksResult = findTestChecks(code, uri);

        // Something went wrong when finding test checks
        if (checksResult.isErr) {
            return invalidTest(`INVALID TEST FILE [${relativeResourcePath}]`, checksResult.error);
        }

        for (const check of checksResult.value) {
            const regex = /\s*(?<isAbsent>no\s+)?(?<severity>\S+)\s*(?:(?<messageIsRegex>r)?"(?<message>[^"]*)")?/gu;
            const match = regex.exec(check.comment);

            // Overall comment is invalid
            if (!match) {
                return invalidTest(
                    `INVALID TEST FILE [${relativeResourcePath}]`,
                    new InvalidCommentError(check.comment),
                );
            }

            // Extract groups from the match
            const presence = match.groups!.isAbsent ? 'absent' : 'present';
            const severity = match.groups!.severity;
            const messageIsRegex = match.groups!.messageIsRegex === 'r';
            const message = match.groups!.message;

            // Validate the severity
            if (!validSeverities.includes(severity as any)) {
                return invalidTest(`INVALID TEST FILE [${relativeResourcePath}]`, new InvalidSeverityError(severity));
            }

            // Add the issue
            issues.push({
                presence,
                severity: severity as Severity,
                message,
                messageIsRegex,
                uri,
                range: check.location?.range,
            });
        }
    }

    return {
        testName: `[${relativeParentDirectoryPath}] should be validated correctly`,
        uris,
        expectedIssues: issues,
    };
};

/**
 * Report a test that has errors.
 *
 * @param testName The name of the test.
 * @param error The error that occurred.
 */
const invalidTest = (testName: string, error: Error): ValidationTest => {
    return {
        testName,
        uris: [],
        expectedIssues: [],
        error,
    };
};

/**
 * A description of a validation test.
 */
interface ValidationTest {
    /**
     * The name of the test.
     */
    testName: string;

    /**
     * The URIs of the files that should be loaded into the workspace.
     */
    uris: string[];

    /**
     * The issues we expect to find in the workspace.
     */
    expectedIssues: ExpectedIssue[];

    /**
     * An error that occurred while creating the test. If this is undefined, the test is valid.
     */
    error?: Error;
}

/**
 * An issue that is expected to be present in or absent from the workspace.
 */
export interface ExpectedIssue {
    /**
     * Whether the issue should be present or absent.
     */
    presence: Presence;

    /**
     * The severity of the issue.
     */
    severity: Severity;

    /**
     * The message of the issue.
     */
    message?: string;

    /**
     * Whether the message should be interpreted as a regular expression.
     */
    messageIsRegex?: boolean;

    /**
     * The URI of the file containing the issue.
     */
    uri: DocumentUri;

    /**
     * The range of the issue. If undefined, the issue is expected to be present in the whole file.
     */
    range?: Range;
}

/**
 * Whether the issue should be present or absent.
 */
export type Presence = 'present' | 'absent';

/**
 * The valid severities of an issue.
 */
const validSeverities = ['error', 'warning', 'info', 'hint'] as const;

/**
 * The severity of the issue.
 */
export type Severity = (typeof validSeverities)[number];

/**
 * A test comment did not match the expected format.
 */
class InvalidCommentError extends Error {
    constructor(readonly comment: string) {
        super(`Invalid test comment (refer to the documentation for guidance): ${comment}`);
    }
}

/**
 * A test comment did not specify a valid severity.
 */
class InvalidSeverityError extends Error {
    constructor(readonly type: string) {
        super(`Invalid severity (valid values are ${validSeverities.join(', ')}): ${type}`);
    }
}
