import { describe, expect, it } from 'vitest';
import { createSafeDsServices } from '../../../../src/language/index.js';
import { EmptyFileSystem } from 'langium';
import { isSdsOutputStatement } from '../../../../src/language/generated/ast.js';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';

const services = (await createSafeDsServices(EmptyFileSystem, { omitBuiltins: true })).SafeDs;
const syntheticProperties = services.helpers.SyntheticProperties;

describe('SafeDsSyntheticProperties', () => {
    describe('getValueNamesForExpression', () => {
        const tests: GetValueNamesForExpressionTest[] = [
            {
                testName: 'literal',
                code: `
                    pipeline myPipeline {
                        out 1;
                    }
                `,
                expected: ['expression'],
            },
            {
                testName: 'reference',
                code: `
                    pipeline myPipeline {
                        val a = 1;
                        out a;
                    }
                `,
                expected: ['a'],
            },
            {
                testName: 'member access',
                code: `
                    class C {
                        attr a;
                    }

                    pipeline myPipeline {
                        out C().a;
                    }
                `,
                expected: ['a'],
            },
            {
                testName: 'call to block lambda',
                code: `
                    pipeline myPipeline {
                        val lambda = () {
                             yield a = 1;
                             yield b = 2;
                        };
                        out lambda();
                    }
                `,
                expected: ['a', 'b'],
            },
            {
                testName: 'call to callable type',
                code: `
                    segment mySegment(f: () -> (a: Int, b: Int)) {
                        out f();
                    }
                `,
                expected: ['a', 'b'],
            },
            {
                testName: 'call to class',
                code: `
                    class C

                    pipeline myPipeline {
                        out C();
                    }
                `,
                expected: ['C'],
            },
            {
                testName: 'call to enum variant',
                code: `
                    enum E {
                        V
                    }

                    pipeline myPipeline {
                        out E.V();
                    }
                `,
                expected: ['V'],
            },
            {
                testName: 'call to expression lambda',
                code: `
                    pipeline myPipeline {
                        val lambda = () -> 1;
                        out lambda();
                    }
                `,
                expected: ['result'],
            },
            {
                testName: 'call to function',
                code: `
                    fun f() -> (a: Int, b: Int)

                    pipeline myPipeline {
                        out f();
                    }
                `,
                expected: ['a', 'b'],
            },
            {
                testName: 'call to segment',
                code: `
                    segment s() -> (a: Int, b: Int) {}

                    pipeline myPipeline {
                        out s();
                    }
                `,
                expected: ['a', 'b'],
            },
        ];

        it.each(tests)('$testName', async ({ code, expected }) => {
            const outputStatement = await getNodeOfType(services, code, isSdsOutputStatement);
            const actual = syntheticProperties.getValueNamesForExpression(outputStatement.expression);

            expect(actual).toStrictEqual(expected);
        });
    });
});

/**
 * A test for {@link SafeDsSyntheticProperties.getValueNamesForExpression}.
 */
interface GetValueNamesForExpressionTest {
    /**
     * The name of the test.
     */
    testName: string;

    /**
     * The code to test. It must contain exactly one output statement.
     */
    code: string;

    /**
     * The expected value names.
     */
    expected: string[];
}
