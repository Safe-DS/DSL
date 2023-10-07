import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { clearDocuments } from 'langium/test';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { URI } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { createGenerationTests } from './creator.js';
import { SdsModule } from '../../../src/language/generated/ast.js';
import { generatePython } from '../../../src/cli/generator.js';
import fs from 'fs';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
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
        const documents = test.inputUris.map((uri) =>
            services.shared.workspace.LangiumDocuments.getOrCreateDocument(URI.parse(uri)),
        );
        await services.shared.workspace.DocumentBuilder.build(documents);

        // Generate code for all documents
        const actualOutputPaths: string[] = [];

        for (const document of documents) {
            const module = document.parseResult.value as SdsModule;
            const fileName = document.uri.fsPath;
            const generatedFilePaths = generatePython(module, fileName, test.actualOutputRoot);
            actualOutputPaths.push(...generatedFilePaths);
        }

        // File paths must match
        const expectedOutputPaths = test.expectedOutputFiles.map((file) => file.absolutePath).sort();
        expect(actualOutputPaths.sort()).toStrictEqual(expectedOutputPaths);

        // File contents must match
        for (const expectedOutputFile of test.expectedOutputFiles) {
            const actualCode = fs.readFileSync(expectedOutputFile.absolutePath).toString();
            expect(actualCode).toBe(expectedOutputFile.content);
        }

        // Remove generated files (if the test fails, the files are kept for debugging)
        fs.rmSync(test.actualOutputRoot, { recursive: true, force: true });
    });
});
