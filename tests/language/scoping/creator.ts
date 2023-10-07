import { listSafeDsFilesGroupedByParentDirectory, uriToShortenedResourceName } from '../../helpers/testResources.js';
import fs from 'fs';
import { findTestChecks } from '../../helpers/testChecks.js';
import { Location } from 'vscode-languageserver';
import { getSyntaxErrors, SyntaxErrorsInCodeError } from '../../helpers/diagnostics.js';
import { EmptyFileSystem, URI } from 'langium';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { TestDescription } from '../../helpers/testDescription.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const rootResourceName = 'scoping';

export const createScopingTests = (): Promise<ScopingTest[]> => {
    const filesGroupedByParentDirectory = listSafeDsFilesGroupedByParentDirectory(rootResourceName);
    const testCases = filesGroupedByParentDirectory.map((entry) => createScopingTest(...entry));

    return Promise.all(testCases);
};

const createScopingTest = async (parentDirectory: URI, uris: URI[]): Promise<ScopingTest> => {
    const shortenedResourceName = uriToShortenedResourceName(parentDirectory, rootResourceName);
    const references: ExpectedReferenceWithTargetId[] = [];
    const targets: Map<string, Target> = new Map();

    for (const uri of uris) {
        const code = fs.readFileSync(uri.fsPath).toString();

        // File must not contain any syntax errors
        const syntaxErrors = await getSyntaxErrors(services, code);
        if (syntaxErrors.length > 0) {
            return invalidTest('FILE', uri, new SyntaxErrorsInCodeError(syntaxErrors));
        }

        const checksResult = findTestChecks(code, uri, { failIfFewerRangesThanComments: true });

        // Something went wrong when finding test checks
        if (checksResult.isErr) {
            return invalidTest('FILE', uri, checksResult.error);
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
                    return invalidTest('SUITE', parentDirectory, new DuplicateTargetIdError(id));
                } else {
                    targets.set(id, {
                        id,
                        location: check.location!,
                    });
                }
                continue;
            }

            return invalidTest('FILE', uri, new InvalidCommentError(check.comment));
        }
    }

    // Check that all references point to a valid target and store the target location
    for (const reference of references) {
        if (reference.targetId) {
            if (!targets.has(reference.targetId)) {
                return invalidTest('SUITE', parentDirectory, new MissingTargetError(reference.targetId));
            }

            reference.targetLocation = targets.get(reference.targetId)!.location;
        }
    }

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
 * @param uri The URI of the test file or test suite.
 * @param error The error that occurred.
 */
const invalidTest = (level: 'FILE' | 'SUITE', uri: URI, error: Error): ScopingTest => {
    const shortenedResourceName = uriToShortenedResourceName(uri, rootResourceName);
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
class InvalidCommentError extends Error {
    constructor(readonly comment: string) {
        super(
            `Invalid test comment (valid values are 'references <targetId>', 'unresolved', and 'target <id>'): ${comment}`,
        );
    }
}

/**
 * Several targets have the same ID.
 */
class DuplicateTargetIdError extends Error {
    constructor(readonly id: string) {
        super(`Target ID ${id} is used more than once`);
    }
}

/**
 * A reference points to a target that does not exist.
 */
class MissingTargetError extends Error {
    constructor(readonly targetId: string) {
        super(`No target with ID ${targetId} exists`);
    }
}
