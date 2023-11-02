import { createSafeDsServices } from '../../../src/language/index.js';
import { clearDocuments } from 'langium/test';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NodeFileSystem } from 'langium/node';
import { createGenerationTests } from './creator.js';
import { loadDocuments } from '../../helpers/testResources.js';
import { stream } from 'langium';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
const pythonGenerator = services.generation.PythonGenerator;
const generationTests = createGenerationTests();

describe('generation', async () => {
    beforeEach(async () => {
        // Load the builtin library
        await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
    });

    afterEach(async () => {
        await clearDocuments(services);
    });

    it.each(await generationTests)('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Load all documents
        const documents = await loadDocuments(services, test.inputUris);

        // Generate code for all documents
        const actualOutputs = stream(documents)
            .flatMap((document) => pythonGenerator.generate(document, test.actualOutputRoot, true))
            .map((textDocument) => [textDocument.uri, textDocument.getText()])
            .toMap(
                (entry) => entry[0],
                (entry) => entry[1],
            );

        // File paths must match
        const actualOutputPaths = Array.from(actualOutputs.keys()).sort();
        const expectedOutputPaths = test.expectedOutputFiles.map((file) => file.uri.toString()).sort();
        expect(actualOutputPaths).toStrictEqual(expectedOutputPaths);

        // File contents must match
        for (const expectedOutputFile of test.expectedOutputFiles) {
            const actualCode = actualOutputs.get(expectedOutputFile.uri.toString());
            expect(actualCode).toBe(expectedOutputFile.code);
        }
    });
});
