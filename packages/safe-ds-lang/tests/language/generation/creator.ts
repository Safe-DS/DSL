import {
    listTestFilesWithExtensions,
    listTestSafeDsFilesGroupedByParentDirectory,
    loadDocuments,
    uriToShortenedTestResourceName,
} from '../../helpers/testResources.js';
import path from 'path';
import fs from 'fs';
import { createSafeDsServices } from '../../../src/language/index.js';
import { ErrorsInCodeError, getErrorsAtURI } from '../../helpers/diagnostics.js';
import { findTestChecks } from '../../helpers/testChecks.js';
import { Location } from 'vscode-languageserver';
import { NodeFileSystem } from 'langium/node';
import { TestDescription, TestDescriptionError } from '../../helpers/testDescription.js';
import { locationToString } from '../../../src/helpers/locations.js';
import { URI } from 'langium';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
const rootResourceName = 'generation';
const withRunnerIntegration = 'with runner integration';

export const createGenerationTests = async (): Promise<GenerationTest[]> => {
    const filesGroupedByParentDirectory = listTestSafeDsFilesGroupedByParentDirectory(rootResourceName);
    const testCases = filesGroupedByParentDirectory.map((entry) => createGenerationTest(...entry));

    return Promise.all(testCases);
};

const createGenerationTest = async (parentDirectory: URI, inputUris: URI[]): Promise<GenerationTest> => {
    const outputRoot = URI.file(path.join(parentDirectory.fsPath, 'generated'));
    const expectedOutputFiles = readExpectedOutputFiles(outputRoot);
    let runUntil: Location | undefined;

    // Load all files, so they get linked
    await loadDocuments(services, inputUris, { validation: true });

    for (const uri of inputUris) {
        const code = services.shared.workspace.LangiumDocuments.getOrCreateDocument(uri).textDocument.getText();

        // File must not contain any errors
        const errors = getErrorsAtURI(services, uri);
        if (errors.length > 0) {
            return invalidTest('FILE', new ErrorsInCodeError(errors, uri));
        }

        const checksResult = findTestChecks(code, uri, { failIfFewerRangesThanComments: true });

        // Something went wrong when finding test checks
        if (checksResult.isErr) {
            return invalidTest('FILE', checksResult.error);
        }

        // Must contain at most one comment
        if (checksResult.value.length > 1) {
            return invalidTest('FILE', new MultipleChecksError(checksResult.value.length, uri));
        }

        // Comment must match the expected format
        if (checksResult.value.length === 1) {
            const check = checksResult.value[0]!;

            // Expected unresolved reference
            if (check.comment !== 'run_until') {
                return invalidTest('FILE', new InvalidCommentError(check.comment, uri));
            }
        }

        // Must not contain multiple run_until locations in various files
        const newRunUntil = checksResult.value[0]?.location;
        if (runUntil && newRunUntil) {
            return invalidTest('SUITE', new MultipleRunUntilLocationsError([runUntil, newRunUntil], parentDirectory));
        }

        runUntil = newRunUntil;
    }

    const shortenedResourceName = uriToShortenedTestResourceName(parentDirectory, rootResourceName);
    return {
        testName: `[${shortenedResourceName}]`,
        inputUris,
        outputRoot,
        expectedOutputFiles,
        runUntil,
        disableRunnerIntegration: !shortenedResourceName.startsWith(withRunnerIntegration),
    };
};

/**
 * Read all expected output files.
 *
 * @param outputRoot Where the actual output files are supposed to be located.
 */
const readExpectedOutputFiles = (outputRoot: URI): ExpectedOutputFile[] => {
    return listTestFilesWithExtensions(uriToShortenedTestResourceName(outputRoot), ['py', 'map'])
        .sort((a, b) => {
            // List .py files first, so they get compared first
            if (a.fsPath.endsWith('.map') && b.fsPath.endsWith('.py')) {
                return 1;
            }

            return -1;
        })
        .map((uri) => {
            return {
                uri,
                code: fs.readFileSync(uri.fsPath).toString(),
            };
        });
};

/**
 * Report a test that has errors.
 *
 * @param level Whether a test file or a test suite is invalid.
 * @param error The error that occurred.
 */
const invalidTest = (level: 'FILE' | 'SUITE', error: TestDescriptionError): GenerationTest => {
    const shortenedResourceName = uriToShortenedTestResourceName(error.uri, rootResourceName);
    const testName = `INVALID TEST ${level} [${shortenedResourceName}]`;
    return {
        testName,
        inputUris: [],
        outputRoot: URI.file(''),
        expectedOutputFiles: [],
        error,
        disableRunnerIntegration: false,
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
     * The directory, where output files are located.
     */
    outputRoot: URI;

    /**
     * The expected generated code.
     */
    expectedOutputFiles: ExpectedOutputFile[];

    /**
     * Location after which execution should be stopped.
     */
    runUntil?: Location;

    /**
     * Whether the test should run with runner integration (memoization & placeholder saving) disabled
     */
    disableRunnerIntegration: boolean;
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
class MultipleChecksError extends TestDescriptionError {
    constructor(
        readonly count: number,
        uri: URI,
    ) {
        super(`Found ${count} test checks (generation tests expect none or one).`, uri);
    }
}

/**
 * A test comment did not match the expected format.
 */
class InvalidCommentError extends TestDescriptionError {
    constructor(
        readonly comment: string,
        uri: URI,
    ) {
        super(`Invalid test comment (valid values 'run_until'): ${comment}`, uri);
    }
}

/**
 * Multiple files have a run_until locations.
 */
class MultipleRunUntilLocationsError extends TestDescriptionError {
    constructor(
        readonly locations: Location[],
        uri: URI,
    ) {
        const locationsString = locations.map((it) => `\n    - ${locationToString(it)}`).join('');
        super(`Found multiple run_until locations:${locationsString}`, uri);
    }
}
