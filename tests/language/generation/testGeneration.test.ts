import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { clearDocuments } from 'langium/test';
import { afterEach, describe, expect, it } from 'vitest';
import { URI } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { createGenerationTests } from './creator.js';
import { extractAstNode } from '../../../src/cli/cli-util.js';
import { SdsModule } from '../../../src/language/generated/ast.js';
import { generatePython } from '../../../src/cli/generator.js';
import path from 'path';
import fs from 'fs';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
const generationTests = createGenerationTests();

describe('generation', async () => {
    afterEach(async () => {
        await clearDocuments(services);
    });

    // Test that the original code is generated correctly
    it.each(await generationTests)('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }
        const actualOutputPaths: string[] = [];
        const outputRoot = path.join(test.outputRoot, 'generated');
        for (const inputUri of test.inputUris) {
            const fileName = URI.parse(inputUri).fsPath;
            const module = await extractAstNode<SdsModule>(fileName, services);
            const generatedFilePaths = generatePython(module, fileName, outputRoot);
            actualOutputPaths.push(...generatedFilePaths);
        }
        const expectedOutputPaths = test.outputFiles.map((file) => file.path).sort();
        expect(actualOutputPaths.sort()).equals(expectedOutputPaths);

        for (const expectedOutput of test.outputFiles) {
            const actualOutputPath = path.join(outputRoot, expectedOutput.path);
            const actualCode = fs.readFileSync(actualOutputPath).toString();
            expect(actualCode).equals(expectedOutput.content);
        }
    });
});
