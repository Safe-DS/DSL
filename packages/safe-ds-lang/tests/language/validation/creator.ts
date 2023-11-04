import {
    listTestSafeDsFilesGroupedByParentDirectory,
    uriToShortenedTestResourceName,
} from '../../helpers/testResources.js';
import fs from 'fs';
import { findTestChecks } from '../../helpers/testChecks.js';
import { getSyntaxErrors, SyntaxErrorsInCodeError } from '../../helpers/diagnostics.js';
import { EmptyFileSystem, URI } from 'langium';
import { createSafeDsServices } from '../../../src/language/index.js';
import { Range } from 'vscode-languageserver';
import { TestDescription, TestDescriptionError } from '../../helpers/testDescription.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const rootResourceName = 'validation';

export const createValidationTests = (): Promise<ValidationTest[]> => {
    const filesGroupedByParentDirectory = listTestSafeDsFilesGroupedByParentDirectory(rootResourceName);
    const testCases = filesGroupedByParentDirectory.map((entry) => createValidationTest(...entry));

    return Promise.all(testCases);
};

const createValidationTest = async (parentDirectory: URI, uris: URI[]): Promise<ValidationTest> => {
    const issues: ExpectedIssue[] = [];

    for (const uri of uris) {
        const code = fs.readFileSync(uri.fsPath).toString();

        // File must not contain any syntax errors
        const syntaxErrors = await getSyntaxErrors(services, code);
        if (syntaxErrors.length > 0) {
            return invalidTest(new SyntaxErrorsInCodeError(syntaxErrors, uri));
        }

        const checksResult = findTestChecks(code, uri);

        // Something went wrong when finding test checks
        if (checksResult.isErr) {
            return invalidTest(checksResult.error);
        }

        for (const check of checksResult.value) {
            const regex = /\s*(?<isAbsent>no\s+)?(?<severity>\S+)\s*(?:(?<messageIsRegex>r)?"(?<message>.*)")?/gu;
            const match = regex.exec(check.comment);

            // Overall comment is invalid
            if (!match) {
                return invalidTest(new InvalidCommentError(check.comment, uri));
            }

            // Extract groups from the match
            const presence = match.groups!.isAbsent ? 'absent' : 'present';
            const severity = match.groups!.severity;
            const messageIsRegex = match.groups!.messageIsRegex === 'r';
            const message = match.groups!.message;

            // Validate the severity
            if (!validSeverities.includes(severity as any)) {
                return invalidTest(new InvalidSeverityError(severity, uri));
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

    const shortenedResourceName = uriToShortenedTestResourceName(parentDirectory, rootResourceName);
    return {
        testName: `[${shortenedResourceName}] should be validated correctly`,
        uris,
        expectedIssues: issues,
    };
};

/**
 * Report a test that has errors.
 *
 * @param error The error that occurred.
 */
const invalidTest = (error: TestDescriptionError): ValidationTest => {
    const shortenedResourceName = uriToShortenedTestResourceName(error.uri, rootResourceName);
    const testName = `INVALID TEST FILE [${shortenedResourceName}]`;
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
interface ValidationTest extends TestDescription {
    /**
     * The URIs of the files that should be loaded into the workspace.
     */
    uris: URI[];

    /**
     * The issues we expect to find in the workspace.
     */
    expectedIssues: ExpectedIssue[];
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
    uri: URI;

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
class InvalidCommentError extends TestDescriptionError {
    constructor(
        readonly comment: string,
        uri: URI,
    ) {
        super(`Invalid test comment (refer to the documentation for guidance): ${comment}`, uri);
    }
}

/**
 * A test comment did not specify a valid severity.
 */
class InvalidSeverityError extends TestDescriptionError {
    constructor(
        readonly type: string,
        uri: URI,
    ) {
        super(`Invalid severity (valid values are ${validSeverities.join(', ')}): ${type}`, uri);
    }
}
