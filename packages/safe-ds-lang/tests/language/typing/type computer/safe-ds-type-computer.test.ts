import { describe, it } from 'vitest';
import { createSafeDsServicesWithBuiltins } from '../../../../src/language/index.js';
import { NodeFileSystem } from 'langium/node';
import { AssertionError } from 'assert';
import { locationToString } from '../../../../src/helpers/locations.js';
import { createTypingTests } from './creator.js';
import { getNodeByLocation } from '../../../helpers/nodeFinder.js';
import { loadDocuments } from '../../../helpers/testResources.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const typeComputer = services.types.TypeComputer;

describe('typing', async () => {
    it.each(await createTypingTests())('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Load all documents
        await loadDocuments(services, test.uris);

        // Ensure all nodes in the equivalence class have the same type
        for (const equivalenceClassAssertion of test.equivalenceClassAssertions) {
            if (equivalenceClassAssertion.locations.length > 1) {
                const firstLocation = equivalenceClassAssertion.locations[0]!;
                const firstNode = getNodeByLocation(services, firstLocation);
                const firstType = typeComputer.computeType(firstNode);

                for (const currentLocation of equivalenceClassAssertion.locations.slice(1)) {
                    const currentNode = getNodeByLocation(services, currentLocation);
                    const currentType = typeComputer.computeType(currentNode);

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
            const actualType = typeComputer.computeType(node);

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
