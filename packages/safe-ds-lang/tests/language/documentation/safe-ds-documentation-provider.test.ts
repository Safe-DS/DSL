import { AstNode, EmptyFileSystem } from 'langium';
import { describe, expect, it } from 'vitest';
import { normalizeLineBreaks } from '../../../src/helpers/strings.js';
import {
    isSdsAnnotation,
    isSdsFunction,
    isSdsParameter,
    isSdsResult,
    isSdsTypeParameter,
} from '../../../src/language/generated/ast.js';
import { createSafeDsServices } from '../../../src/language/index.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import { expandToString } from 'langium/generate';

const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;
const documentationProvider = services.documentation.DocumentationProvider;
const testDocumentation = 'Lorem ipsum.';

describe('SafeDsDocumentationProvider', () => {
    describe('getDocumentation', () => {
        const testCases: DocumentationProviderTest[] = [
            {
                testName: 'module member',
                code: `
                    /**
                     * ${testDocumentation}
                     */
                    annotation MyAnnotation
                `,
                predicate: isSdsAnnotation,
                expectedDocumentation: testDocumentation,
            },
            {
                testName: 'documented parameter',
                code: `
                    /**
                     * @param param ${testDocumentation}
                     */
                    fun myFunction(param: String)
                `,
                predicate: isSdsParameter,
                expectedDocumentation: testDocumentation,
            },
            {
                testName: 'documented parameter (duplicate)',
                code: `
                    /**
                     * @param param ${testDocumentation}
                     * @param param bla
                     */
                    fun myFunction(param: String)
                `,
                predicate: isSdsParameter,
                expectedDocumentation: testDocumentation,
            },
            {
                testName: 'undocumented parameter',
                code: `
                    /**
                     * @param param ${testDocumentation}
                     */
                    fun myFunction(param2: String)
                `,
                predicate: isSdsParameter,
                expectedDocumentation: undefined,
            },
            {
                testName: 'parameter (no documentation on containing callable)',
                code: `
                    fun myFunction(p: Int)
                `,
                predicate: isSdsParameter,
                expectedDocumentation: undefined,
            },
            {
                testName: 'documented result',
                code: `
                    /**
                     * @result res ${testDocumentation}
                     */
                    fun myFunction() -> (res: String)
                `,
                predicate: isSdsResult,
                expectedDocumentation: testDocumentation,
            },
            {
                testName: 'documented result (duplicate)',
                code: `
                    /**
                     * @result res ${testDocumentation}
                     * @result res bla
                     */
                    fun myFunction() -> (res: String)
                `,
                predicate: isSdsResult,
                expectedDocumentation: testDocumentation,
            },
            {
                testName: 'undocumented result',
                code: `
                    /**
                     * @result res ${testDocumentation}
                     */
                    fun myFunction() -> (res2: String)
                `,
                predicate: isSdsResult,
                expectedDocumentation: undefined,
            },
            {
                testName: 'result (no documentation on containing callable)',
                code: `
                    fun myFunction() -> r: Int
                `,
                predicate: isSdsResult,
                expectedDocumentation: undefined,
            },
            {
                testName: 'documented type parameter',
                code: `
                    /**
                     * @typeParam T
                     *     ${testDocumentation}
                     */
                    class MyClass<T>
                `,
                predicate: isSdsTypeParameter,
                expectedDocumentation: testDocumentation,
            },
            {
                testName: 'documented type parameter (duplicate)',
                code: `
                    /**
                     * @typeParam T ${testDocumentation}
                     * @typeParam T bla
                     */
                    class MyClass<T>
                `,
                predicate: isSdsTypeParameter,
                expectedDocumentation: testDocumentation,
            },
            {
                testName: 'undocumented type parameter',
                code: `
                    /**
                     * @typeParam T
                     *     ${testDocumentation}
                     */
                    class MyClass<T2>
                `,
                predicate: isSdsTypeParameter,
                expectedDocumentation: undefined,
            },
            {
                testName: 'type parameter (no documentation on containing callable)',
                code: `
                    fun myFunction<T>()
                `,
                predicate: isSdsTypeParameter,
                expectedDocumentation: undefined,
            },
            {
                testName: 'custom tag rendering',
                code: `
                    /**
                     * ${testDocumentation}
                     *
                     * @param param ${testDocumentation}
                     * @result result ${testDocumentation}
                     * @typeParam T ${testDocumentation}
                     * @since 1.0.0
                     */
                    fun myFunction<T>(param: String) -> result: String
                `,
                predicate: isSdsFunction,
                expectedDocumentation: expandToString`
                    Lorem ipsum.

                    **@param** *param* — Lorem ipsum.

                    **@result** *result* — Lorem ipsum.

                    **@typeParam** *T* — Lorem ipsum.

                    **@since** — 1.0.0
                `,
            },
            {
                testName: 'multiline tag',
                code: `
                    /**
                     * @param param ${testDocumentation}
                     * ${testDocumentation}
                     */
                    fun myFunction(param: String)
                `,
                predicate: isSdsParameter,
                expectedDocumentation: `${testDocumentation} ${testDocumentation}`,
            },
        ];

        it.each(testCases)('$testName', async ({ code, predicate, expectedDocumentation }) => {
            const node = await getNodeOfType(services, code, predicate);
            const normalizedActual = normalizeLineBreaks(documentationProvider.getDocumentation(node));
            const normalizedExpected = normalizeLineBreaks(expectedDocumentation);
            expect(normalizedActual).toStrictEqual(normalizedExpected);
        });

        it('should resolve links', async () => {
            const code = `
                /**
                 * {@link myFunction2}
                 */
                fun myFunction1()

                fun myFunction2()
            `;
            const node = await getNodeOfType(services, code, isSdsFunction);
            expect(documentationProvider.getDocumentation(node)).toMatch(/\[myFunction2\]\(.*\)/u);
        });
    });

    describe('getDescription', () => {
        const testCases: DocumentationProviderTest[] = [
            {
                testName: 'text and tags',
                code: `
                    /**
                     * ${testDocumentation}
                     *
                     * @param param ${testDocumentation}
                     * @result result ${testDocumentation}
                     * @typeParam T ${testDocumentation}
                     * @since 1.0.0
                     */
                    fun myFunction<T>(param: String) -> result: String
                `,
                predicate: isSdsFunction,
                expectedDocumentation: testDocumentation,
            },
            {
                testName: 'text, tags, and more text',
                code: `
                    /**
                     * ${testDocumentation}
                     *
                     * @param param ${testDocumentation}
                     * @result result ${testDocumentation}
                     * @typeParam T ${testDocumentation}
                     * @since 1.0.0
                     *
                     * ${testDocumentation}
                     */
                    fun myFunction<T>(param: String) -> result: String
                `,
                predicate: isSdsFunction,
                expectedDocumentation: testDocumentation,
            },
            {
                testName: 'text with inline tags',
                code: `
                    /**
                     * ${testDocumentation} {@link myFunction2} ${testDocumentation}
                     */
                    fun myFunction<T>(param: String) -> result: String
                `,
                predicate: isSdsFunction,
                expectedDocumentation: `${testDocumentation} myFunction2 ${testDocumentation}`,
            },
            {
                testName: 'multiline text',
                code: `
                    /**
                     * ${testDocumentation}
                     *
                     * ${testDocumentation}
                     */
                    fun myFunction()
                `,
                predicate: isSdsFunction,
                expectedDocumentation: `${testDocumentation}\n\n${testDocumentation}`,
            },
        ];

        it.each(testCases)('$testName', async ({ code, predicate, expectedDocumentation }) => {
            const node = await getNodeOfType(services, code, predicate);
            const normalizedActual = normalizeLineBreaks(documentationProvider.getDescription(node));
            const normalizedExpected = normalizeLineBreaks(expectedDocumentation);
            expect(normalizedActual).toStrictEqual(normalizedExpected);
        });
    });

    describe('getSince', () => {
        const testCases: DocumentationProviderTest[] = [
            {
                testName: 'no since tag',
                code: `
                    /**
                     * ${testDocumentation}
                     */
                    fun myFunction()
                `,
                predicate: isSdsFunction,
                expectedDocumentation: undefined,
            },
            {
                testName: 'one since tag',
                code: `
                    /**
                     * ${testDocumentation}
                     *
                     * @since 1.0.0
                     *
                     * ${testDocumentation}
                     */
                    fun myFunction()
                `,
                predicate: isSdsFunction,
                expectedDocumentation: '1.0.0',
            },
            {
                testName: 'multiple since tags',
                code: `
                    /**
                     * ${testDocumentation}
                     *
                     * @since 1.0.0
                     * @since 2.0.0
                     */
                    fun myFunction()
                `,
                predicate: isSdsFunction,
                expectedDocumentation: '1.0.0',
            },
        ];

        it.each(testCases)('$testName', async ({ code, predicate, expectedDocumentation }) => {
            const node = await getNodeOfType(services, code, predicate);
            const normalizedActual = normalizeLineBreaks(documentationProvider.getSince(node));
            const normalizedExpected = normalizeLineBreaks(expectedDocumentation);
            expect(normalizedActual).toStrictEqual(normalizedExpected);
        });
    });
});

/**
 * A description of a test case for the documentation provider.
 */
interface DocumentationProviderTest {
    /**
     * A short description of the test case.
     */
    testName: string;

    /**
     * The code to test.
     */
    code: string;

    /**
     * A predicate to find the node to test.
     */
    predicate: (node: unknown) => node is AstNode;

    /**
     * The expected documentation.
     */
    expectedDocumentation: string | undefined;
}
