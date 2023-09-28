import { Location, Position, Range } from 'vscode-languageserver';
import { isRangeEqual } from 'langium/test';
import { SafeDsServices } from '../../src/language/safe-ds-module.js';
import { AstNode, streamAllContents, URI } from 'langium';
import { isSdsModule } from '../../src/language/generated/ast.js';
import { AssertionError } from 'assert';

/**
 * Converts a position to a string.
 *
 * @param position The position to convert.
 * @returns The string representation of the position.
 */
export const positionToString = (position: Position): string => {
    return `${position.line + 1}:${position.character + 1}`;
};

/**
 * Converts a range to a string.
 *
 * @param range The range to convert.
 * @returns The string representation of the range.
 */
export const rangeToString = (range: Range): string => {
    return `${positionToString(range.start)} -> ${positionToString(range.end)}`;
};

/**
 * Converts a location to a string.
 *
 * @param location The location to convert.
 * @returns The string representation of the location.
 */
export const locationToString = (location: Location) => {
    return `${location.uri}:${rangeToString(location.range)}`;
};

/**
 * Compare two locations for equality.
 *
 * @param location1 The first location.
 * @param location2 The second location.
 * @returns True if the locations are equal, false otherwise.
 */
export const isLocationEqual = (location1: Location, location2: Location): boolean => {
    return location1.uri === location2.uri && isRangeEqual(location1.range, location2.range);
};

/**
 * Find the AstNode at the given location. It must fill the range exactly.
 *
 * @param services The services to use.
 * @param location The location of the node to find.
 * @returns The node at the given location.
 * @throws AssertionError If no matching node was found.
 */
export const getNodeByLocation = (services: SafeDsServices, location: Location): AstNode => {
    const langiumDocuments = services.shared.workspace.LangiumDocuments;
    const uri = URI.parse(location.uri);

    if (!langiumDocuments.hasDocument(uri)) {
        throw new AssertionError({
            message: `No document found at ${location.uri}`,
        });
    }

    const document = langiumDocuments.getOrCreateDocument(URI.parse(location.uri));
    const root = document.parseResult.value;

    if (!isSdsModule(root)) {
        throw new AssertionError({
            message: `The root node of ${location.uri} is not a SdsModule`,
        });
    }

    for (const node of streamAllContents(root, { range: location.range })) {
        // Entire node matches the range
        const actualRange = node.$cstNode?.range;
        if (actualRange && isRangeEqual(actualRange, location.range)) {
            return node;
        }

        // The node has a name node that matches the range
        const actualNameRange = getNameRange(services, node);
        if (actualNameRange && isRangeEqual(actualNameRange, location.range)) {
            return node;
        }
    }

    throw new AssertionError({ message: `Expected to find a node at ${locationToString(location)} but found none.` });
};

/**
 * Returns the range of the name of the given node or undefined if the node has no name.
 */
const getNameRange = (services: SafeDsServices, node: AstNode): Range | undefined => {
    return services.references.NameProvider.getNameNode(node)?.range;
};
