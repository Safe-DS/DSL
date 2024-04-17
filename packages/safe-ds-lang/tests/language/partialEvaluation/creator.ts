import fs from 'fs';
import { EmptyFileSystem, URI } from 'langium';
import { Location } from 'vscode-languageserver';
import { createSafeDsServices } from '../../../src/language/index.js';
import { getSyntaxErrors, SyntaxErrorsInCodeError } from '../../helpers/diagnostics.js';
import { findTestChecks } from '../../helpers/testChecks.js';
import { TestDescription, TestDescriptionError } from '../../helpers/testDescription.js';
import {
    listTestSafeDsFilesGroupedByParentDirectory,
    uriToShortenedTestResourceName,
} from '../../helpers/testResources.js';

const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;
const rootResourceName = 'partial evaluation';

export const createPartialEvaluationTests = (): Promise<PartialEvaluationTest[]> => {
    const filesGroupedByParentDirectory = listTestSafeDsFilesGroupedByParentDirectory(rootResourceName);
    const testCases = filesGroupedByParentDirectory.map((entry) => createPartialEvaluationTest(...entry));

    return Promise.all(testCases);
};

const createPartialEvaluationTest = async (parentDirectory: URI, uris: URI[]): Promise<PartialEvaluationTest> => {
    const groupIdToLocations: Map<string, Location[]> = new Map();
    const serializationAssertions: SerializationAssertion[] = [];

    for (const uri of uris) {
        const code = fs.readFileSync(uri.fsPath).toString();

        // File must not contain any syntax errors
        const syntaxErrors = await getSyntaxErrors(services, code);
        if (syntaxErrors.length > 0) {
            return invalidTest('FILE', new SyntaxErrorsInCodeError(syntaxErrors, uri));
        }

        const checksResult = findTestChecks(code, uri, { failIfFewerRangesThanComments: true });

        // Something went wrong when finding test checks
        if (checksResult.isErr) {
            return invalidTest('FILE', checksResult.error);
        }

        for (const check of checksResult.value) {
            // Partially evaluating a set of nodes should yield the same result
            const equivalenceClassMatch = /equivalence_class (?<id>.*)/gu.exec(check.comment);
            if (equivalenceClassMatch) {
                const id = equivalenceClassMatch.groups!.id!;
                const priorLocationsInEquivalenceClass = groupIdToLocations.get(id) ?? [];
                priorLocationsInEquivalenceClass.push(check.location!);
                groupIdToLocations.set(id, priorLocationsInEquivalenceClass);
                continue;
            }

            // Partially evaluating a node and serializing the result should yield the expected value.
            const serializationMatch = /serialization (?<expectedValue>.*)/gu.exec(check.comment);
            if (serializationMatch) {
                const expectedValue = serializationMatch.groups!.expectedValue!;
                serializationAssertions.push({
                    location: check.location!,
                    expectedValue,
                });
                continue;
            }

            return invalidTest('FILE', new InvalidCommentError(check.comment, uri));
        }
    }

    // Check that all equivalence classes have at least two locations
    for (const [id, locations] of groupIdToLocations) {
        if (locations.length < 2) {
            return invalidTest('SUITE', new SingletonEquivalenceClassError(id, parentDirectory));
        }
    }

    const shortenedResourceName = uriToShortenedTestResourceName(parentDirectory, rootResourceName);
    return {
        testName: `[${shortenedResourceName}]`,
        uris,
        equivalenceClassAssertions: [...groupIdToLocations.values()].map((locations) => ({ locations })),
        serializationAssertions,
    };
};

/**
 * Report a test that has errors.
 *
 * @param level Whether a test file or a test suite is invalid.
 * @param error The error that occurred.
 */
const invalidTest = (level: 'FILE' | 'SUITE', error: TestDescriptionError): PartialEvaluationTest => {
    const shortenedResourceName = uriToShortenedTestResourceName(error.uri, rootResourceName);
    const testName = `INVALID TEST ${level} [${shortenedResourceName}]`;
    return {
        testName,
        uris: [],
        equivalenceClassAssertions: [],
        serializationAssertions: [],
        error,
    };
};

/**
 * A description of a partial evaluation test.
 */
interface PartialEvaluationTest extends TestDescription {
    /**
     * The URIs of the files that should be loaded into the workspace.
     */
    uris: URI[];

    /**
     * Partially evaluating nodes in the same equivalence class should yield the same result.
     */
    equivalenceClassAssertions: EquivalenceClassAssertion[];

    /**
     * Partially evaluating a node and serializing the result should yield the expected value.
     */
    serializationAssertions: SerializationAssertion[];
}

/**
 * Partially evaluating a set of nodes should yield the same result.
 */
interface EquivalenceClassAssertion {
    /**
     * The locations of the nodes to partially evaluate.
     */
    locations: Location[];
}

/**
 * Partially evaluating a node and serializing the result should yield the expected value.
 */
interface SerializationAssertion {
    /**
     * The location of the node to partially evaluate.
     */
    location: Location;

    /**
     * The expected serialized evaluation of the node.
     */
    expectedValue: string;
}

/**
 * A test comment did not match the expected format.
 */
class InvalidCommentError extends TestDescriptionError {
    constructor(
        readonly comment: string,
        uri: URI,
    ) {
        super(
            `Invalid test comment (valid values are 'constant equivalence_class <id>', 'constant serialization <type>', and 'not constant'): ${comment}`,
            uri,
        );
    }
}

/**
 * An equivalence class test contains only a single location.
 */
class SingletonEquivalenceClassError extends TestDescriptionError {
    constructor(
        readonly id: string,
        uri: URI,
    ) {
        super(`Equivalence class '${id}' only contains a single location. Such an assertion always succeeds.`, uri);
    }
}
