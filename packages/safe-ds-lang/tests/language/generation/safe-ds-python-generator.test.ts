import { createSafeDsServicesWithBuiltins } from '../../../src/language/index.js';
import { describe, expect, it } from 'vitest';
import { NodeFileSystem } from 'langium/node';
import { createGenerationTests } from './creator.js';
import { loadDocuments } from '../../helpers/testResources.js';
import { stream, URI } from 'langium';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const pythonGenerator = services.generation.PythonGenerator;
const generationTests = createGenerationTests();

describe('generation', async () => {
    it.each(await generationTests)('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Load all documents
        const documents = await loadDocuments(services, test.inputUris);

        // Get target placeholder name for "run until"
        let runUntilPlaceholderName: string | undefined = undefined;

        if (test.runUntil) {
            const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(
                URI.parse(test.runUntil.uri),
            );
            runUntilPlaceholderName = document.textDocument.getText(test.runUntil.range);
        }

        // Generate code for all documents
        const actualOutputs = stream(documents)
            .flatMap((document) =>
                pythonGenerator.generate(document, {
                    destination: test.actualOutputRoot,
                    createSourceMaps: true,
                    targetPlaceholder: runUntilPlaceholderName,
                    disableRunnerIntegration: test.testName.startsWith('[eject'), // Tests in the "eject" suite are tested with disabled runner integration
                }),
            )
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
