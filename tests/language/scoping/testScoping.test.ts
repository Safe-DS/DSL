import { afterEach, beforeEach, describe, it } from 'vitest';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { URI } from 'vscode-uri';
import { NodeFileSystem } from 'langium/node';
import { clearDocuments, isRangeEqual } from 'langium/test';
import { AssertionError } from 'assert';
import { isLocationEqual, locationToString } from '../../helpers/location.js';
import { createScopingTests, ExpectedReference } from './creator.js';
import { LangiumDocument, Reference } from 'langium';
import { Location } from 'vscode-languageserver';

const services = createSafeDsServices(NodeFileSystem).SafeDs;

describe('scoping', async () => {
    beforeEach(async () => {
        // Load the builtin library
        await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
    });

    afterEach(async () => {
        await clearDocuments(services);
    });

    it.each(await createScopingTests())('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Load all documents
        const documents = test.uris.map((uri) => services.shared.workspace.LangiumDocuments.getOrCreateDocument(uri));
        await services.shared.workspace.DocumentBuilder.build(documents);

        // Ensure all expected references match
        for (const expectedReference of test.expectedReferences) {
            const expectedTargetLocation = expectedReference.targetLocation;
            const actualTargetLocation = findActualTargetLocation(expectedReference);

            // Expected reference to be resolved
            if (expectedTargetLocation) {
                if (!actualTargetLocation) {
                    throw new AssertionError({
                        message: `Expected a resolved reference but it was unresolved.\n    Reference Location: ${locationToString(
                            expectedReference.location,
                        )}\n    Expected Target Location: ${locationToString(expectedTargetLocation)}`,
                    });
                } else if (!isLocationEqual(expectedTargetLocation, actualTargetLocation)) {
                    throw new AssertionError({
                        message: `Expected a resolved reference but it points to the wrong declaration.\n    Reference Location: ${locationToString(
                            expectedReference.location,
                        )}\n    Expected Target Location: ${locationToString(
                            expectedTargetLocation,
                        )}\n    Actual Target Location: ${locationToString(actualTargetLocation)}`,
                        expected: expectedTargetLocation,
                        actual: actualTargetLocation,
                    });
                }
            }

            // Expected reference to be unresolved
            else {
                if (actualTargetLocation) {
                    throw new AssertionError({
                        message: `Expected an unresolved reference but it was resolved.\n    Reference Location: ${locationToString(
                            expectedReference.location,
                        )}\n    Actual Target Location: ${locationToString(actualTargetLocation)}`,
                    });
                }
            }
        }
    });
});

/**
 * Find the actual target location of the actual reference that matches the expected reference. If the actual reference
 * cannot be resolved, undefined is returned.
 *
 * @param expectedReference The expected reference.
 * @returns The actual target location or undefined if the actual reference is not resolved.
 * @throws AssertionError If no matching actual reference was found.
 */
const findActualTargetLocation = (expectedReference: ExpectedReference): Location | undefined => {
    const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(
        URI.parse(expectedReference.location.uri),
    );

    const actualReference = findActualReference(document, expectedReference);

    const actualTarget = actualReference.$nodeDescription;
    const actualTargetUri = actualTarget?.documentUri?.toString();
    const actualTargetRange = actualTarget?.nameSegment?.range;

    if (!actualTargetUri || !actualTargetRange) {
        return undefined;
    }

    return {
        uri: actualTargetUri,
        range: actualTargetRange,
    };
};

/**
 * Find the reference in the given document that matches the expected reference.
 *
 * @param document The document to search in.
 * @param expectedReference The expected reference.
 * @returns The actual reference.
 * @throws AssertionError If no reference was found.
 */
const findActualReference = (document: LangiumDocument, expectedReference: ExpectedReference): Reference => {
    // Find actual reference
    const actualReference = document.references.find((reference) => {
        const actualReferenceRange = reference.$refNode?.range;
        return actualReferenceRange && isRangeEqual(actualReferenceRange, expectedReference.location.range);
    });

    // Could not find a reference at the expected location
    if (!actualReference) {
        throw new AssertionError({
            message: `Expected a reference but found none.\n    Reference Location: ${locationToString(
                expectedReference.location,
            )}`,
        });
    }
    return actualReference;
};
