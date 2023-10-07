import {
    listTestsResourcesGroupedByParentDirectory,
    resolvePathRelativeToResources,
} from '../../helpers/testResources.js';
import path from 'path';
import fs from 'fs';
import { findTestChecks } from '../../helpers/testChecks.js';
import { Location } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { getSyntaxErrors, SyntaxErrorsInCodeError } from '../../helpers/diagnostics.js';
import { EmptyFileSystem } from 'langium';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { TestDescription } from '../../helpers/testDescription.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const root = 'typing';

export const createTypingTests = (): Promise<TypingTest[]> => {
    const pathsGroupedByParentDirectory = listTestsResourcesGroupedByParentDirectory(root);
    const testCases = Object.entries(pathsGroupedByParentDirectory).map(([dirname, paths]) =>
        createTypingTest(dirname, paths),
    );

    return Promise.all(testCases);
};

const createTypingTest = async (
    relativeParentDirectoryPath: string,
    relativeResourcePaths: string[],
): Promise<TypingTest> => {
    const uris: string[] = [];
    const groupIdToLocations: Map<string, Location[]> = new Map();
    const serializationAssertions: SerializationAssertion[] = [];

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

        const checksResult = findTestChecks(code, uri, { failIfFewerRangesThanComments: true });

        // Something went wrong when finding test checks
        if (checksResult.isErr) {
            return invalidTest(`INVALID TEST FILE [${relativeResourcePath}]`, checksResult.error);
        }

        for (const check of checksResult.value) {
            // Expected unresolved reference
            const equivalenceClassMatch = /equivalence_class (?<id>.*)/gu.exec(check.comment);
            if (equivalenceClassMatch) {
                const id = equivalenceClassMatch.groups!.id;
                const priorLocationsInEquivalenceClass = groupIdToLocations.get(id) ?? [];
                priorLocationsInEquivalenceClass.push(check.location!);
                groupIdToLocations.set(id, priorLocationsInEquivalenceClass);
                continue;
            }

            // Expected that reference is resolved and points to the target id
            const serializationMatch = /serialization (?<expectedType>.*)/gu.exec(check.comment);
            if (serializationMatch) {
                const expectedType = serializationMatch.groups!.expectedType;
                serializationAssertions.push({
                    location: check.location!,
                    expectedType,
                });
                continue;
            }

            return invalidTest(`INVALID TEST FILE [${relativeResourcePath}]`, new InvalidCommentError(check.comment));
        }
    }

    // Check that all equivalence classes have at least two locations
    for (const [id, locations] of groupIdToLocations) {
        if (locations.length < 2) {
            return invalidTest(
                `INVALID TEST SUITE [${relativeParentDirectoryPath}]`,
                new SingletonEquivalenceClassError(id),
            );
        }
    }

    return {
        testName: `[${relativeParentDirectoryPath}] should be typed correctly`,
        uris,
        equivalenceClassAssertions: [...groupIdToLocations.values()].map((locations) => ({ locations })),
        serializationAssertions,
    };
};

/**
 * Report a test that has errors.
 *
 * @param testName The name of the test.
 * @param error The error that occurred.
 */
const invalidTest = (testName: string, error: Error): TypingTest => {
    return {
        testName,
        uris: [],
        equivalenceClassAssertions: [],
        serializationAssertions: [],
        error,
    };
};

/**
 * A description of a typing test.
 */
interface TypingTest extends TestDescription {
    /**
     * The URIs of the files that should be loaded into the workspace.
     */
    uris: string[];

    /**
     * All nodes in an equivalence class should get the same type.
     */
    equivalenceClassAssertions: EquivalenceClassAssertion[];

    /**
     * The serialized type of a node should match the expected type.
     */
    serializationAssertions: SerializationAssertion[];
}

/**
 * A set of nodes should all get the same type.
 */
interface EquivalenceClassAssertion {
    /**
     * The locations of the nodes that should all get the same type.
     */
    locations: Location[];
}

/**
 * The serialized type of a node should match the expected type.
 */
interface SerializationAssertion {
    /**
     * The location of the node whose serialized type should be checked.
     */
    location: Location;

    /**
     * The expected serialized type of the node.
     */
    expectedType: string;
}

/**
 * A test comment did not match the expected format.
 */
class InvalidCommentError extends Error {
    constructor(readonly comment: string) {
        super(
            `Invalid test comment (valid values are 'equivalence_class <id>' and 'serialization <type>'): ${comment}`,
        );
    }
}

/**
 * An equivalence class test contains only a single location.
 */
class SingletonEquivalenceClassError extends Error {
    constructor(readonly id: string) {
        super(`Equivalence class '${id}' only contains a single location. Such an assertion always succeeds.`);
    }
}
