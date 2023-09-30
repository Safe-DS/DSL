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
import {clearDocuments} from "langium/test";

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const root = 'scoping';

export const createScopingTests = (): Promise<ScopingTest[]> => {
    const pathsGroupedByParentDirectory = listTestsResourcesGroupedByParentDirectory(root);
    const testCases = Object.entries(pathsGroupedByParentDirectory).map(([dirname, paths]) =>
        createScopingTest(dirname, paths),
    );

    return Promise.all(testCases);
};

const createScopingTest = async (
    relativeParentDirectoryPath: string,
    relativeResourcePaths: string[],
): Promise<ScopingTest> => {
    const uris: string[] = [];
    const references: ExpectedReferenceWithTargetId[] = [];
    const targets: Map<string, Target> = new Map();

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
        await clearDocuments(services);

        const checksResult = findTestChecks(code, uri, { failIfFewerRangesThanComments: true });

        // Something went wrong when finding test checks
        if (checksResult.isErr) {
            return invalidTest(`INVALID TEST FILE [${relativeResourcePath}]`, checksResult.error);
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
                    return invalidTest(
                        `INVALID TEST SUITE [${relativeParentDirectoryPath}]`,
                        new DuplicateTargetIdError(id),
                    );
                } else {
                    targets.set(id, {
                        id,
                        location: check.location!,
                    });
                }
                continue;
            }

            return invalidTest(`INVALID TEST FILE [${relativeResourcePath}]`, new InvalidCommentError(check.comment));
        }
    }

    // Check that all references point to a valid target and store the target location
    for (const reference of references) {
        if (reference.targetId) {
            if (!targets.has(reference.targetId)) {
                return invalidTest(
                    `INVALID TEST SUITE [${relativeParentDirectoryPath}]`,
                    new MissingTargetError(reference.targetId),
                );
            }

            reference.targetLocation = targets.get(reference.targetId)!.location;
        }
    }

    return {
        testName: `[${relativeParentDirectoryPath}] should be scoped correctly`,
        uris,
        expectedReferences: references,
    };
};

/**
 * Report a test that has errors.
 *
 * @param testName The name of the test.
 * @param error The error that occurred.
 */
const invalidTest = (testName: string, error: Error): ScopingTest => {
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
interface ScopingTest {
    /**
     * The name of the test.
     */
    testName: string;

    /**
     * The URIs of the files that should be loaded into the workspace.
     */
    uris: string[];

    /**
     * The references we expect to find in the workspace. It is allowed to have additional references, which will not be
     * checked.
     */
    expectedReferences: ExpectedReference[];

    /**
     * An error that occurred while creating the test. If this is undefined, the test is valid.
     */
    error?: Error;
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
