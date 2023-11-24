import { describe, expect, it } from 'vitest';
import { parseHelper } from 'langium/test';
import { createSafeDsServicesWithBuiltins } from '../../../src/language/index.js';
import { SignatureHelp } from 'vscode-languageserver';
import { NodeFileSystem } from 'langium/node';
import { findTestRanges } from '../../helpers/testRanges.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const signatureHelpProvider = services.lsp.SignatureHelp!;
const parse = parseHelper(services);

describe('SafeDsSignatureHelpProvider', async () => {
    it('should always select the first signature', async () => {
        const code = `
            fun f(p: Int)

            pipeline myPipeline {
                f(»«);
            }
        `;

        const actualSignatureHelp = await getActualSignatureHelp(code);
        expect(actualSignatureHelp?.activeSignature).toBe(0);
    });

    it.each([
        {
            testName: 'empty argument list',
            code: `
                fun f(p: Int)

                pipeline myPipeline {
                    f(»«);
                }
            `,
            expectedIndex: 0,
        },
        {
            testName: 'before comma',
            code: `
                fun f(p: Int)

                pipeline myPipeline {
                    f(»«, );
                }
            `,
            expectedIndex: 0,
        },
        {
            testName: 'after comma',
            code: `
                fun f(p: Int)

                pipeline myPipeline {
                    f(1, »«);
                }
            `,
            expectedIndex: 1,
        },
    ])('should select the correct parameter ($testName)', async ({ code, expectedIndex }) => {
        const actualSignatureHelp = await getActualSignatureHelp(code);
        expect(actualSignatureHelp?.activeParameter).toBe(expectedIndex);
    });

    it.each([
        {
            testName: 'not in an abstract call',
            code: '»«',
            expectedSignature: undefined,
        },
        {
            testName: 'unresolved callable',
            code: `
                pipeline myPipeline {
                    f(»«);
                }
            `,
            expectedSignature: undefined,
        },
        {
            testName: 'annotation call',
            code: `
                /**
                 * Lorem ipsum.
                 */
                annotation A(p: Int)

                @A(»«)
                pipeline myPipeline {}
            `,
            expectedSignature: [
                {
                    label: 'A(p: Int) -> ()',
                    documentation: {
                        kind: 'markdown',
                        value: 'Lorem ipsum.',
                    },
                    parameters: [
                        {
                            label: 'p: Int',
                        },
                    ],
                },
            ],
        },
        {
            testName: 'call (class)',
            code: `
                /**
                 * Lorem ipsum.
                 */
                class C(p: Int)

                pipeline myPipeline {
                    C(»«);
                }
            `,
            expectedSignature: [
                {
                    label: 'C(p: Int)',
                    documentation: {
                        kind: 'markdown',
                        value: 'Lorem ipsum.',
                    },
                    parameters: [
                        {
                            label: 'p: Int',
                        },
                    ],
                },
            ],
        },
        {
            testName: 'call (function)',
            code: `
                /**
                 * Lorem ipsum.
                 */
                fun f(p: Int)

                pipeline myPipeline {
                    f(»«);
                }
            `,
            expectedSignature: [
                {
                    label: 'f(p: Int) -> ()',
                    documentation: {
                        kind: 'markdown',
                        value: 'Lorem ipsum.',
                    },
                    parameters: [
                        {
                            label: 'p: Int',
                        },
                    ],
                },
            ],
        },
        {
            testName: 'call (lambda)',
            code: `
                pipeline myPipeline {
                    ((p: Int) {})(»«);
                }
            `,
            expectedSignature: [
                {
                    label: '(p: Int) -> ()',
                    documentation: undefined,
                    parameters: [
                        {
                            label: 'p: Int',
                        },
                    ],
                },
            ],
        },
    ])('should assign the correct signature ($testName)', async ({ code, expectedSignature }) => {
        const actualSignatureHelp = await getActualSignatureHelp(code);
        expect(actualSignatureHelp?.signatures).toStrictEqual(expectedSignature);
    });
});

const getActualSignatureHelp = async (code: string): Promise<SignatureHelp | undefined> => {
    const document = await parse(code);
    const testRangesResult = findTestRanges(code, document.uri);
    if (testRangesResult.isErr) {
        throw new Error(testRangesResult.error.message);
    } else if (testRangesResult.value.length === 0) {
        throw new Error('No test ranges found.');
    }

    const position = testRangesResult.value[0]!.start;
    return signatureHelpProvider.provideSignatureHelp(document, {
        textDocument: document.textDocument,
        position,
    });
};
