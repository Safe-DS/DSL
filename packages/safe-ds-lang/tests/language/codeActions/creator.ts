import {
    listTestFilesWithExtensions,
    listTestSafeDsFilesGroupedByParentDirectory,
    loadDocuments,
    uriToShortenedTestResourceName,
} from '../../helpers/testResources.js';
import path from 'path';
import { getSyntaxErrors, SyntaxErrorsInCodeError } from '../../helpers/diagnostics.js';
import { NodeFileSystem } from 'langium/node';
import { TestDescription, TestDescriptionError } from '../../helpers/testDescription.js';
import { URI } from 'langium';
import { createSafeDsServices } from '../../../src/language/index.js';
import { findTestComments } from '../../helpers/testComments.js';
import { SAFE_DS_FILE_EXTENSIONS } from '../../../src/language/helpers/fileExtensions.js';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const langiumDocuments = services.shared.workspace.LangiumDocuments;

const rootResourceName = 'code actions';
const commentRegex = /\s*apply\s*(?<titleIsRegex>r)?"(?<title>.*)"/gu;

export const createCodeActionsTests = async (): Promise<CodeActionsTest[]> => {
    const filesGroupedByParentDirectory = listTestSafeDsFilesGroupedByParentDirectory(rootResourceName);
    const testCases = filesGroupedByParentDirectory.map((entry) => createCodeActionsTest(...entry));

    return Promise.all(testCases);
};

const createCodeActionsTest = async (parentDirectory: URI, inputUris: URI[]): Promise<CodeActionsTest> => {
    const outputRoot = URI.file(path.join(parentDirectory.fsPath, 'skip-output'));
    const expectedOutputUris = listExpectedOutputFiles(outputRoot);
    const inputs: CodeActionsInput[] = [];

    // Load all files, so they get linked
    await loadDocuments(services, inputUris, { validation: true });

    for (const uri of inputUris) {
        const document = langiumDocuments.getDocument(uri)!;
        const code = document.textDocument.getText();

        // File must not contain syntax errors
        const syntaxErrors = await getSyntaxErrors(services, code);
        if (syntaxErrors.length > 0) {
            return invalidTest('FILE', new SyntaxErrorsInCodeError(syntaxErrors, uri));
        }

        const testComments = findTestComments(code);
        const codeActionTitles: (string | RegExp)[] = [];

        for (const comment of testComments) {
            const match = commentRegex.exec(comment);

            // Comment must match the expected format
            if (!match) {
                return invalidTest('FILE', new InvalidCommentError(comment, uri));
            }

            const title = match.groups!.title!;
            const titleIsRegex = match.groups!.titleIsRegex === 'r';

            codeActionTitles.push(titleIsRegex ? new RegExp(title, 'gu') : title);
        }

        inputs.push({ uri, codeActionTitles });
    }

    const shortenedResourceName = uriToShortenedTestResourceName(parentDirectory, rootResourceName);
    return {
        testName: `[${shortenedResourceName}]`,
        inputs,
        inputRoot: parentDirectory,
        expectedOutputUris,
        outputRoot,
    };
};

/**
 * List all expected output files.
 *
 * @param outputRoot The directory, where output files are located.
 */
const listExpectedOutputFiles = (outputRoot: URI): URI[] => {
    return listTestFilesWithExtensions(uriToShortenedTestResourceName(outputRoot), SAFE_DS_FILE_EXTENSIONS);
};

/**
 * Report a test that has errors.
 *
 * @param level Whether a test file or a test suite is invalid.
 * @param error The error that occurred.
 */
const invalidTest = (level: 'FILE' | 'SUITE', error: TestDescriptionError): CodeActionsTest => {
    const shortenedResourceName = uriToShortenedTestResourceName(error.uri, rootResourceName);
    const testName = `INVALID TEST ${level} [${shortenedResourceName}]`;
    return {
        testName,
        inputs: [],
        inputRoot: URI.file(''),
        expectedOutputUris: [],
        outputRoot: URI.file(''),
        error,
    };
};

/**
 * A description of a code actions test.
 */
interface CodeActionsTest extends TestDescription {
    /**
     * The original code.
     */
    inputs: CodeActionsInput[];

    /**
     * The directory, where input files are located.
     */
    inputRoot: URI;

    /**
     * The expected output files.
     */
    expectedOutputUris: URI[];

    /**
     * The directory, where output files are located.
     */
    outputRoot: URI;
}

/**
 * A description of the input for code actions.
 */
interface CodeActionsInput {
    /**
     * The URI of the file.
     */
    uri: URI;

    /**
     * The titles of the code actions that should be applied. Strings must match exactly, regular expressions must match
     * the entire string.
     */
    codeActionTitles: (string | RegExp)[];
}

/**
 * A test comment did not match the expected format.
 */
class InvalidCommentError extends TestDescriptionError {
    constructor(
        readonly comment: string,
        uri: URI,
    ) {
        super(`Invalid test comment (refer to the documentation for guidance): ${comment}`, uri);
    }
}
