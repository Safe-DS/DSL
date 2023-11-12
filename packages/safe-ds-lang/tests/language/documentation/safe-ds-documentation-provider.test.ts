import { AstNode, EmptyFileSystem, expandToString } from 'langium';
import { clearDocuments } from 'langium/test';
import { afterEach, describe, expect, it } from 'vitest';
import { normalizeLineBreaks } from '../../../src/helpers/stringUtils.js';
import {
    isSdsAnnotation,
    isSdsFunction,
    isSdsParameter,
    isSdsResult,
    isSdsTypeParameter,
} from '../../../src/language/generated/ast.js';
import { createSafeDsServices } from '../../../src/language/index.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const documentationProvider = services.documentation.DocumentationProvider;
const testDocumentation = 'Lorem ipsum.';

describe('SafeDsDocumentationProvider', () => {
    afterEach(async () => {
        await clearDocuments(services);
    });

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
                enum MyEnum {
                    /**
                     * @typeParam T
                     *     ${testDocumentation}
                     */
                    MyEnumVariant<T>
                }
            `,
            predicate: isSdsTypeParameter,
            expectedDocumentation: testDocumentation,
        },
        {
            testName: 'documented type parameter (duplicate)',
            code: `
                enum MyEnum {
                    /**
                     * @typeParam T ${testDocumentation}
                     * @typeParam T bla
                     */
                    MyEnumVariant<T>
                }
            `,
            predicate: isSdsTypeParameter,
            expectedDocumentation: testDocumentation,
        },
        {
            testName: 'undocumented type parameter',
            code: `
                enum MyEnum {
                    /**
                     * @typeParam T
                     *     ${testDocumentation}
                     */
                    MyEnumVariant<T2>
                }
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
