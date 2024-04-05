import { createSafeDsServices } from '../../../src/language/index.js';
import { NodeFileSystem } from 'langium/node';
import { expectCompletion } from 'langium/test';
import { describe, expect, it } from 'vitest';

const services = (await createSafeDsServices(NodeFileSystem, { omitBuiltins: true })).SafeDs;

describe('SafeDsCompletionProvider', async () => {
    describe('suggested labels', () => {
        const testCases: CompletionTest[] = [
            // Keywords
            {
                testName: 'empty',
                code: '<|>',
                expectedLabels: ['package'],
                comparison: 'equal',
            },
            {
                testName: 'after package (sdspipe)',
                code: `
                    package myPackage
                    <|>
                `,
                uri: `file:///test1.sdspipe`,
                expectedLabels: ['from', 'pipeline', 'internal', 'private', 'segment'],
                comparison: 'equal',
            },
            {
                testName: 'after package (sdsstub)',
                code: `
                    package myPackage
                    <|>
                `,
                uri: `file:///test2.sdsstub`,
                expectedLabels: ['from', 'annotation', 'class', 'enum', 'fun', 'schema'],
                comparison: 'equal',
            },
            {
                testName: 'after package (sdstest)',
                code: `
                    package myPackage
                    <|>
                `,
                uri: `file:///test3.sdstest`,
                expectedLabels: [
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
                comparison: 'equal',
            },
            {
                testName: 'in class',
                code: `
                    class MyClass {
                        <|>
                    }
                `,
                expectedLabels: ['static', 'attr', 'class', 'enum', 'fun'],
                comparison: 'equal',
            },

            // Cross-references
            {
                testName: 'annotation call',
                code: `
                    annotation MyAnnotation

                    @<|>
                    class MyClass
                `,
                expectedLabels: ['MyAnnotation'],
                comparison: 'equal',
            },
            {
                testName: 'arguments',
                code: `
                    fun f(p: unknown)

                    pipeline myPipeline {
                        f(<|>
                    }
                `,
                expectedLabels: ['p'],
            },
            {
                testName: 'yield',
                code: `
                    segment mySegment() -> (result: unknown) {
                        yield <|>
                    }
                `,
                expectedLabels: ['result'],
            },
        ];

        it.each(testCases)('$testName', async ({ code, uri, expectedLabels, comparison = 'superset' }) => {
            await expectCompletion(services)({
                text: code,
                index: 0,
                parseOptions: {
                    documentUri: uri,
                },
                assert(completion) {
                    const labels = completion.items.map((item) => item.label);

                    if (comparison === 'equal') {
                        expect(labels).toStrictEqual(expectedLabels);
                    } else {
                        expect(labels).to.containSubset(expectedLabels);
                    }
                },
                disposeAfterCheck: true,
            });
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
    expectedLabels: string[];

    /**
     * If `equal`, the actual labels must be equal to the expected labels. If `superset`, the actual labels must be a
     * superset of the expected labels.
     */
    comparison?: 'equal' | 'superset';
}
