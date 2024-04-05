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
            },
            {
                testName: 'after package (sdspipe)',
                code: `
                    package myPackage
                    <|>
                `,
                uri: `file:///test1.sdspipe`,
                expectedLabels: ['from', 'pipeline', 'internal', 'private', 'segment'],
            },
            {
                testName: 'after package (sdsstub)',
                code: `
                    package myPackage
                    <|>
                `,
                uri: `file:///test2.sdsstub`,
                expectedLabels: ['from', 'annotation', 'class', 'enum', 'fun', 'schema'],
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
            },
            {
                testName: 'in class',
                code: `
                    class MyClass {
                        <|>
                    }
                `,
                expectedLabels: ['static', 'attr', 'class', 'enum', 'fun'],
            },
        ];

        it.each(testCases)('$testName', async ({ code, expectedLabels, uri }) => {
            await expectCompletion(services)({
                text: code,
                index: 0,
                parseOptions: {
                    documentUri: uri,
                },
                assert(completion) {
                    const labels = completion.items.map((item) => item.label);
                    expect(labels).toStrictEqual(expectedLabels);
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
}
