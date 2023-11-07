import { NodeFileSystem } from 'langium/node';
import { clearDocuments, parseHelper } from 'langium/test';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type TypeHierarchyItem } from 'vscode-languageserver';
import { createSafeDsServices } from '../../../src/language/index.js';
import { findTestRanges } from '../../helpers/testRanges.js';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
const typeHierarchyProvider = services.lsp.TypeHierarchyProvider!;
const workspaceManager = services.shared.workspace.WorkspaceManager;
const parse = parseHelper(services);

describe('SafeDsTypeHierarchyProvider', async () => {
    beforeEach(async () => {
        // Load the builtin library
        await workspaceManager.initializeWorkspace([]);
    });

    afterEach(async () => {
        await clearDocuments(services);
    });

    describe('supertypes', () => {
        const testCases: TypeHierarchyProviderTest[] = [
            {
                testName: 'class without parent types',
                code: `class »«C`,
                expectedItems: [{ name: 'Any' }],
            },
            {
                testName: 'class with single parent type',
                code: `
                    class »«C sub D
                    class D
                `,
                expectedItems: [{ name: 'D' }],
            },
            {
                testName: 'class with multiple parent types',
                code: `
                    class »«C sub D, E
                    class D
                    class E
                `,
                expectedItems: [{ name: 'D' }],
            },
            {
                testName: 'enum',
                code: `
                    enum »«E
                `,
                expectedItems: undefined,
            },
            {
                testName: 'enum variant',
                code: `
                    enum E {
                        »«V
                    }
                `,
                expectedItems: [{ name: 'E' }],
            },
        ];

        it.each(testCases)('should list all supertypes ($testName)', async ({ code, expectedItems }) => {
            const result = await getActualSimpleSupertypes(code);
            expect(result).toStrictEqual(expectedItems);
        });
    });

    describe('subtypes', () => {
        const testCases: TypeHierarchyProviderTest[] = [
            {
                testName: 'class without subclasses',
                code: `class »«C`,
                expectedItems: undefined,
            },
            {
                testName: 'class without subclasses but with references',
                code: `
                    class »«C

                    class D {
                        attr c: C
                    }
                `,
                expectedItems: undefined,
            },
            {
                testName: 'class with subclasses but not used as first parent type',
                code: `
                    class »«C
                    class D
                    class E sub D, C
                `,
                expectedItems: undefined,
            },
            {
                testName: 'class with subclasses and used as first parent type',
                code: `
                    class »«C
                    class D
                    class E sub C, D
                `,
                expectedItems: [{ name: 'E' }],
            },
            {
                testName: 'enum without variant',
                code: `enum »«E`,
                expectedItems: undefined,
            },
            {
                testName: 'enum with variants',
                code: `
                    enum »«E {
                        V1
                        V2
                    }
                `,
                expectedItems: [{ name: 'V1' }, { name: 'V2' }],
            },
            {
                testName: 'enum variant',
                code: `
                    enum E {
                        »«V
                    }
                `,
                expectedItems: undefined,
            },
        ];

        it.each(testCases)('should list all subtypes ($testName)', async ({ code, expectedItems }) => {
            const result = await getActualSimpleSubtypes(code);
            expect(result).toStrictEqual(expectedItems);
        });
    });
});

const getActualSimpleSupertypes = async (code: string): Promise<SimpleTypeHierarchyItem[] | undefined> => {
    return typeHierarchyProvider
        .supertypes({
            item: await getUniqueTypeHierarchyItem(code),
        })
        ?.map((type) => ({
            name: type.name,
        }));
};

const getActualSimpleSubtypes = async (code: string): Promise<SimpleTypeHierarchyItem[] | undefined> => {
    return typeHierarchyProvider
        .subtypes({
            item: await getUniqueTypeHierarchyItem(code),
        })
        ?.map((type) => ({
            name: type.name,
        }));
};

const getUniqueTypeHierarchyItem = async (code: string): Promise<TypeHierarchyItem> => {
    const document = await parse(code);

    const testRangesResult = findTestRanges(code, document.uri);
    if (testRangesResult.isErr) {
        throw new Error(testRangesResult.error.message);
    } else if (testRangesResult.value.length !== 1) {
        throw new Error(`Expected exactly one test range, but got ${testRangesResult.value.length}.`);
    }
    const testRangeStart = testRangesResult.value[0]!.start;

    const items =
        typeHierarchyProvider.prepareTypeHierarchy(document, {
            textDocument: {
                uri: document.textDocument.uri,
            },
            position: {
                line: testRangeStart.line,
                // Since the test range cannot be placed inside the identifier, we place it in front of the identifier.
                // Then we need to move the cursor one character to the right to be inside the identifier.
                character: testRangeStart.character + 1,
            },
        }) ?? [];

    if (items.length !== 1) {
        throw new Error(`Expected exactly one call hierarchy item, but got ${items.length}.`);
    }

    return items[0]!;
};

/**
 * A test case for {@link SafeDsTypeHierarchyProvider.supertypes} and {@link SafeDsTypeHierarchyProvider.subtypes}.
 */
interface TypeHierarchyProviderTest {
    /**
     * A short description of the test case.
     */
    testName: string;

    /**
     * The code to parse.
     */
    code: string;

    /**
     * The expected type hierarchy items.
     */
    expectedItems: SimpleTypeHierarchyItem[] | undefined;
}

/**
 * A simplified variant of {@link TypeHierarchyItem}.
 */
interface SimpleTypeHierarchyItem {
    /**
     * The name of the declaration.
     */
    name: string;
}
