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

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const rootResourceName = 'scoping';

export const createScopingTests = (): Promise<ScopingTest[]> => {
    const filesGroupedByParentDirectory = listTestSafeDsFilesGroupedByParentDirectory(rootResourceName);
    const testCases = filesGroupedByParentDirectory.map((entry) => createScopingTest(...entry));

    return Promise.all(testCases);
};

const createScopingTest = async (parentDirectory: URI, uris: URI[]): Promise<ScopingTest> => {
    const references: ExpectedReferenceWithTargetId[] = [];
    const targets: Map<string, Target> = new Map();

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
            if (check.comment === 'unresolved') {
                references.push({
                    location: check.location!,
                });
                continue;
            }

            // Expected that reference is resolved and points to the target id
            const referenceMatch = /references (?<targetId>.*)/gu.exec(check.comment);
            if (referenceMatch) {
                references.push({
                    location: check.location!,
                    targetId: referenceMatch.groups!.targetId!,
                });
                continue;
            }

            // Register a target with the given id
            const targetMatch = /target (?<id>.*)/gu.exec(check.comment);
            if (targetMatch) {
                const id = targetMatch.groups!.id!;

                if (targets.has(id)) {
                    return invalidTest('SUITE', new DuplicateTargetIdError(id, parentDirectory));
                } else {
                    targets.set(id, {
                        id,
                        location: check.location!,
                    });
                }
                continue;
            }

            return invalidTest('FILE', new InvalidCommentError(check.comment, uri));
        }
    }

    // Check that all references point to a valid target and store the target location
    for (const reference of references) {
        if (reference.targetId) {
            if (!targets.has(reference.targetId)) {
                return invalidTest('SUITE', new MissingTargetError(reference.targetId, parentDirectory));
            }

            reference.targetLocation = targets.get(reference.targetId)!.location;
        }
    }

    const shortenedResourceName = uriToShortenedTestResourceName(parentDirectory, rootResourceName);
    return {
        testName: `[${shortenedResourceName}] should be scoped correctly`,
        uris,
        expectedReferences: references,
    };
};

/**
 * Report a test that has errors.
 *
 * @param level Whether a test file or a test suite is invalid.
 * @param error The error that occurred.
 */
const invalidTest = (level: 'FILE' | 'SUITE', error: TestDescriptionError): ScopingTest => {
    const shortenedResourceName = uriToShortenedTestResourceName(error.uri, rootResourceName);
    const testName = `INVALID TEST ${level} [${shortenedResourceName}]`;
    return {
        testName,
        uris: [],
        expectedReferences: [],
        error,
    };
};

/**
 * A description of a scoping test.
 */
interface ScopingTest extends TestDescription {
    /**
     * The URIs of the files that should be loaded into the workspace.
     */
    uris: URI[];

    /**
     * The references we expect to find in the workspace. It is allowed to have additional references, which will not be
     * checked.
     */
    expectedReferences: ExpectedReference[];
}

/**
 * A reference that should point to some target or be unresolved.
 */
export interface ExpectedReference {
    /**
     * The location of the reference.
     */
    location: Location;

    /**
     * The location of the target that the reference should point to. If undefined, the reference should be unresolved.
     */
    targetLocation?: Location;
}

/**
 * A reference that should point to some target or be unresolved. Used during the creation of scoping tests until all
 * targets have been found. At this point the IDs are replaced with the locations of the targets.
 */
interface ExpectedReferenceWithTargetId extends ExpectedReference {
    /**
     * The ID of the target that the reference should point to. If undefined, the reference should be unresolved.
     */
    targetId?: string;
}

/**
 * A name that can be referenced.
 */
interface Target {
    /**
     * The ID of the target.
     */
    id: string;

    /**
     * The location of the target.
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
            `Invalid test comment (valid values are 'references <targetId>', 'unresolved', and 'target <id>'): ${comment}`,
            uri,
        );
    }
}

/**
 * Several targets have the same ID.
 */
class DuplicateTargetIdError extends TestDescriptionError {
    constructor(
        readonly id: string,
        uri: URI,
    ) {
        super(`Target ID ${id} is used more than once`, uri);
    }
}

/**
 * A reference points to a target that does not exist.
 */
class MissingTargetError extends TestDescriptionError {
    constructor(
        readonly targetId: string,
        uri: URI,
    ) {
        super(`No target with ID ${targetId} exists`, uri);
    }
}
