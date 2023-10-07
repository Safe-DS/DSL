import {
    listPythonResources,
    listTestsResourcesGroupedByParentDirectory,
    resolvePathRelativeToResources,
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

const services = createSafeDsServices(NodeFileSystem).SafeDs;
await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
const root = 'generation';

export const createGenerationTests = async (): Promise<GenerationTest[]> => {
    const pathsGroupedByParentDirectory = listTestsResourcesGroupedByParentDirectory(root);
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
    const expectedOutputRoot = path.join(root, relativeParentDirectoryPath, 'output')
    const actualOutputRoot = resolvePathRelativeToResources(path.join(root, relativeParentDirectoryPath, 'generated'));
    const expectedOutputFiles = readOutputFiles(expectedOutputRoot, actualOutputRoot);

    for (const relativeResourcePath of relativeResourcePaths) {
        const absolutePath = resolvePathRelativeToResources(path.join(root, relativeResourcePath));
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
    }

    return {
        testName: `[${relativeParentDirectoryPath}] should be generated correctly`,
        inputUris,
        expectedOutputFiles,
        actualOutputRoot,
    };
};

const readOutputFiles = (expectedOutputRoot: string, actualOutputRoot: string): ExpectedOutputFile[] => {
    const relativeResourcePaths = listPythonResources(expectedOutputRoot);
    const outputFiles: ExpectedOutputFile[] = [];

    for (const relativeResourcePath of relativeResourcePaths) {
        const absolutePath = resolvePathRelativeToResources(path.join(expectedOutputRoot, relativeResourcePath));
        const code = fs.readFileSync(absolutePath).toString();
        outputFiles.push({
            absolutePath: path.join(actualOutputRoot, relativeResourcePath),
            content: code,
        });
    }

    return outputFiles;
};

/**
 * Report a test that has errors.
 *
 * @param pathRelativeToResources The path to the test file relative to the `resources` directory.
 * @param error The error that occurred.
 */
const invalidTest = (pathRelativeToResources: string, error: Error): GenerationTest => {
    return {
        testName: `INVALID TEST FILE [${pathRelativeToResources}]`,
        inputUris: [],
        expectedOutputFiles: [],
        actualOutputRoot: '',
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
     * Location after which execution should be stopped.
     */
    runUntil?: Location;

    /**
     * The expected generated code.
     */
    expectedOutputFiles: ExpectedOutputFile[];

    /**
     * The directory, where actual output files should be temporarily stored.
     */
    actualOutputRoot: string;
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
