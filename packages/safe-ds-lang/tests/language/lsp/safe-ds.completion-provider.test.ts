import { createSafeDsServices } from '../../../src/language/index.js';
import { NodeFileSystem } from 'langium/node';
import { expectCompletion } from 'langium/test';
import { describe, expect, it } from 'vitest';
import { CompletionItemTag } from 'vscode-languageserver';

const services = (await createSafeDsServices(NodeFileSystem, { omitBuiltins: true })).SafeDs;

describe('SafeDsCompletionProvider', async () => {
    describe('suggested labels', () => {
        const testCases: CompletionTest[] = [
            // Keywords
            {
                testName: 'empty',
                code: '<|>',
                expectedLabels: {
                    shouldEqual: ['package'],
                },
            },
            {
                testName: 'after package (sds)',
                code: `
                    package myPackage
                    <|>
                `,
                uri: `file:///test1.sds`,
                expectedLabels: {
                    shouldEqual: ['from', 'schema', 'pipeline', 'internal', 'private', 'segment'],
                },
            },
            {
                testName: 'after package (sdsstub)',
                code: `
                    package myPackage
                    <|>
                `,
                uri: `file:///test2.sdsstub`,
                expectedLabels: {
                    shouldEqual: ['from', 'annotation', 'class', 'enum', 'fun', 'schema'],
                },
            },
            {
                testName: 'after package (sdsdev)',
                code: `
                    package myPackage
                    <|>
                `,
                uri: `file:///test3.sdsdev`,
                expectedLabels: {
                    shouldEqual: [
                        'from',
                        'annotation',
                        'class',
                        'enum',
                        'fun',
                        'schema',
                        'pipeline',
                        'internal',
                        'private',
                        'segment',
                    ],
                },
            },
            {
                testName: 'in class',
                code: `
                    class MyClass {
                        <|>
                `,
                expectedLabels: {
                    shouldEqual: ['static', 'attr', 'class', 'enum', 'fun'],
                },
            },

            // Cross-references
            {
                testName: 'annotation calls (no prefix)',
                code: `
                    annotation MyAnnotation

                    @<|>
                `,
                expectedLabels: {
                    shouldEqual: ['MyAnnotation'],
                },
            },
            {
                testName: 'annotation calls (with prefix)',
                code: `
                    annotation MyAnnotation
                    annotation OtherAnnotation

                    @O<|>
                `,
                expectedLabels: {
                    shouldEqual: ['OtherAnnotation'],
                },
            },
            {
                testName: 'arguments (no prefix)',
                code: `
                    fun f(p: unknown)

                    pipeline myPipeline {
                        f(<|>
                `,
                expectedLabels: {
                    shouldContain: ['p'],
                },
            },
            {
                testName: 'arguments (with prefix)',
                code: `
                    fun f(p1: unknown, q2: unknown)

                    pipeline myPipeline {
                        f(p<|>
                `,
                expectedLabels: {
                    shouldContain: ['p1'],
                    shouldNotContain: ['q2'],
                },
            },
            {
                testName: 'member accesses (no prefix)',
                code: `
                    class MyClass {
                        static attr a: unknown
                    }

                    pipeline myPipeline {
                        MyClass.<|>
                `,
                expectedLabels: {
                    shouldContain: ['a'],
                    shouldNotContain: ['MyClass', 'myPipeline'],
                },
            },
            {
                testName: 'member accesses (with prefix)',
                code: `
                    class MyClass {
                        static attr a1: unknown
                        static fun b2()
                    }

                    pipeline myPipeline {
                        MyClass.a<|>
                `,
                expectedLabels: {
                    shouldContain: ['a1'],
                    shouldNotContain: ['MyClass', 'myPipeline'],
                },
            },
            {
                testName: 'member types (no prefix)',
                code: `
                    class MyClass {
                        class NestedClass
                    }

                    fun f(p: MyClass.<|>
                `,
                expectedLabels: {
                    shouldContain: ['NestedClass'],
                    shouldNotContain: ['MyClass'],
                },
            },
            {
                testName: 'member types (with prefix)',
                code: `
                    class MyClass {
                        class NestedClass
                        class OtherClass
                    }

                    fun f(p: MyClass.N<|>
                `,
                expectedLabels: {
                    shouldContain: ['NestedClass'],
                    shouldNotContain: ['MyClass', 'OtherClass'],
                },
            },
            {
                testName: 'named types (no prefix)',
                code: `
                    class MyClass

                    fun f(p: <|>
                `,
                expectedLabels: {
                    shouldContain: ['MyClass'],
                },
            },
            {
                testName: 'named types (with prefix)',
                code: `
                    class MyClass
                    class OtherClass

                    fun f(p: M<|>
                `,
                expectedLabels: {
                    shouldContain: ['MyClass'],
                    shouldNotContain: ['OtherClass'],
                },
            },
            {
                testName: 'parameter bounds (no prefix)',
                code: `
                    fun f(p: unknown) where {
                        <|>
                `,
                expectedLabels: {
                    shouldEqual: ['p'],
                },
            },
            {
                testName: 'parameter bounds (with prefix)',
                code: `
                    fun f(p1: unknown, q2: unknown) where {
                        p<|>
                `,
                expectedLabels: {
                    shouldContain: ['p1'],
                    shouldNotContain: ['q2'],
                },
            },
            {
                testName: 'reference (no prefix)',
                code: `
                    fun f()

                    pipeline myPipeline {
                        <|>
                `,
                expectedLabels: {
                    shouldContain: ['f'],
                },
            },
            {
                testName: 'reference (with prefix)',
                code: `
                    fun f1()
                    fun g2()

                    pipeline myPipeline {
                        f<|>
                `,
                expectedLabels: {
                    shouldContain: ['f1'],
                    shouldNotContain: ['g2'],
                },
            },
            {
                testName: 'reference (class only for typing)',
                code: `
                    class MyClass1
                    class MyClass2()
                    class MyClass3 {
                        static attr myAttribute: Int
                    }

                    pipeline myPipeline {
                        <|>
                `,
                expectedLabels: {
                    shouldContain: ['MyClass2', 'MyClass3'],
                    shouldNotContain: ['MyClass1'],
                },
            },
            {
                testName: 'type arguments (no prefix)',
                code: `
                    class MyClass<T>

                    class OtherClass {
                        attr a: MyClass<<|>
                `,
                expectedLabels: {
                    shouldContain: ['T'],
                },
            },
            {
                testName: 'type arguments (with prefix)',
                code: `
                    class MyClass<T1, U2>

                    class OtherClass {
                        attr a: MyClass<T<|>
                `,
                expectedLabels: {
                    shouldContain: ['T1'],
                    shouldNotContain: ['U2'],
                },
            },
            {
                testName: 'yields (no prefix)',
                code: `
                    segment mySegment() -> (r: unknown) {
                        yield <|>
                `,
                expectedLabels: {
                    shouldContain: ['r'],
                },
            },
            {
                testName: 'yields (with prefix)',
                code: `
                    segment mySegment() -> (r1: unknown, s2: unknown) {
                        yield r<|>
                `,
                expectedLabels: {
                    shouldContain: ['r1'],
                    shouldNotContain: ['s2'],
                },
            },

            // Filtering by node type
            {
                testName: 'named type to type parameter of containing class',
                code: `
                    class MyClass<T1> {
                        class MyNestedClass<T2>(p: <|>
                    }
                `,
                expectedLabels: {
                    shouldContain: ['T2'],
                    shouldNotContain: ['T1'],
                },
            },
            {
                testName: 'reference to annotation',
                code: `
                    annotation MyAnnotation

                    pipeline myPipeline {
                        <|>
                `,
                expectedLabels: {
                    shouldNotContain: ['MyAnnotation'],
                },
            },
            {
                testName: 'reference to pipeline',
                code: `
                    pipeline myPipeline {
                        <|>
                `,
                expectedLabels: {
                    shouldNotContain: ['myPipeline'],
                },
            },
            {
                testName: 'reference to schema',
                code: `
                    schema MySchema {}

                    pipeline myPipeline {
                        <|>
                `,
                expectedLabels: {
                    shouldNotContain: ['MySchema'],
                },
            },

            // Special cases
            {
                testName: 'fuzzy matching',
                code: `
                    annotation Annotation
                    annotation MyAnnotation
                    annotation OtherAnnotation

                    @Anno<|>
                `,
                expectedLabels: {
                    shouldContain: ['Annotation', 'MyAnnotation', 'OtherAnnotation'],
                },
            },
            {
                testName: 'no error when completing block lambda result',
                code: `
                    pipeline myPipeline {
                        (param1) {
                            yield <|>
                    }
                `,
                expectedLabels: {
                    shouldEqual: [],
                },
            },
        ];

        it.each(testCases)('$testName', async ({ code, uri, expectedLabels }) => {
            await expectCompletion(services)({
                text: code,
                index: 0,
                parseOptions: {
                    documentUri: uri,
                },
                assert(completion) {
                    const labels = completion.items.map((item) => item.label);

                    if (expectedLabels.shouldEqual) {
                        expect(labels).toStrictEqual(expectedLabels.shouldEqual);
                    }

                    if (expectedLabels.shouldContain) {
                        expect(labels).to.containSubset(expectedLabels.shouldContain);
                    }

                    if (expectedLabels.shouldNotContain) {
                        expect(labels).not.to.containSubset(expectedLabels.shouldNotContain);
                    }
                },
                disposeAfterCheck: true,
            });
        });
    });

    it('should return documentation if available', async () => {
        await expectCompletion(services)({
            text: `
                /**
                 * My documentation
                 */
                annotation MyAnnotation

                @<|>
            `,
            index: 0,
            assert(completion) {
                expect(completion.items).toHaveLength(1);
                expect(completion.items[0]!.documentation).toStrictEqual({
                    kind: 'markdown',
                    value: 'My documentation',
                });
            },
        });
    });

    it('should add deprecated tag if needed', async () => {
        const servicesWithBuiltins = (await createSafeDsServices(NodeFileSystem)).SafeDs;
        await expectCompletion(servicesWithBuiltins)({
            text: `
                package test

                @Deprecated
                annotation MyAnnotation

                @MyAnnotation<|>
            `,
            index: 0,
            assert(completion) {
                expect(completion.items).toHaveLength(1);
                expect(completion.items[0]!.tags).toStrictEqual([CompletionItemTag.Deprecated]);
            },
        });
    });
});

/**
 * A test case for {@link SafeDsCompletionProvider}.
 */
interface CompletionTest {
    /**
     * A short description of the test case.
     */
    testName: string;

    /**
     * The code to parse.
     */
    code: string;

    /**
     * The URI to assign to the parsed document.
     */
    uri?: string;

    /**
     * The expected completion labels.
     */
    expectedLabels: ExpectedLabels;
}

/**
 * The expected completion labels.
 */
interface ExpectedLabels {
    /**
     * The actual labels must be equal to these labels.
     */
    shouldEqual?: string[];

    /**
     * The actual labels must contain these labels.
     */
    shouldContain?: string[];

    /**
     * The actual labels must not contain these labels.
     */
    shouldNotContain?: string[];
}
