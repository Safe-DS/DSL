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
                expectedCodeLensTitles: ['Run myPipeline'],
            },
            {
                testName: 'pipeline with null placeholder',
                code: `
                    pipeline myPipeline {
                        val a = null;
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline', 'Print a'],
            },
            {
                testName: 'pipeline with Image placeholder',
                code: `
                    pipeline myPipeline {
                        val a = Image.fromFile("test.png");
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline', 'Show a'],
            },
            {
                testName: 'block lambda with Image placeholder',
                code: `
                    pipeline myPipeline {
                        () {
                            val a = Image.fromFile("test.png");
                        };
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline'],
            },
            {
                testName: 'segment with Image placeholder',
                code: `
                    segment mySegment {
                        val a = Image.fromFile("test.png");
                    }
                `,
                expectedCodeLensTitles: [],
            },
            {
                testName: 'pipeline with Table placeholder',
                code: `
                    pipeline myPipeline {
                        val a = Table();
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline', 'Explore a'],
            },
            {
                testName: 'block lambda with Table placeholder',
                code: `
                    pipeline myPipeline {
                        () {
                            val a = Table();
                        };
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline'],
            },
            {
                testName: 'segment with Table placeholder',
                code: `
                    segment mySegment {
                        val a = Table();
                    }
                `,
                expectedCodeLensTitles: [],
            },
            {
                testName: 'pipeline with printable placeholder',
                code: `
                    pipeline myPipeline {
                        val a = 1;
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline', 'Print a'],
            },
            {
                testName: 'block lambda with printable placeholder',
                code: `
                    pipeline myPipeline {
                        () {
                            val a = 1;
                        };
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline'],
            },
            {
                testName: 'segment with printable placeholder',
                code: `
                    segment mySegment {
                        val a = 1;
                    }
                `,
                expectedCodeLensTitles: [],
            },
            {
                testName: 'multiple placeholders in one assignment',
                code: `
                    @Pure fun f() -> (a: Int, b: Int)

                    pipeline myPipeline {
                        val x, val y = f();
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline', 'Print x', 'Print y'],
            },
            {
                testName: 'pipeline with null output',
                code: `
                    pipeline myPipeline {
                        out null;
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline', 'Print expression'],
            },
            {
                testName: 'pipeline with Image output',
                code: `
                    pipeline myPipeline {
                        out Image.fromFile("test.png");
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline', 'Show image'],
            },
            {
                testName: 'block lambda with Image output',
                code: `
                    pipeline myPipeline {
                        () {
                            out Image.fromFile("test.png");
                        };
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline'],
            },
            {
                testName: 'segment with Image output',
                code: `
                    segment mySegment {
                        out Image.fromFile("test.png");
                    }
                `,
                expectedCodeLensTitles: [],
            },
            {
                testName: 'pipeline with Table output',
                code: `
                    pipeline myPipeline {
                        out Table();
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline', 'Explore Table instance'],
            },
            {
                testName: 'block lambda with Table output',
                code: `
                    pipeline myPipeline {
                        () {
                            out Table();
                        };
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline'],
            },
            {
                testName: 'segment with Table output',
                code: `
                    segment mySegment {
                        out Table();
                    }
                `,
                expectedCodeLensTitles: [],
            },
            {
                testName: 'pipeline with printable output',
                code: `
                    pipeline myPipeline {
                        out 1;
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline', 'Print expression'],
            },
            {
                testName: 'block lambda with printable output',
                code: `
                    pipeline myPipeline {
                        () {
                            out 1;
                        };
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline'],
            },
            {
                testName: 'segment with printable output',
                code: `
                    segment mySegment {
                        out 1;
                    }
                `,
                expectedCodeLensTitles: [],
            },
            {
                testName: 'multiple values in one output statement',
                code: `
                    @Pure fun f() -> (a: Int, b: Int)

                    pipeline myPipeline {
                        out f();
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline', 'Print a', 'Print b'],
            },
            {
                testName: 'member access in output statement',
                code: `
                    pipeline myPipeline {
                        out Table().rowCount;
                    }
                `,
                expectedCodeLensTitles: ['Run myPipeline', 'Print rowCount'],
            },
        ];

        it.each(testCases)('should compute code lenses ($testName)', async ({ code, expectedCodeLensTitles }) => {
            const document = await parse(code);
            services.runtime.Runner.isReady = () => true;

            const actualCodeLenses = await codeLensProvider.provideCodeLens(document, {
                textDocument: { uri: document.uri.toString() },
            });
            const actualCodeLensTitles = actualCodeLenses?.map((codeLens) => codeLens.command?.title);

            expect(actualCodeLensTitles).toStrictEqual(expectedCodeLensTitles);
        });

        it('should return undefined if the Python server is not available', async () => {
            const document = await parse('');
            services.runtime.Runner.isReady = () => false;
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
