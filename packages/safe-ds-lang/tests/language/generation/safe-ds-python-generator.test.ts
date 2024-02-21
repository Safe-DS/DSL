import { createSafeDsServicesWithBuiltins } from '../../../src/language/index.js';
import { describe, expect, it } from 'vitest';
import { NodeFileSystem } from 'langium/node';
import { createGenerationTests } from './creator.js';
import { loadDocuments } from '../../helpers/testResources.js';
import { stream, URI } from 'langium';
import { normalizeLineBreaks } from '../../../src/helpers/strings.js';
import { fail } from 'node:assert';
import path from 'path';
import fs from 'fs/promises';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const pythonGenerator = services.generation.PythonGenerator;
const generationTests = createGenerationTests();

/**
 * Set this to `true` and run the tests to update the expected output files. Don't forget to set it back to false
 * afterward.
 */
const updateSnapshots = false;

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
        const actualOutputs: Map<string, string> = stream(documents)
            .flatMap((document) =>
                pythonGenerator.generate(document, {
                    destination: test.actualOutputRoot,
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

        if (updateSnapshots) {
            // Clear all actual outputs
            await fs.rm(test.outputRoot.fsPath, { recursive: true, force: true });

            // Write actual output files
            for (const [uriString, code] of actualOutputs) {
                const filePath = URI.parse(uriString).fsPath;
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, code);
            }

            fail('Snapshots updated. Set `updateSnapshots` to `false`, then run the tests again.');
        } else {
            // File paths must match
            const actualOutputPaths = Array.from(actualOutputs.keys()).sort();
            const expectedOutputPaths = test.expectedOutputFiles.map((file) => file.uri.toString()).sort();
            expect(actualOutputPaths).toStrictEqual(expectedOutputPaths);

            // File contents must match (ignoring line breaks)
            for (const expectedOutputFile of test.expectedOutputFiles) {
                const expectedCode = normalizeLineBreaks(expectedOutputFile.code);
                const actualCode = normalizeLineBreaks(actualOutputs.get(expectedOutputFile.uri.toString()));

                expect(actualCode).toBe(expectedCode);
            }
        }
    });
});
