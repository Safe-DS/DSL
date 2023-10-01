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
import { clearDocuments } from 'langium/test';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const root = 'partial evaluation';

export const createPartialEvaluationTests = (): Promise<PartialEvaluationTest[]> => {
    const pathsGroupedByParentDirectory = listTestsResourcesGroupedByParentDirectory(root);
    const testCases = Object.entries(pathsGroupedByParentDirectory).map(([dirname, paths]) =>
        createPartialEvaluationTest(dirname, paths),
    );

    return Promise.all(testCases);
};

const createPartialEvaluationTest = async (
    relativeParentDirectoryPath: string,
    relativeResourcePaths: string[],
): Promise<PartialEvaluationTest> => {
    const uris: string[] = [];
    const groupIdToLocations: Map<string, Location[]> = new Map();
    const serializationAssertions: SerializationAssertion[] = [];
    const undefinedAssertions: UndefinedAssertion[] = [];

    for (const relativeResourcePath of relativeResourcePaths) {
        const absolutePath = resolvePathRelativeToResources(path.join(root, relativeResourcePath));
        const uri = URI.file(absolutePath).toString();
        uris.push(uri);

        const code = fs.readFileSync(absolutePath).toString();

        // File must not contain any syntax errors
        await clearDocuments(services);
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
            const equivalenceClassMatch = /constant equivalence_class (?<id>.*)/gu.exec(check.comment);
            if (equivalenceClassMatch) {
                const id = equivalenceClassMatch.groups!.id;
                const priorLocationsInEquivalenceClass = groupIdToLocations.get(id) ?? [];
                priorLocationsInEquivalenceClass.push(check.location!);
                groupIdToLocations.set(id, priorLocationsInEquivalenceClass);
                continue;
            }

            // Expected that reference is resolved and points to the target id
            const serializationMatch = /constant serialization (?<expectedValue>.*)/gu.exec(check.comment);
            if (serializationMatch) {
                const expectedValue = serializationMatch.groups!.expectedValue;
                serializationAssertions.push({
                    location: check.location!,
                    expectedValue,
                });
                continue;
            }

            // Expected that reference is resolved and points to the target id
            const undefinedMatch = /not constant/gu.exec(check.comment);
            if (undefinedMatch) {
                undefinedAssertions.push({
                    location: check.location!,
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
        testName: `[${relativeParentDirectoryPath}] should be partially evaluated correctly`,
        uris,
        equivalenceClassAssertions: [...groupIdToLocations.values()].map((locations) => ({ locations })),
        serializationAssertions,
        undefinedAssertions,
    };
};

/**
 * Report a test that has errors.
 *
 * @param testName The name of the test.
 * @param error The error that occurred.
 */
const invalidTest = (testName: string, error: Error): PartialEvaluationTest => {
    return {
        testName,
        uris: [],
        equivalenceClassAssertions: [],
        serializationAssertions: [],
        undefinedAssertions: [],
        error,
    };
};

/**
 * A description of a partial evaluation test.
 */
interface PartialEvaluationTest {
    /**
     * The name of the test.
     */
    testName: string;

    /**
     * The URIs of the files that should be loaded into the workspace.
     */
    uris: string[];

    /**
     * All nodes in an equivalence class should evaluate to the same constant expression.
     */
    equivalenceClassAssertions: EquivalenceClassAssertion[];

    /**
     * The serialized constant expression of a node should match the expected value.
     */
    serializationAssertions: SerializationAssertion[];

    /**
     * The node should not evaluate to a constant expression.
     */
    undefinedAssertions: UndefinedAssertion[];

    /**
     * An error that occurred while creating the test. If this is undefined, the test is valid.
     */
    error?: Error;
}

/**
 * A set of nodes should all evaluate to the same constant expression.
 */
interface EquivalenceClassAssertion {
    /**
     * The locations of the nodes that should all evaluate to the same constant expression.
     */
    locations: Location[];
}

/**
 * The serialized constant expression of a node should match the expected value.
 */
interface SerializationAssertion {
    /**
     * The location of the node whose serialized constant expression should be checked.
     */
    location: Location;

    /**
     * The expected serialized constant expression of the node.
     */
    expectedValue: string;
}

/**
 * The node should not evaluate to a constant expression.
 */
interface UndefinedAssertion {
    /**
     * The location of the node to check.
     */
    location: Location;
}

/**
 * A test comment did not match the expected format.
 */
class InvalidCommentError extends Error {
    constructor(readonly comment: string) {
        super(
            `Invalid test comment (valid values are 'constant equivalence_class <id>', 'constant serialization <type>', and 'not constant'): ${comment}`,
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
