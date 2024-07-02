import { describe, expect, it } from 'vitest';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import { isSdsPipeline } from '../../../src/language/generated/ast.js';
import { createSafeDsServices, getPlaceholderByName, getStatements } from '../../../src/language/index.js';
import { NodeFileSystem } from 'langium/node';
import { fail } from 'node:assert';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const slicer = services.flow.Slicer;

describe('computeBackwardSlice', async () => {
    const testCases: ComputeBackwardSliceTest[] = [
        {
            testName: 'no targets',
            code: `
                pipeline myPipeline {
                    val a = 1;
                }
            `,
            targetNames: [],
            expectedIndices: [],
        },
        {
            testName: 'single target',
            code: `
                pipeline myPipeline {
                    val a = 1;
                }
            `,
            targetNames: ['a'],
            expectedIndices: [0],
        },
        {
            testName: 'multiple targets',
            code: `
                pipeline myPipeline {
                    val a = 1;
                    val b = 2;
                }
            `,
            targetNames: ['a', 'b'],
            expectedIndices: [0, 1],
        },
        {
            testName: 'statement without effect',
            code: `
                pipeline myPipeline {
                    val a = 1;
                    1 + 2;
                    val b = a;
                }
            `,
            targetNames: ['b'],
            expectedIndices: [0, 2],
        },
        {
            testName: 'later statement',
            code: `
                pipeline myPipeline {
                    val a = 1;
                    val b = a;
                }
            `,
            targetNames: ['a'],
            expectedIndices: [0],
        },
        {
            testName: 'required due to reference',
            code: `
                pipeline myPipeline {
                    val a = 1;
                    val b = a + 1;
                }
            `,
            targetNames: ['b'],
            expectedIndices: [0, 1],
        },
        {
            testName: 'required due to impurity reason',
            code: `
                package test

                @Impure([ImpurityReason.FileReadFromConstantPath("a.txt")])
                fun fileRead() -> content: String

                @Impure([ImpurityReason.FileWriteToConstantPath("a.txt")])
                fun fileWrite()

                pipeline myPipeline {
                    fileWrite();
                    val a = fileRead();
                }
            `,
            targetNames: ['a'],
            expectedIndices: [0, 1],
        },
    ];

    it.each(testCases)('$testName', async ({ code, targetNames, expectedIndices }) => {
        const pipeline = await getNodeOfType(services, code, isSdsPipeline);
        const statements = getStatements(pipeline.body);
        const targets = targetNames.map(
            (targetName) =>
                getPlaceholderByName(pipeline.body, targetName) ??
                fail(`Target placeholder "${targetName}" not found.`),
        );

        const backwardSlice = slicer.computeBackwardSlice(statements, targets);
        const actualIndices = backwardSlice.map((statement) => statement.$containerIndex);

        expect(actualIndices).toStrictEqual(expectedIndices);
    });
});

interface ComputeBackwardSliceTest {
    /**
     * A short description of the test.
     */
    testName: string;

    /**
     * The code to slice.
     */
    code: string;

    /**
     * The targets to compute the backward slice for.
     */
    targetNames: string[];

    /**
     * The expected container indices of the statements in the backward slice.
     */
    expectedIndices: number[];
}
