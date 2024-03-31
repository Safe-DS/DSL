import { describe, expect, it } from 'vitest';
import { NodeFileSystem } from 'langium/node';
import { createMarkdownGenerationTests } from './creator.js';
import { loadDocuments } from '../../../helpers/testResources.js';
import { URI } from 'langium';
import { createSafeDsServices } from '../../../../src/language/index.js';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const markdownGenerator = services.generation.MarkdownGenerator;

const generationTests = createMarkdownGenerationTests();

describe('generation', async () => {
    it.each(await generationTests)('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Load all documents
        const documents = await loadDocuments(services, test.inputUris);

        // Generate code for all documents
        const actualOutputs = new Map(
            markdownGenerator
                .generate(documents, {
                    destination: test.outputRoot,
                })
                .map((textDocument) => [textDocument.uri, textDocument.getText()]),
        );

        // File contents must match
        for (const [uriString, code] of actualOutputs) {
            const fsPath = URI.parse(uriString).fsPath;
            await expect(code).toMatchFileSnapshot(fsPath);
        }

        // File paths must match
        const actualOutputPaths = Array.from(actualOutputs.keys()).sort();
        const expectedOutputPaths = test.expectedOutputUris.map((uri) => uri.toString()).sort();
        expect(actualOutputPaths).toStrictEqual(expectedOutputPaths);
    });
});
