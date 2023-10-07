import {
    listPythonFiles,
    listSafeDsFilesGroupedByParentDirectory,
    uriToShortenedResourceName,
} from '../../helpers/testResources.js';
import path from 'path';
import fs from 'fs';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { ErrorsInCodeError, getErrors } from '../../helpers/diagnostics.js';
import { findTestChecks } from '../../helpers/testChecks.js';
import { Location } from 'vscode-languageserver';
import { NodeFileSystem } from 'langium/node';
import { TestDescription } from '../../helpers/testDescription.js';
import { locationToString } from '../../helpers/location.js';
import { URI } from 'langium';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
const rootResourceName = 'generation';

export const createGenerationTests = async (): Promise<GenerationTest[]> => {
    const filesGroupedByParentDirectory = listSafeDsFilesGroupedByParentDirectory(rootResourceName);
    const testCases = filesGroupedByParentDirectory.map((entry) => createGenerationTest(...entry));

    return Promise.all(testCases);
};

const createGenerationTest = async (parentDirectory: URI, inputUris: URI[]): Promise<GenerationTest> => {
    const expectedOutputRoot = URI.file(path.join(parentDirectory.fsPath, 'output'));
    const actualOutputRoot = URI.file(path.join(parentDirectory.fsPath, 'generated'));
    const expectedOutputFiles = readExpectedOutputFiles(expectedOutputRoot, actualOutputRoot);
    let runUntil: Location | undefined;

    for (const uri of inputUris) {
        const code = fs.readFileSync(uri.fsPath).toString();

        // File must not contain any errors
        const errors = await getErrors(services, code);
        if (errors.length > 0) {
            return invalidTest('FILE', uri, new ErrorsInCodeError(errors));
        }

        const checksResult = findTestChecks(code, uri, { failIfFewerRangesThanComments: true });

        // Something went wrong when finding test checks
        if (checksResult.isErr) {
            return invalidTest('FILE', uri, checksResult.error);
        }

        // Must contain at most one comment
        if (checksResult.value.length > 1) {
            return invalidTest('FILE', uri, new MultipleChecksError(checksResult.value.length));
        }

        // Comment must match the expected format
        if (checksResult.value.length === 1) {
            const check = checksResult.value[0];

            // Expected unresolved reference
            if (check.comment !== 'run_until') {
                return invalidTest('FILE', uri, new InvalidCommentError(check.comment));
            }
        }

        // Must not contain multiple run_until locations in various files
        const newRunUntil = checksResult.value[0]?.location;
        if (runUntil && newRunUntil) {
            return invalidTest('SUITE', parentDirectory, new MultipleRunUntilLocationsError([runUntil, newRunUntil]));
        }

        runUntil = newRunUntil;
    }

    const shortenedResourceName = uriToShortenedResourceName(parentDirectory, rootResourceName);
    return {
        testName: `[${shortenedResourceName}] should be generated correctly`,
        inputUris,
        actualOutputRoot,
        expectedOutputFiles,
        runUntil,
    };
};

/**
 * Read all expected output files.
 *
 * @param expectedOutputRoot Where the expected output files are located.
 * @param actualOutputRoot Where the actual output files supposed to be located.
 */
const readExpectedOutputFiles = (expectedOutputRoot: URI, actualOutputRoot: URI): ExpectedOutputFile[] => {
    return listPythonFiles(uriToShortenedResourceName(expectedOutputRoot)).map((uri) => {
        return {
            uri: URI.file(path.join(actualOutputRoot.fsPath, path.relative(expectedOutputRoot.fsPath, uri.fsPath))),
            code: fs.readFileSync(uri.fsPath).toString(),
        };
    });
};

/**
 * Report a test that has errors.
 *
 * @param level Whether a test file or a test suite is invalid.
 * @param uri The URI of the test file or test suite.
 * @param error The error that occurred.
 */
const invalidTest = (level: 'FILE' | 'SUITE', uri: URI, error: Error): GenerationTest => {
    const shortenedResourceName = uriToShortenedResourceName(uri, rootResourceName);
    const testName = `INVALID TEST ${level} [${shortenedResourceName}]`;
    return {
        testName,
        inputUris: [],
        actualOutputRoot: URI.file(''),
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
    inputUris: URI[];

    /**
     * The directory, where actual output files should be temporarily stored.
     */
    actualOutputRoot: URI;

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
     * URI of the output file.
     */
    uri: URI;

    /**
     * Content of the output file.
     */
    code: string;
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
