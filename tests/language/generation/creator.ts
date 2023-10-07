import {
    listPythonResources,
    listTestsResourcesGroupedByParentDirectory,
    resolvePathRelativeToResources,
} from '../../helpers/testResources.js';
import path from 'path';
import fs from 'fs';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { EmptyFileSystem } from 'langium';
import { ErrorsInCodeError, getErrors } from '../../helpers/diagnostics.js';
import { URI } from 'vscode-uri';
import { findTestChecks } from '../../helpers/testChecks.js';
import { Location } from 'vscode-languageserver';
import { NodeFileSystem } from 'langium/node';

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
    const outputFiles = readOutputFiles(path.join(root, relativeParentDirectoryPath, 'output'));
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
        outputFiles,
        outputRoot: resolvePathRelativeToResources(path.join(root, relativeParentDirectoryPath)),
    };
};

const readOutputFiles = (rootDirectory: string): OutputFile[] => {
    const pythonFiles = listPythonResources(rootDirectory);
    const outputFiles: OutputFile[] = [];
    for (const outputFile of pythonFiles) {
        const absolutePath = resolvePathRelativeToResources(path.join(rootDirectory, outputFile));
        const code = fs.readFileSync(absolutePath).toString();
        outputFiles.push({
            uri: URI.file(absolutePath).toString(),
            path: outputFile,
            content: code,
        });
    }
    return outputFiles;
};

/**
 * Report a test that has errors.
 *
 * @param pathRelativeToResources The path to the test file relative to the resources directory.
 * @param error The error that occurred.
 */
const invalidTest = (pathRelativeToResources: string, error: Error): GenerationTest => {
    return {
        testName: `INVALID TEST FILE [${pathRelativeToResources}]`,
        inputUris: [],
        outputFiles: [],
        outputRoot: pathRelativeToResources,
        error,
    };
};

/**
 * A description of a generation test.
 */
interface GenerationTest {
    /**
     * The name of the test.
     */
    testName: string;

    /**
     * The original code.
     */
    inputUris: string[];

    /**
     * Placeholder until the program should be run.
     */
    runUntil?: Location;

    /**
     * The expected generated code.
     */
    outputFiles: OutputFile[];

    /**
     * The directory, where output files should be temporarily stored
     */
    outputRoot: string;

    /**
     * An error that occurred while creating the test. If this is undefined, the test is valid.
     */
    error?: Error;
}

/**
 * A file containing the expected output
 */
interface OutputFile {
    /**
     * Path to the output file.
     */
    path: string;

    /**
     * URI pointing to the output file.
     */
    uri: string;

    /**
     * Content of the output file.
     */
    content: string;
}
