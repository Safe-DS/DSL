import { NodeFileSystem } from 'langium/node';
import { describe, expect, it } from 'vitest';
import { isSdsExpression } from '../../../src/language/generated/ast.js';
import { createSafeDsServicesWithBuiltins } from '../../../src/language/index.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const partialEvaluator = services.evaluation.PartialEvaluator;

describe('SafeDsTypeChecker', async () => {
    const testCases: CanBeValueOfConstantParameterTest[] = [
        {
            code: 'true',
            expected: true,
        },
        {
            code: 'false',
            expected: true,
        },
        {
            code: '1.5',
            expected: true,
        },
        {
            code: '1',
            expected: true,
        },
        {
            code: 'null',
            expected: true,
        },
        {
            code: '"text"',
            expected: true,
        },
        {
            code: 'unresolved()',
            expected: true,
        },
        {
            code: 'MyClass()',
            expected: false,
        },
        {
            code: 'MyEnum.EnumVariantWithoutParameters()',
            expected: true,
        },
        {
            code: 'MyEnum.NormalEnumVariantWithParameters()',
            expected: true,
        },
        {
            code: 'MyEnum.ConstantEnumVariantWithParameters()',
            expected: true,
        },
        {
            code: 'MyEnum.NormalEnumVariantWithParameters(1)',
            expected: true,
        },
        {
            code: 'MyEnum.ConstantEnumVariantWithParameters(1)',
            expected: true,
        },
        {
            code: 'MyEnum.NormalEnumVariantWithParameters([1][0])',
            expected: false,
        },
        {
            code: 'MyEnum.ConstantEnumVariantWithParameters([1][0])',
            expected: false,
        },
        {
            code: '[]',
            expected: true,
        },
        {
            code: '[1]',
            expected: true,
        },
        {
            code: '[1, MyClass()]',
            expected: false,
        },
        {
            code: '{}',
            expected: true,
        },
        {
            code: '{ "key": 1 }',
            expected: true,
        },
        {
            code: '{ "key": MyClass() }',
            expected: false,
        },
        {
            code: '{ MyClass(): 1 }',
            expected: false,
        },
        {
            code: 'Unresolved.a',
            expected: true,
        },
        {
            code: 'MyEnum.Unresolved',
            expected: true,
        },
        {
            code: 'MyClass.a',
            expected: false,
        },
        {
            code: 'MyEnum.EnumVariantWithoutParameters',
            expected: true,
        },
        {
            code: 'MyEnum.NormalEnumVariantWithParameters',
            expected: true,
        },
        {
            code: 'MyEnum.ConstantEnumVariantWithParameters',
            expected: true,
        },
        {
            code: '-1',
            expected: true,
        },
        {
            code: '-[1][0]',
            expected: false,
        },
        {
            code: 'Unresolved',
            expected: true,
        },
        {
            code: 'MyClass',
            expected: false,
        },
        {
            code: '[1][0]',
            expected: false,
        },
    ];

    describe.each(testCases)('canBeValueOfConstantParameter', ({ code, expected }) => {
        it(code, async () => {
            const codeWithContext = `
                class MyClass() {
                    static attr a: Int
                }

                enum MyEnum {
                    EnumVariantWithoutParameters
                    NormalEnumVariantWithParameters(param: Int)
                    ConstantEnumVariantWithParameters(const param: Int)
                }

                pipeline myPipeline {
                    ${code};
                }
            `;

            const expression = await getNodeOfType(services, codeWithContext, isSdsExpression);
            expect(partialEvaluator.canBeValueOfConstantParameter(expression)).toBe(expected);
        });
    });
});

/**
 * A test case for {@link SafeDsPartialEvaluator.canBeValueOfConstantParameter}.
 */
interface CanBeValueOfConstantParameterTest {
    /**
     * The code containing the expression to test.
     */
    code: string;

    /**
     * Whether {@link node} is expected to be usable as the value of a constant parameter.
     */
    expected: boolean;
}
