import { listTestSafeDsFilesGroupedByParentDirectory, uriToShortenedTestResourceName } from '../../helpers/testResources.js';
import fs from 'fs';
import { findTestChecks } from '../../helpers/testChecks.js';
import { Location } from 'vscode-languageserver';
import { getSyntaxErrors, SyntaxErrorsInCodeError } from '../../helpers/diagnostics.js';
import { EmptyFileSystem, URI } from 'langium';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { TestDescription, TestDescriptionError } from '../../helpers/testDescription.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const rootResourceName = 'typing';

export const createTypingTests = (): Promise<TypingTest[]> => {
    const filesGroupedByParentDirectory = listTestSafeDsFilesGroupedByParentDirectory(rootResourceName);
    const testCases = filesGroupedByParentDirectory.map((entry) => createTypingTest(...entry));

    return Promise.all(testCases);
};

const createTypingTest = async (parentDirectory: URI, uris: URI[]): Promise<TypingTest> => {
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
        testName: `[${shortenedResourceName}] should be typed correctly`,
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
const invalidTest = (level: 'FILE' | 'SUITE', error: TestDescriptionError): TypingTest => {
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
 * A description of a typing test.
 */
interface TypingTest extends TestDescription {
    /**
     * The URIs of the files that should be loaded into the workspace.
     */
    uris: URI[];

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
class InvalidCommentError extends TestDescriptionError {
    constructor(
        readonly comment: string,
        uri: URI,
    ) {
        super(
            `Invalid test comment (valid values are 'equivalence_class <id>' and 'serialization <type>'): ${comment}`,
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
