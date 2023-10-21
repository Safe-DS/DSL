import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearDocuments, parseDocument, textDocumentParams } from 'langium/test';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { DocumentSymbol, SymbolKind, SymbolTag } from 'vscode-languageserver';
import { NodeFileSystem } from 'langium/node';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
const symbolProvider = services.lsp.DocumentSymbolProvider!;

describe('SafeDsSemanticTokenProvider', async () => {
    beforeEach(async () => {
        // Load the builtin library
        await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
    });

    afterEach(async () => {
        await clearDocuments(services);
    });

    const testCases: DocumentSymbolProviderTest[] = [
        {
            testName: 'annotation declaration',
            code: 'annotation A',
            expectedSymbols: [
                {
                    name: 'A',
                    kind: SymbolKind.Interface,
                },
            ],
        },
        {
            testName: 'attribute declaration',
            code: `
                class C {
                    attr a
                    static attr b
                }
            `,
            expectedSymbols: [
                {
                    name: 'C',
                    kind: SymbolKind.Class,
                    children: [
                        {
                            name: 'a',
                            kind: SymbolKind.Property,
                        },
                        {
                            name: 'b',
                            kind: SymbolKind.Property,
                        },
                    ],
                },
            ],
        },
        {
            testName: 'class declaration',
            code: 'class C',
            expectedSymbols: [
                {
                    name: 'C',
                    kind: SymbolKind.Class,
                },
            ],
        },
        {
            testName: 'enum declaration',
            code: 'enum E',
            expectedSymbols: [
                {
                    name: 'E',
                    kind: SymbolKind.Enum,
                },
            ],
        },
        {
            testName: 'enum variant declaration',
            code: 'enum E { V }',
            expectedSymbols: [
                {
                    name: 'E',
                    kind: SymbolKind.Enum,
                    children: [
                        {
                            name: 'V',
                            kind: SymbolKind.EnumMember,
                        },
                    ],
                },
            ],
        },
        {
            testName: 'function declaration',
            code: `
                class C {
                    fun f()
                    static fun g()
                }

                fun f()
            `,
            expectedSymbols: [
                {
                    name: 'C',
                    kind: SymbolKind.Class,
                    children: [
                        {
                            name: 'f',
                            kind: SymbolKind.Method,
                        },
                        {
                            name: 'g',
                            kind: SymbolKind.Method,
                        },
                    ],
                },
                {
                    name: 'f',
                    kind: SymbolKind.Function,
                },
            ],
        },
        {
            testName: 'module',
            code: 'package a.b.c',
            expectedSymbols: [
                {
                    name: 'a.b.c',
                    kind: SymbolKind.Package,
                },
            ],
        },
        {
            testName: 'parameter declaration',
            code: 'fun f(p: String)',
            expectedSymbols: [
                {
                    name: 'f',
                    kind: SymbolKind.Function,
                    // TODO: omit parameter?
                    children: [
                        {
                            name: 'p',
                            kind: SymbolKind.Variable,
                        },
                    ],
                },
            ],
        },
        {
            testName: 'pipeline declaration',
            code: 'pipeline p {}',
            expectedSymbols: [
                {
                    name: 'p',
                    kind: SymbolKind.Function,
                },
            ],
        },
        {
            testName: 'placeholder declaration',
            code: `
                pipeline p {
                    val a = 1;
                }
            `,
            expectedSymbols: [
                {
                    name: 'p',
                    kind: SymbolKind.Function,
                    children: [
                        {
                            name: 'a',
                            kind: SymbolKind.Variable,
                        },
                    ],
                },
            ],
        },
        {
            testName: 'segment declaration',
            code: 'segment s() {}',
            expectedSymbols: [
                {
                    name: 's',
                    kind: SymbolKind.Function,
                },
            ],
        },
        {
            testName: 'type parameter declaration',
            code: 'class C<T>',
            expectedSymbols: [
                {
                    name: 'C',
                    kind: SymbolKind.Class,
                    children: [
                        {
                            name: 'T',
                            kind: SymbolKind.TypeParameter,
                        },
                    ],
                },
            ],
        },
        {
            testName: 'deprecated declaration',
            code: `
                package test

                @Deprecated
                class C
            `,
            expectedSymbols: [
                {
                    name: 'test',
                    kind: SymbolKind.Package,
                    children: [
                        {
                            name: 'C',
                            kind: SymbolKind.Class,
                            tags: [SymbolTag.Deprecated],
                        },
                    ],
                },
            ],
        },
    ];

    it.each(testCases)('should assign the correct token types ($testName)', async ({ code, expectedSymbols }) => {
        await checkDocumentSymbols(code, expectedSymbols);
    });
});

const checkDocumentSymbols = async (code: string, expectedSymbols: SimpleDocumentSymbol[]) => {
    const document = await parseDocument(services, code);
    const symbols = (await symbolProvider.getSymbols(document, textDocumentParams(document))) ?? [];
    const simpleSymbols = symbols.map(simplifyDocumentSymbol);

    // eslint-disable-next-line vitest/prefer-strict-equal
    expect(simpleSymbols).toEqual(expectedSymbols);
};

const simplifyDocumentSymbol = (symbol: DocumentSymbol): SimpleDocumentSymbol => {
    return {
        name: symbol.name,
        kind: symbol.kind,
        tags: symbol.tags,
        detail: symbol.detail,
        children: symbol.children?.map(simplifyDocumentSymbol),
    };
};

// => Promise < void > {
// return async input => {
//     const document = await parseDocument(services, input.text);
//     const symbolProvider = services.lsp.DocumentSymbolProvider;
//     const symbols = await symbolProvider?.getSymbols(document, textDocumentParams(document)) ?? [];
//
//     if ('assert' in input && typeof input.assert === 'function') {
//         input.assert(symbols);
//     } else if ('expectedSymbols' in input) {
//         const symbolToString = input.symbolToString ?? (symbol => symbol.name);
//         const expectedSymbols = input.expectedSymbols;
//
//         if (symbols.length === expectedSymbols.length) {
//             for (let i = 0; i < expectedSymbols.length; i++) {
//                 const expected = expectedSymbols[i];
//                 const item = symbols[i];
//                 if (typeof expected === 'string') {
//                     expectedFunction(symbolToString(item), expected);
//                 } else {
//                     expectedFunction(item, expected);
//                 }
//             }
//         } else {
//             const symbolsMapped = symbols.map((s, i) => expectedSymbols[i] === undefined || typeof expectedSymbols[i] === 'string' ? symbolToString(s) : s);
//             expectedFunction(symbolsMapped, expectedSymbols, `Expected ${expectedSymbols.length} but found ${symbols.length} symbols in document`);
//         }
//     }
// };
// }

/**
 * A description of a test case for the document symbol provider.
 */
interface DocumentSymbolProviderTest {
    /**
     * A short description of the test case.
     */
    testName: string;

    /**
     * The code to parse.
     */
    code: string;

    /**
     * The expected symbols.
     */
    expectedSymbols: SimpleDocumentSymbol[];
}

/**
 * A document symbol without range information.
 */
interface SimpleDocumentSymbol {
    name: string;
    kind: SymbolKind;
    tags?: SymbolTag[];
    detail?: string;
    children?: SimpleDocumentSymbol[];
}
