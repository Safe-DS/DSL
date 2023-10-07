import { afterEach, beforeEach, describe, it } from 'vitest';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { NodeFileSystem } from 'langium/node';
import { createValidationTests, ExpectedIssue } from './creator.js';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-types';
import { AssertionError } from 'assert';
import { clearDocuments, isRangeEqual } from 'langium/test';
import { locationToString } from '../../helpers/location.js';

const services = createSafeDsServices(NodeFileSystem).SafeDs;

describe('validation', async () => {
    beforeEach(async () => {
        // Load the builtin library
        await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
    });

    afterEach(async () => {
        await clearDocuments(services);
    });

    it.each(await createValidationTests())('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Load all documents
        const documents = test.uris.map((uri) => services.shared.workspace.LangiumDocuments.getOrCreateDocument(uri));
        await services.shared.workspace.DocumentBuilder.build(documents, { validation: true });

        // Ensure all expected issues match
        for (const expectedIssue of test.expectedIssues) {
            const actualIssues = getMatchingActualIssues(expectedIssue);

            // Expected to find a matching issue
            if (expectedIssue.presence === 'present') {
                if (actualIssues.length === 0) {
                    throw new AssertionError({
                        message: `Expected to find a matching ${expectedIssue.severity} ${issueLocationToString(
                            expectedIssue,
                        )} but found none.`,
                        actual: getMatchingActualIssues({
                            presence: expectedIssue.presence,
                            severity: expectedIssue.severity,
                            uri: expectedIssue.uri,
                        }),
                        expected: [expectedIssue],
                    });
                }
            }

            // Expected to find no matching issue
            else {
                if (actualIssues.length > 0) {
                    throw new AssertionError({
                        message: `Expected to find no matching ${expectedIssue.severity} ${issueLocationToString(
                            expectedIssue,
                        )} but found some.`,
                        actual: actualIssues,
                        expected: [],
                    });
                }
            }
        }
    });
});

/**
 * Find the actual issues matching the expected issues.
 *
 * @param expectedIssue The expected issue.
 */
const getMatchingActualIssues = (expectedIssue: ExpectedIssue): Diagnostic[] => {
    const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(expectedIssue.uri);
    let result = document.diagnostics ?? [];

    // Filter by severity
    switch (expectedIssue.severity) {
        case 'error':
            result = result.filter((d) => d.severity === DiagnosticSeverity.Error);
            break;
        case 'warning':
            result = result.filter((d) => d.severity === DiagnosticSeverity.Warning);
            break;
        case 'info':
            result = result.filter((d) => d.severity === DiagnosticSeverity.Information);
            break;
        case 'hint':
            result = result.filter((d) => d.severity === DiagnosticSeverity.Hint);
            break;
    }

    // Filter by message
    if (expectedIssue.message) {
        if (expectedIssue.messageIsRegex) {
            const regex = new RegExp(expectedIssue.message, 'gu');
            result = result.filter((d) => regex.test(d.message));
        } else {
            result = result.filter((d) => d.message === expectedIssue.message);
        }
    }

    // Filter by range
    if (expectedIssue.range) {
        result = result.filter((d) => isRangeEqual(d.range, expectedIssue.range!));
    }

    return result;
};

/**
 * Converts the location of an expected issue to a string.
 *
 * @param expectedIssue The issue.
 */
const issueLocationToString = (expectedIssue: ExpectedIssue): string => {
    if (expectedIssue.range) {
        return `at ${locationToString({ uri: expectedIssue.uri.toString(), range: expectedIssue.range })}`;
    } else {
        return `in ${expectedIssue.uri}`;
    }
};
