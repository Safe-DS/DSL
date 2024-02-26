import { createSafeDsServicesWithBuiltins } from '../../../src/language/index.js';
import { describe, expect, it } from 'vitest';
import { NodeFileSystem } from 'langium/node';
import { createGenerationTests } from './creator.js';
import { loadDocuments } from '../../helpers/testResources.js';
import { stream, URI } from 'langium';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const langiumDocuments = services.shared.workspace.LangiumDocuments;
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
            const document = langiumDocuments.getDocument(URI.parse(test.runUntil.uri))!;
            runUntilPlaceholderName = document.textDocument.getText(test.runUntil.range);
        }

        // Generate code for all documents
        const actualOutputs: Map<string, string> = stream(documents)
            .flatMap((document) =>
                pythonGenerator.generate(document, {
                    destination: test.outputRoot,
                    createSourceMaps: true,
                    targetPlaceholder: runUntilPlaceholderName,
                    disableRunnerIntegration: test.disableRunnerIntegration,
                }),
            )
            .map((textDocument) => [textDocument.uri, textDocument.getText()])
            .toMap(
                (entry) => entry[0]!,
                (entry) => entry[1]!,
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
