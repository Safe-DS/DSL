import {
    listPythonResources_PathBased,
    listTestsResourcesGroupedByParentDirectory_PathBased,
    resolvePathRelativeToResources_PathBased,
} from '../../helpers/testResources.js';
import path from 'path';
import fs from 'fs';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { ErrorsInCodeError, getErrors } from '../../helpers/diagnostics.js';
import { URI } from 'vscode-uri';
import { findTestChecks } from '../../helpers/testChecks.js';
import { Location } from 'vscode-languageserver';
import { NodeFileSystem } from 'langium/node';
import { TestDescription } from '../../helpers/testDescription.js';
import { locationToString } from '../../helpers/location.js';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
const root = 'generation';

export const createGenerationTests = async (): Promise<GenerationTest[]> => {
    const pathsGroupedByParentDirectory = listTestsResourcesGroupedByParentDirectory_PathBased(root);
    const testCases = Object.entries(pathsGroupedByParentDirectory).map(([dirname, paths]) =>
        createGenerationTest(dirname, paths),
    );

    return Promise.all(testCases);
};

const createGenerationTest = async (
    relativeParentDirectoryPath: string,
    relativeResourcePaths: string[],
): Promise<GenerationTest> => {
    const inputUris: string[] = [];
    const expectedOutputRoot = path.join(root, relativeParentDirectoryPath, 'output');
    const actualOutputRoot = resolvePathRelativeToResources_PathBased(path.join(root, relativeParentDirectoryPath, 'generated'));
    const expectedOutputFiles = readExpectedOutputFiles(expectedOutputRoot, actualOutputRoot);
    let runUntil: Location | undefined;

    for (const relativeResourcePath of relativeResourcePaths) {
        const absolutePath = resolvePathRelativeToResources_PathBased(path.join(root, relativeResourcePath));
        const uri = URI.file(absolutePath).toString();
        inputUris.push(uri);

        const code = fs.readFileSync(absolutePath).toString();

        // File must not contain any errors
        const errors = await getErrors(services, code);
        if (errors.length > 0) {
            return invalidTest(`INVALID TEST FILE [${relativeResourcePath}]`, new ErrorsInCodeError(errors));
        }

        const checksResult = findTestChecks(code, uri, { failIfFewerRangesThanComments: true });

        // Something went wrong when finding test checks
        if (checksResult.isErr) {
            return invalidTest(`INVALID TEST FILE [${relativeResourcePath}]`, checksResult.error);
        }

        // Must contain at most one comment
        if (checksResult.value.length > 1) {
            return invalidTest(
                `INVALID TEST FILE [${relativeResourcePath}]`,
                new MultipleChecksError(checksResult.value.length),
            );
        }

        // Comment must match the expected format
        if (checksResult.value.length === 1) {
            const check = checksResult.value[0];

            // Expected unresolved reference
            if (check.comment !== 'run_until') {
                return invalidTest(
                    `INVALID TEST FILE [${relativeResourcePath}]`,
                    new InvalidCommentError(check.comment),
                );
            }
        }

        // Must not contain multiple run_until locations in various files
        const newRunUntil = checksResult.value[0]?.location;
        if (runUntil && newRunUntil) {
            return invalidTest(
                `INVALID TEST SUITE [${relativeParentDirectoryPath}]`,
                new MultipleRunUntilLocationsError([runUntil, newRunUntil]),
            );
        }

        runUntil = newRunUntil;
    }

    return {
        testName: `[${relativeParentDirectoryPath}] should be generated correctly`,
        inputUris,
        actualOutputRoot,
        expectedOutputFiles,
        runUntil,
    };
};

const readExpectedOutputFiles = (expectedOutputRoot: string, actualOutputRoot: string): ExpectedOutputFile[] => {
    const relativeResourcePaths = listPythonResources_PathBased(expectedOutputRoot);
    const expectedOutputFiles: ExpectedOutputFile[] = [];

    for (const relativeResourcePath of relativeResourcePaths) {
        const absolutePath = resolvePathRelativeToResources_PathBased(path.join(expectedOutputRoot, relativeResourcePath));
        const code = fs.readFileSync(absolutePath).toString();
        expectedOutputFiles.push({
            absolutePath: path.join(actualOutputRoot, relativeResourcePath),
            content: code,
        });
    }

    return expectedOutputFiles;
};

/**
 * Report a test that has errors.
 *
 * @param testName The name of the test.
 * @param error The error that occurred.
 */
const invalidTest = (testName: string, error: Error): GenerationTest => {
    return {
        testName,
        inputUris: [],
        actualOutputRoot: '',
        expectedOutputFiles: [],
        error,
    };
};

/**
 * A description of a generation test.
 */
interface GenerationTest extends TestDescription {
    /**
     * The original code.
     */
    inputUris: string[];

    /**
     * The directory, where actual output files should be temporarily stored.
     */
    actualOutputRoot: string;

    /**
     * The expected generated code.
     */
    expectedOutputFiles: ExpectedOutputFile[];

    /**
     * Location after which execution should be stopped.
     */
    runUntil?: Location;
}

/**
 * A file containing the expected output.
 */
interface ExpectedOutputFile {
    /**
     * Absolute path to the output file.
     */
    absolutePath: string;

    /**
     * Content of the output file.
     */
    content: string;
}

/**
 * Found multiple test checks.
 */
class MultipleChecksError extends Error {
    constructor(readonly count: number) {
        super(`Found ${count} test checks (generation tests expect none or one).`);
    }
}

/**
 * A test comment did not match the expected format.
 */
class InvalidCommentError extends Error {
    constructor(readonly comment: string) {
        super(`Invalid test comment (valid values 'run_until'): ${comment}`);
    }
}

/**
 * Multiple files have a run_until locations.
 */
class MultipleRunUntilLocationsError extends Error {
    constructor(readonly locations: Location[]) {
        const locationsString = locations.map((it) => `\n    - ${locationToString(it)}`).join('');
        super(`Found multiple run_until locations:${locationsString}`);
    }
}
