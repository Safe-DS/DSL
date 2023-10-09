import { listTestSafeDsFilesGroupedByParentDirectory, uriToShortenedTestResourceName } from '../../helpers/testResources.js';
import fs from 'fs';
import { findTestChecks } from '../../helpers/testChecks.js';
import { Location } from 'vscode-languageserver';
import { getSyntaxErrors, SyntaxErrorsInCodeError } from '../../helpers/diagnostics.js';
import { EmptyFileSystem, URI } from 'langium';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { TestDescription, TestDescriptionError } from '../../helpers/testDescription.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const rootResourceName = 'partial evaluation';

export const createPartialEvaluationTests = (): Promise<PartialEvaluationTest[]> => {
    const filesGroupedByParentDirectory = listTestSafeDsFilesGroupedByParentDirectory(rootResourceName);
    const testCases = filesGroupedByParentDirectory.map((entry) => createPartialEvaluationTest(...entry));

    return Promise.all(testCases);
};

const createPartialEvaluationTest = async (parentDirectory: URI, uris: URI[]): Promise<PartialEvaluationTest> => {
    const groupIdToLocations: Map<string, Location[]> = new Map();
    const serializationAssertions: SerializationAssertion[] = [];
    const undefinedAssertions: UndefinedAssertion[] = [];

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
        testName: `[${shortenedResourceName}] should be partially evaluated correctly`,
        uris,
        equivalenceClassAssertions: [...groupIdToLocations.values()].map((locations) => ({ locations })),
        serializationAssertions,
        undefinedAssertions,
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
        undefinedAssertions: [],
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
