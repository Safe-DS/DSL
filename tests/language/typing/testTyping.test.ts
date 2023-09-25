import { afterEach, beforeEach, describe, it } from 'vitest';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { URI } from 'vscode-uri';
import { NodeFileSystem } from 'langium/node';
import { clearDocuments, isRangeEqual } from 'langium/test';
import { AssertionError } from 'assert';
import { locationToString } from '../../helpers/location.js';
import { createTypingTests } from './creator.js';
import { AstNode, streamAllContents } from 'langium';
import { Location, Range } from 'vscode-languageserver';
import { isSdsModule } from '../../../src/language/generated/ast.js';
import { computeType } from '../../../src/language/typing/typeComputer.js';

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
                const firstNode = getNodeByLocation(firstLocation);
                const firstType = computeType(firstNode);

                for (const currentLocation of equivalenceClassAssertion.locations.slice(1)) {
                    const currentNode = getNodeByLocation(currentLocation);
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
            const node = getNodeByLocation(serializationAssertion.location);
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

/**
 * Find the AstNode at the given location. It must fill the range exactly.
 *
 * @param location The location of the node to find.
 * @returns The node at the given location.
 * @throws AssertionError If no matching node was found.
 */
const getNodeByLocation = (location: Location): AstNode => {
    const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(URI.parse(location.uri));
    const root = document.parseResult.value;

    if (!isSdsModule(root)) {
        throw new AssertionError({
            message: `The root node of ${location.uri} is not a SdsModule`,
        });
    }

    for (const node of streamAllContents(root)) {
        const actualRange = node.$cstNode?.range;
        if (actualRange && isRangeEqual(actualRange, location.range)) {
            return node;
        }

        const actualNameRange = getNameRange(node);
        if (actualNameRange && isRangeEqual(actualNameRange, location.range)) {
            return node;
        }
    }

    throw new AssertionError({ message: `Expected to find a node at ${locationToString(location)} but found none.` });
};

/**
 * Returns the range of the name of the given node or undefined if the node has no name.
 */
const getNameRange = (node: AstNode): Range | undefined => {
    return services.references.NameProvider.getNameNode(node)?.range;
};
