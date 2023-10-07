import { afterEach, describe, it } from 'vitest';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { NodeFileSystem } from 'langium/node';
import { clearDocuments } from 'langium/test';
import { AssertionError } from 'assert';
import { locationToString } from '../../helpers/location.js';
import { createPartialEvaluationTests } from './creator.js';
import { toConstantExpressionOrUndefined } from '../../../src/language/partialEvaluation/toConstantExpressionOrUndefined.js';
import { Location } from 'vscode-languageserver';
import { getNodeByLocation } from '../../helpers/nodeFinder.js';

const services = createSafeDsServices(NodeFileSystem).SafeDs;

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

        // Ensure all nodes in the equivalence class get evaluated to the same constant expression
        for (const equivalenceClassAssertion of test.equivalenceClassAssertions) {
            if (equivalenceClassAssertion.locations.length > 1) {
                const firstLocation = equivalenceClassAssertion.locations[0];
                const firstNode = getNodeByLocation(services, firstLocation);
                const firstValue = toConstantExpressionOrUndefined(firstNode);
                if (!firstValue) {
                    return reportUndefinedValue(firstLocation);
                }

                for (const currentLocation of equivalenceClassAssertion.locations.slice(1)) {
                    const currentNode = getNodeByLocation(services, currentLocation);
                    const currentValue = toConstantExpressionOrUndefined(currentNode);
                    if (!currentValue) {
                        return reportUndefinedValue(currentLocation);
                    }

                    if (!currentValue.equals(firstValue)) {
                        throw new AssertionError({
                            message: `Two nodes in the same equivalence class evaluate to different constant expressions.\n    Current location: ${locationToString(
                                currentLocation,
                            )}\n    First location: ${locationToString(firstLocation)}`,
                            actual: currentValue.toString(),
                            expected: firstValue.toString(),
                        });
                    }
                }
            }
        }

        // Ensure the serialized constant expression matches the expected one
        for (const serializationAssertion of test.serializationAssertions) {
            const node = getNodeByLocation(services, serializationAssertion.location);
            const actualValue = toConstantExpressionOrUndefined(node);
            if (!actualValue) {
                return reportUndefinedValue(serializationAssertion.location);
            }

            if (actualValue.toString() !== serializationAssertion.expectedValue) {
                throw new AssertionError({
                    message: `A node has the wrong serialized constant expression.\n    Location: ${locationToString(
                        serializationAssertion.location,
                    )}`,
                    actual: actualValue.toString(),
                    expected: serializationAssertion.expectedValue,
                });
            }
        }

        // Ensure the node does not evaluate to a constant expression
        for (const undefinedAssertion of test.undefinedAssertions) {
            const node = getNodeByLocation(services, undefinedAssertion.location);
            const actualValue = toConstantExpressionOrUndefined(node);
            if (actualValue) {
                throw new AssertionError({
                    message: `A node evaluates to a constant expression, but it should not.\n    Location: ${locationToString(
                        undefinedAssertion.location,
                    )}`,
                    actual: actualValue.toString(),
                    expected: 'undefined',
                });
            }
        }
    });
});

const reportUndefinedValue = (location: Location) => {
    throw new AssertionError({
        message: `A node could not be evaluated to a constant expression.\n    Location: ${locationToString(location)}`,
    });
};
