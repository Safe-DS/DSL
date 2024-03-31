import {
    listTestFilesWithExtensions,
    listTestSafeDsFilesGroupedByParentDirectory,
    loadDocuments,
    uriToShortenedTestResourceName,
} from '../../../helpers/testResources.js';
import path from 'path';
import { ErrorsInCodeError, getErrorsAtURI } from '../../../helpers/diagnostics.js';
import { NodeFileSystem } from 'langium/node';
import { TestDescription, TestDescriptionError } from '../../../helpers/testDescription.js';
import { URI } from 'langium';
import { createSafeDsServices } from '../../../../src/language/index.js';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;

const rootResourceName = 'generation/markdown';

export const createMarkdownGenerationTests = async (): Promise<MarkdownGenerationTest[]> => {
    const filesGroupedByParentDirectory = listTestSafeDsFilesGroupedByParentDirectory(rootResourceName);
    const testCases = filesGroupedByParentDirectory.map((entry) => createMarkdownGenerationTest(...entry));

    return Promise.all(testCases);
};

const createMarkdownGenerationTest = async (
    parentDirectory: URI,
    inputUris: URI[],
): Promise<MarkdownGenerationTest> => {
    const outputRoot = URI.file(path.join(parentDirectory.fsPath, 'generated'));
    const expectedOutputUris = listExpectedOutputFiles(outputRoot);

    // Load all files, so they get linked
    await loadDocuments(services, inputUris, { validation: true });

    for (const uri of inputUris) {
        // File must not contain any errors
        const errors = getErrorsAtURI(services, uri);
        if (errors.length > 0) {
            return invalidTest('FILE', new ErrorsInCodeError(errors, uri));
        }
    }

    const shortenedResourceName = uriToShortenedTestResourceName(parentDirectory, rootResourceName);
    return {
        testName: `[${shortenedResourceName}]`,
        inputUris,
        outputRoot,
        expectedOutputUris,
    };
};

/**
 * List all expected output files.
 *
 * @param outputRoot The directory, where output files are located.
 */
const listExpectedOutputFiles = (outputRoot: URI): URI[] => {
    return listTestFilesWithExtensions(uriToShortenedTestResourceName(outputRoot), ['md']);
};

/**
 * Report a test that has errors.
 *
 * @param level Whether a test file or a test suite is invalid.
 * @param error The error that occurred.
 */
const invalidTest = (level: 'FILE' | 'SUITE', error: TestDescriptionError): MarkdownGenerationTest => {
    const shortenedResourceName = uriToShortenedTestResourceName(error.uri, rootResourceName);
    const testName = `INVALID TEST ${level} [${shortenedResourceName}]`;
    return {
        testName,
        inputUris: [],
        outputRoot: URI.file(''),
        expectedOutputUris: [],
        error,
    };
};

/**
 * A description of a generation test.
 */
interface MarkdownGenerationTest extends TestDescription {
    /**
     * The original code.
     */
    inputUris: URI[];

    /**
     * The directory, where output files are located.
     */
    outputRoot: URI;

    /**
     * The expected output files.
     */
    expectedOutputUris: URI[];
}
