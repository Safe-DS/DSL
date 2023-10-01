import { afterEach, beforeEach, describe, it } from 'vitest';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { URI } from 'vscode-uri';
import { NodeFileSystem } from 'langium/node';
import { clearDocuments } from 'langium/test';
import { AssertionError } from 'assert';
import { getNodeByLocation, locationToString } from '../../helpers/location.js';
import { createTypingTests } from './creator.js';
import { computeType } from '../../../src/language/typing/safe-ds-type-computer.js';

const services = createSafeDsServices(NodeFileSystem).SafeDs;

describe('typing', async () => {
    beforeEach(async () => {
        // Load the builtin library
        await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
    });

    afterEach(async () => {
        await clearDocuments(services);
    });

    it.each(await createTypingTests())('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Load all documents
        const documents = test.uris.map((uri) =>
            services.shared.workspace.LangiumDocuments.getOrCreateDocument(URI.parse(uri)),
        );
        await services.shared.workspace.DocumentBuilder.build(documents);

        // Ensure all nodes in the equivalence class have the same type
        for (const equivalenceClassAssertion of test.equivalenceClassAssertions) {
            if (equivalenceClassAssertion.locations.length > 1) {
                const firstLocation = equivalenceClassAssertion.locations[0];
                const firstNode = getNodeByLocation(services, firstLocation);
                const firstType = computeType(firstNode);

                for (const currentLocation of equivalenceClassAssertion.locations.slice(1)) {
                    const currentNode = getNodeByLocation(services, currentLocation);
                    const currentType = computeType(currentNode);

                    if (!currentType.equals(firstType)) {
                        throw new AssertionError({
                            message: `Two nodes in the same equivalence class have different types.\n    Current location: ${locationToString(
                                currentLocation,
                            )}\n    First location: ${locationToString(firstLocation)}`,
                            actual: currentType.toString(),
                            expected: firstType.toString(),
                        });
                    }
                }
            }
        }

        // Ensure the serialized type of the node matches the expected type
        for (const serializationAssertion of test.serializationAssertions) {
            const node = getNodeByLocation(services, serializationAssertion.location);
            const actualType = computeType(node);

            if (actualType.toString() !== serializationAssertion.expectedType) {
                throw new AssertionError({
                    message: `A node has the wrong serialized type.\n    Location: ${locationToString(
                        serializationAssertion.location,
                    )}`,
                    actual: actualType.toString(),
                    expected: serializationAssertion.expectedType,
                });
            }
        }
    });
});
