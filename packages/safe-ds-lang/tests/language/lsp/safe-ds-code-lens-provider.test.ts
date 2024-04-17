import { createSafeDsServices } from '../../../src/language/index.js';
import { NodeFileSystem } from 'langium/node';
import { describe, expect, it } from 'vitest';
import { parseHelper } from 'langium/test';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const codeLensProvider = services.lsp.CodeLensProvider!;

describe('SafeDsCodeLensProvider', () => {
    const parse = parseHelper(services);

    describe('provideCodeLens', () => {
        const testCases: CodeLensProviderTest[] = [
            {
                testName: 'empty document',
                code: '',
                expectedCodeLensTitles: [],
            },
            {
                testName: 'empty pipeline',
                code: 'pipeline myPipeline {}',
                expectedCodeLensTitles: [],
            },
            {
                testName: 'pipeline with Int placeholder',
                code: `pipeline myPipeline {
                    val a = 1;
                }`,
                expectedCodeLensTitles: [],
            },
            {
                testName: 'pipeline with Table placeholder',
                code: `pipeline myPipeline {
                    val a = Table();
                }`,
                expectedCodeLensTitles: ['Explore a'],
            },
            {
                testName: 'block lambda with Table placeholder',
                code: `pipeline myPipeline {
                    () {
                        val a = Table();
                    };
                }`,
                expectedCodeLensTitles: [],
            },
            {
                testName: 'segment with Table placeholder',
                code: `segment mySegment {
                    val a = Table();
                }`,
                expectedCodeLensTitles: [],
            },
        ];

        it.each(testCases)('should compute code lenses ($testName)', async ({ code, expectedCodeLensTitles }) => {
            const document = await parse(code);
            services.runtime.Runner.isPythonServerAvailable = () => true;

            const actualCodeLenses = await codeLensProvider.provideCodeLens(document, {
                textDocument: { uri: document.uri.toString() },
            });
            const actualCodeLensTitles = actualCodeLenses?.map((codeLens) => codeLens.command?.title);

            expect(actualCodeLensTitles).toStrictEqual(expectedCodeLensTitles);
        });

        it('should return undefined if the Python server is not available', async () => {
            const document = await parse('');
            services.runtime.Runner.isPythonServerAvailable = () => false;
            const codeLenses = await codeLensProvider.provideCodeLens(document, {
                textDocument: { uri: document.uri.toString() },
            });
            expect(codeLenses).toBeUndefined();
        });
    });
});

/**
 * A test case for {@link SafeDsCodeLensProvider.provideCodeLens}.
 */
interface CodeLensProviderTest {
    /**
     * A short description of the test case.
     */
    testName: string;

    /**
     * The code to parse.
     */
    code: string;

    /**
     * The expected titles of code lenses.
     */
    expectedCodeLensTitles: string[];
}
