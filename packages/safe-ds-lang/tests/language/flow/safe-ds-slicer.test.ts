import { describe, expect, it } from 'vitest';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import { isSdsPipeline } from '../../../src/language/generated/ast.js';
import { createSafeDsServices, getStatements } from '../../../src/language/index.js';
import { NodeFileSystem } from 'langium/node';
import { fail } from 'node:assert';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const slicer = services.flow.Slicer;

describe('computeBackwardSliceToTargets', async () => {
    const testCases: ComputeBackwardSliceTest[] = [
        {
            testName: 'no targets',
            code: `
                pipeline myPipeline {
                    val a = 1;
                }
            `,
            targetIndices: [],
            expectedIndices: [],
        },
        {
            testName: 'single target (assignment)',
            code: `
                pipeline myPipeline {
                    val a = 1;
                }
            `,
            targetIndices: [0],
            expectedIndices: [0],
        },
        {
            testName: 'single target (output statement)',
            code: `
                pipeline myPipeline {
                    out 1;
                }
            `,
            targetIndices: [0],
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
            targetIndices: [0, 1],
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
            targetIndices: [2],
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
            targetIndices: [0],
            expectedIndices: [0],
        },
        {
            testName: 'required due to reference (assignment)',
            code: `
                pipeline myPipeline {
                    val a = 1;
                    val b = a + 1;
                }
            `,
            targetIndices: [1],
            expectedIndices: [0, 1],
        },
        {
            testName: 'required due to reference (output statement)',
            code: `
                pipeline myPipeline {
                    val a = 1;
                    out a + 1;
                }
            `,
            targetIndices: [1],
            expectedIndices: [0, 1],
        },
        {
            testName: 'required due to impurity reason (expression statement)',
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
            targetIndices: [1],
            expectedIndices: [0, 1],
        },
        {
            testName: 'required due to impurity reason (output statement)',
            code: `
                package test

                @Impure([ImpurityReason.FileReadFromConstantPath("a.txt")])
                fun fileRead() -> content: String

                @Impure([ImpurityReason.FileWriteToConstantPath("a.txt")])
                fun fileWrite() -> content: String

                pipeline myPipeline {
                    out fileWrite();
                    val a = fileRead();
                }
            `,
            targetIndices: [1],
            expectedIndices: [0, 1],
        },
    ];

    it.each(testCases)('$testName', async ({ code, targetIndices, expectedIndices }) => {
        const pipeline = await getNodeOfType(services, code, isSdsPipeline);
        const statements = getStatements(pipeline.body);
        const targets = targetIndices.map(
            (index) => statements[index] ?? fail(`Target index ${index} is out of bounds.`),
        );

        const backwardSlice = slicer.computeBackwardSliceToTargets(statements, targets);
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
     * The container indices of the target statements.
     */
    targetIndices: number[];

    /**
     * The expected container indices of the statements in the backward slice.
     */
    expectedIndices: number[];
}
