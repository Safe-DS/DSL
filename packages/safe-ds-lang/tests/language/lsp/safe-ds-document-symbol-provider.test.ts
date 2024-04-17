import { NodeFileSystem } from 'langium/node';
import { parseDocument, textDocumentParams } from 'langium/test';
import { describe, expect, it } from 'vitest';
import { DocumentSymbol, SymbolKind, SymbolTag } from 'vscode-languageserver';
import { createSafeDsServices } from '../../../src/language/index.js';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const symbolProvider = services.lsp.DocumentSymbolProvider!;

describe('SafeDsSemanticTokenProvider', async () => {
    const testCases: DocumentSymbolProviderTest[] = [
        {
            testName: 'annotation declaration',
            code: 'annotation A(p: Int)',
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
                    attr a: Int
                    static attr b: (p: Int) -> r: Int
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
                            detail: ': Int',
                        },
                        {
                            name: 'b',
                            kind: SymbolKind.Property,
                            detail: ': (p: Int) -> (r: Int)',
                        },
                    ],
                },
            ],
        },
        {
            testName: 'class declaration',
            code: 'class C<T>(p: Int)',
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
            code: `
                enum E {
                    V(p: Int)
                }
            `,
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
                    fun f<T>(p: Int) -> r: Int
                    static fun g<T>(p: Int) -> r: Int
                }

                fun f<T>(p: Int) -> r: Int
            `,
            expectedSymbols: [
                {
                    name: 'C',
                    kind: SymbolKind.Class,
                    children: [
                        {
                            name: 'f',
                            kind: SymbolKind.Method,
                            detail: '(p: Int) -> (r: Int)',
                        },
                        {
                            name: 'g',
                            kind: SymbolKind.Method,
                            detail: '(p: Int) -> (r: Int)',
                        },
                    ],
                },
                {
                    name: 'f',
                    kind: SymbolKind.Function,
                    detail: '(p: Int) -> (r: Int)',
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
            testName: 'pipeline declaration',
            code: `
                pipeline p {
                    val a = 1;

                    (q: Int) {
                        yield r = 1;
                    };
                }
            `,
            expectedSymbols: [
                {
                    name: 'p',
                    kind: SymbolKind.Function,
                },
            ],
        },
        {
            testName: 'schema declaration',
            code: `
                schema S {
                    "a": Int
                }
            `,
            expectedSymbols: [
                {
                    name: 'S',
                    kind: SymbolKind.Struct,
                },
            ],
        },
        {
            testName: 'segment declaration',
            code: `
                segment s(p: Int) -> r: Int {
                    val a = 1;

                    (p: Int) {
                        yield r = 1;
                    };
                }
            `,
            expectedSymbols: [
                {
                    name: 's',
                    kind: SymbolKind.Function,
                    detail: '(p: Int) -> (r: Int)',
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

    it.each(testCases)('should assign the correct symbols ($testName)', async ({ code, expectedSymbols }) => {
        await checkDocumentSymbols(code, expectedSymbols);
    });
});

const checkDocumentSymbols = async (code: string, expectedSymbols: SimpleDocumentSymbol[]) => {
    const document = await parseDocument(services, code);
    const symbols = (await symbolProvider.getSymbols(document, textDocumentParams(document))) ?? [];
    const simpleSymbols = symbols.map(simplifyDocumentSymbol);

    expect(simpleSymbols).toStrictEqual(expectedSymbols);
};

const simplifyDocumentSymbol = (symbol: DocumentSymbol): SimpleDocumentSymbol => {
    const result = {
        name: symbol.name,
        kind: symbol.kind,
        tags: symbol.tags,
        detail: symbol.detail,
        children: symbol.children?.map(simplifyDocumentSymbol),
    };

    if (!result.tags) {
        delete result.tags;
    }
    if (!result.detail) {
        delete result.detail;
    }
    if (!result.children) {
        delete result.children;
    }

    return result;
};

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
