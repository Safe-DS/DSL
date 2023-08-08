import {listTestResources, resolvePathRelativeToResources} from "../helpers/testResources";
import {group} from "radash";
import path from "path";
import fs from "fs";
import {findTestChecks} from "../helpers/testChecks";
import {Location} from "vscode-languageserver";

export const createScopingTests = (): ScopingTest[] => {
    const pathsRelativeToResources = listTestResources('scoping');
    const pathsRelativeToResourcesGroupedByDirname = group(pathsRelativeToResources, (pathRelativeToResources) =>
        path.dirname(pathRelativeToResources),
    ) as Record<string, string[]>;

    return Object.entries(pathsRelativeToResourcesGroupedByDirname).map(([dirname, paths]) =>
        createScopingTest(dirname, paths),
    );
};

const createScopingTest = (dirnameRelativeToResources: string, pathsRelativeToResources: string[]): ScopingTest => {
    const absolutePaths: string[] = [];
    const references: Reference[] = [];
    const targets: Map<string, Target> = new Map();

    for (const pathRelativeToResources of pathsRelativeToResources) {
        const absolutePath = resolvePathRelativeToResources(path.join('scoping', pathRelativeToResources));
        absolutePaths.push(absolutePath);

        const program = fs.readFileSync(absolutePath).toString();
        const checksResult = findTestChecks(program, { failIfFewerRangesThanComments: true });

        // Something went wrong when finding test checks
        if (checksResult.isErr) {
            return createErroneousTestReporter(`INVALID TEST FILE [${pathRelativeToResources}]`, checksResult.error);
        }

        const checks = checksResult.value;
        for (const check of checks) {
            // Check that reference is unresolved
            if (check.comment === 'unresolved') {
                references.push({
                    range: check.range!,
                    file: absolutePath,
                });
                continue;
            }

            // Check that reference is resolved and points to the target id
            const referenceMatch = /references (?<targetId>.*)/gu.exec(check.comment);
            if (referenceMatch) {
                references.push({
                    targetId: referenceMatch.groups!.targetId!,
                    range: check.range!,
                    file: absolutePath,
                });
                continue;
            }

            // Register a target with the given id
            const targetMatch = /target (?<id>.*)/gu.exec(check.comment);
            if (targetMatch) {
                const id = targetMatch.groups!.id!;

                if (targets.has(id)) {
                    return createErroneousTestReporter(
                        `INVALID TEST SUITE [${dirnameRelativeToResources}]`,
                        new DuplicateTargetIdError(id),
                    );
                } else {
                    targets.set(id, {
                        id,
                        range: check.range!,
                        file: absolutePath,
                    });
                }
                continue;
            }

            return createErroneousTestReporter(
                `INVALID TEST FILE [${pathRelativeToResources}]`,
                new InvalidCommentError(check.comment),
            );
        }
    }

    // Check that all references point to a valid target
    for (const reference of references) {
        if (reference.targetId && !targets.has(reference.targetId)) {
            return createErroneousTestReporter(
                `INVALID TEST SUITE [${dirnameRelativeToResources}]`,
                new MissingTargetError(reference.targetId),
            );
        }
    }

    return {
        testName: `[${dirnameRelativeToResources}] should be scoped correctly`,
        absolutePaths,
        expectedReferences: references,
        expectedTargets: targets,
    };
};

const createErroneousTestReporter = (testName: string, error: Error): ScopingTest => {
    return {
        testName,
        absolutePaths: [],
        expectedReferences: [],
        expectedTargets: new Map(),
        error,
    };
};

interface ScopingTest {
    testName: string;
    absolutePaths: string[];
    expectedReferences: Reference[];
    expectedTargets: Map<string, Target>;
    error?: Error;
}

interface Reference {
    targetId?: string;
    location: Location;
}

interface Target {
    id: string;
    location: Location;
}

class InvalidCommentError extends Error {
    constructor(readonly comment: string) {
        super(
            `Invalid test comment (valid values are 'references <targetId>', 'unresolved', and 'target <id>'): ${comment}`,
        );
    }
}

class DuplicateTargetIdError extends Error {
    constructor(readonly id: string) {
        super(`Target ID ${id} is used more than once`);
    }
}

class MissingTargetError extends Error {
    constructor(readonly targetId: string) {
        super(`No target with ID ${targetId} exists`);
    }
}
