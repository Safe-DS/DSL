import { describe, expect, it } from 'vitest';
import { NodeFileSystem } from 'langium/node';
import { createPythonGenerationTests } from './creator.js';
import { loadDocuments } from '../../../helpers/testResources.js';
import { AstUtils, stream, URI } from 'langium';
import { createSafeDsServices } from '../../../../src/language/index.js';
import { isEmpty } from '../../../../src/helpers/collections.js';
import { isSdsStatement } from '../../../../src/language/generated/ast.js';
import { isRangeEqual } from 'langium/test';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const langiumDocuments = services.shared.workspace.LangiumDocuments;
const pythonGenerator = services.generation.PythonGenerator;

const generationTests = createPythonGenerationTests();

describe('generation', async () => {
    it.each(await generationTests)('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Load all documents
        const documents = await loadDocuments(services, test.inputUris);

        // Get target statements for "run until"
        let targetStatements: number[] | undefined = undefined;
        if (test.targets && !isEmpty(test.targets)) {
            const document = langiumDocuments.getDocument(URI.parse(test.targets[0]!.uri))!;

            targetStatements = test.targets.flatMap((target) => {
                const statements = AstUtils.streamAllContents(document.parseResult.value, {
                    range: target.range,
                }).filter(isSdsStatement);

                for (const statement of statements) {
                    if (isRangeEqual(statement.$cstNode!.range, target.range)) {
                        return statement.$containerIndex!;
                    }
                }

                return [];
            });
        }

        // Generate code for all documents
        const actualOutputs: Map<string, string> = stream(documents)
            .flatMap((document) =>
                pythonGenerator.generate(document, {
                    destination: test.outputRoot,
                    createSourceMaps: true,
                    targetStatements,
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
