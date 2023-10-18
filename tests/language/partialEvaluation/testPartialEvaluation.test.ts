import { afterEach, describe, it } from 'vitest';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { NodeFileSystem } from 'langium/node';
import { clearDocuments } from 'langium/test';
import { AssertionError } from 'assert';
import { locationToString } from '../../helpers/location.js';
import { createPartialEvaluationTests } from './creator.js';
import { getNodeByLocation } from '../../helpers/nodeFinder.js';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
const partialEvaluator = services.evaluation.PartialEvaluator;

describe('partial evaluation', async () => {
    afterEach(async () => {
        await clearDocuments(services);
    });

    it.each(await createPartialEvaluationTests())('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Load all documents
        const documents = test.uris.map((uri) => services.shared.workspace.LangiumDocuments.getOrCreateDocument(uri));
        await services.shared.workspace.DocumentBuilder.build(documents);

        // Ensure that partially evaluating nodes in the same equivalence class yields the same result
        for (const equivalenceClassAssertion of test.equivalenceClassAssertions) {
            if (equivalenceClassAssertion.locations.length > 1) {
                const firstLocation = equivalenceClassAssertion.locations[0];
                const firstNode = getNodeByLocation(services, firstLocation);
                const firstValue = partialEvaluator.evaluate(firstNode);

                for (const currentLocation of equivalenceClassAssertion.locations.slice(1)) {
                    const currentNode = getNodeByLocation(services, currentLocation);
                    const currentValue = partialEvaluator.evaluate(currentNode);

                    if (!currentValue.equals(firstValue)) {
                        throw new AssertionError({
                            message: `Two nodes in the same equivalence class are simplified differently.\n    Current location: ${locationToString(
                                currentLocation,
                            )}\n    First location: ${locationToString(firstLocation)}`,
                            actual: currentValue.toString(),
                            expected: firstValue.toString(),
                        });
                    }
                }
            }
        }

        // Ensure the serializing the result of partially evaluating a node yields the expected value
        for (const serializationAssertion of test.serializationAssertions) {
            const node = getNodeByLocation(services, serializationAssertion.location);
            const actualValue = partialEvaluator.evaluate(node);

            if (actualValue.toString() !== serializationAssertion.expectedValue) {
                throw new AssertionError({
                    message: `A node has the wrong serialized simplification.\n    Location: ${locationToString(
                        serializationAssertion.location,
                    )}`,
                    actual: actualValue.toString(),
                    expected: serializationAssertion.expectedValue,
                });
            }
        }
    });
});
