import { AssertionError } from 'assert';
import { AstNode, EmptyFileSystem } from 'langium';
import { describe, expect, it } from 'vitest';
import {
    isSdsAnnotation,
    isSdsAttribute,
    isSdsBlockLambdaResult,
    isSdsEnumVariant,
    isSdsExpressionStatement,
    isSdsParameter,
    isSdsPlaceholder,
    isSdsResult,
    isSdsTypeParameter,
} from '../../../src/language/generated/ast.js';
import { createSafeDsServices } from '../../../src/language/index.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';

const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;
const commentProvider = services.documentation.CommentProvider;
const testComment = '/* test */';

describe('SafeDsCommentProvider', () => {
    const testCases: CommentProviderTest[] = [
        {
            testName: 'commented module member (without annotations)',
            code: `
                ${testComment}
                annotation MyAnnotation
            `,
            predicate: isSdsAnnotation,
            expectedComment: testComment,
        },
        {
            testName: 'commented module member (with annotations, missing package)',
            code: `
                ${testComment}
                @Test
                annotation MyAnnotation
            `,
            predicate: isSdsAnnotation,
            expectedComment: undefined,
        },
        {
            testName: 'commented module member (with annotations, with package)',
            code: `
                package test

                ${testComment}
                @Test
                annotation MyAnnotation
            `,
            predicate: isSdsAnnotation,
            expectedComment: testComment,
        },
        {
            testName: 'uncommented module member',
            code: `
                annotation MyAnnotation
            `,
            predicate: isSdsAnnotation,
            expectedComment: undefined,
        },
        {
            testName: 'commented class member (without annotations)',
            code: `
                class MyClass {
                    ${testComment}
                    attr a: Int
                }
            `,
            predicate: isSdsAttribute,
            expectedComment: testComment,
        },
        {
            testName: 'commented class member (with annotations)',
            code: `
                class MyClass {
                    ${testComment}
                    @Test
                    attr a: Int
                }
            `,
            predicate: isSdsAttribute,
            expectedComment: testComment,
        },
        {
            testName: 'uncommented class member',
            code: `
                class MyClass {
                    attr a: Int
                }
            `,
            predicate: isSdsAttribute,
            expectedComment: undefined,
        },
        {
            testName: 'commented enum variant (without annotations)',
            code: `
                enum MyEnum {
                    ${testComment}
                    MyEnumVariant
                }
            `,
            predicate: isSdsEnumVariant,
            expectedComment: testComment,
        },
        {
            testName: 'commented enum variant (with annotations)',
            code: `
                enum MyEnum {
                    ${testComment}
                    @Test
                    MyEnumVariant
                }
            `,
            predicate: isSdsEnumVariant,
            expectedComment: testComment,
        },
        {
            testName: 'uncommented enum variant',
            code: `
                enum MyEnum {
                    MyEnumVariant
                }
            `,
            predicate: isSdsEnumVariant,
            expectedComment: undefined,
        },
        {
            testName: 'commented block lambda result',
            code: `
                pipeline myPipeline {
                    () {
                        ${testComment}
                        yield r = 1;
                    }
                }
            `,
            predicate: isSdsBlockLambdaResult,
            expectedComment: undefined,
        },
        {
            testName: 'uncommented block lambda result',
            code: `
                pipeline myPipeline {
                    () {
                        yield r = 1;
                    }
                }
            `,
            predicate: isSdsBlockLambdaResult,
            expectedComment: undefined,
        },
        {
            testName: 'commented parameter',
            code: `
                segment mySegment(${testComment} p: Int) {}
            `,
            predicate: isSdsParameter,
            expectedComment: undefined,
        },
        {
            testName: 'uncommented parameter',
            code: `
                segment mySegment(p: Int) {}
            `,
            predicate: isSdsParameter,
            expectedComment: undefined,
        },
        {
            testName: 'commented placeholder',
            code: `
                segment mySegment() {
                    ${testComment}
                    val p = 1;
                }
            `,
            predicate: isSdsPlaceholder,
            expectedComment: undefined,
        },
        {
            testName: 'uncommented placeholder',
            code: `
                segment mySegment(p: Int) {
                    val p = 1;
                }
            `,
            predicate: isSdsPlaceholder,
            expectedComment: undefined,
        },
        {
            testName: 'commented result',
            code: `
                segment mySegment() -> (${testComment} r: Int) {}
            `,
            predicate: isSdsResult,
            expectedComment: undefined,
        },
        {
            testName: 'uncommented result',
            code: `
                segment mySegment() -> (r: Int) {}
            `,
            predicate: isSdsResult,
            expectedComment: undefined,
        },
        {
            testName: 'commented type parameter',
            code: `
                class MyClass<${testComment} T>
            `,
            predicate: isSdsTypeParameter,
            expectedComment: undefined,
        },
        {
            testName: 'uncommented type parameter',
            code: `
                class MyClass<T>
            `,
            predicate: isSdsTypeParameter,
            expectedComment: undefined,
        },
        {
            testName: 'commented not-a-declaration',
            code: `
                segment mySegment(p: Int) {
                    ${testComment}
                    f();
                }
            `,
            predicate: isSdsExpressionStatement,
            expectedComment: undefined,
        },
        {
            testName: 'uncommented not-a-declaration',
            code: `
                segment mySegment(p: Int) {
                    f();
                }
            `,
            predicate: isSdsExpressionStatement,
            expectedComment: undefined,
        },
    ];

    it.each(testCases)('$testName', async ({ code, predicate, expectedComment }) => {
        const node = await getNodeOfType(services, code, predicate);
        if (!node) {
            throw new AssertionError({ message: 'Node not found.' });
        }

        expect(commentProvider.getComment(node)).toStrictEqual(expectedComment);
    });
});

/**
 * A description of a test case for the comment provider.
 */
interface CommentProviderTest {
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
     * The expected comment.
     */
    expectedComment: string | undefined;
}
