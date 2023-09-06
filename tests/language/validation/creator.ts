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

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const root = 'validation';
const issueTypes = ['error', 'no_error', 'warning', 'no_warning', 'info', 'no_info', 'hint', 'no_hint'];

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
            const match = /\s*(?<type>\S+)\s*(?:(?<messageIsRegex>r)?"(?<message>[^"]*)")?/gu.exec(check.comment);

            // Overall comment is invalid
            if (!match) {
                return invalidTest(
                    `INVALID TEST FILE [${relativeResourcePath}]`,
                    new InvalidCommentError(check.comment),
                );
            }

            // Extract groups from the match
            const type = match.groups!.type;
            const messageIsRegex = match.groups!.messageIsRegex === 'r';
            const message = match.groups!.message;

            // Validate the type
            if (!issueTypes.includes(type)) {
                return invalidTest(`INVALID TEST FILE [${relativeResourcePath}]`, new InvalidIssueTypeError(type));
            }

            // Add the issue
            issues.push({
                presence: getPresenceFromIssueType(type),
                severity: getSeverityFromIssueType(type)!,
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

const getPresenceFromIssueType = (type: string): Presence => {
    return type.startsWith('no_') ? 'absent' : 'present';
}

const getSeverityFromIssueType = (type: string): Severity | null => {
    switch (type) {
        case 'error':
        case 'no_error':
            return 'error';
        case 'warning':
        case 'no_warning':
            return 'warning';
        case 'info':
        case 'no_info':
            return 'info';
        case 'hint':
        case 'no_hint':
            return 'hint';
    }

    return null;
}

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
 * The severity of the issue.
 */
export type Severity = 'error' | 'warning' | 'info' | 'hint';

/**
 * A test comment did not match the expected format.
 */
class InvalidCommentError extends Error {
    constructor(readonly comment: string) {
        super(
            `Invalid test comment (refer to the documentation for guidance): ${comment}`,
        );
    }
}

/**
 * A test comment did not specify a valid issue type.
 */
class InvalidIssueTypeError extends Error {
    constructor(readonly type: string) {
        super(`Invalid type of issue (valid values are ${issueTypes.join()}): ${type}`);
    }
}
