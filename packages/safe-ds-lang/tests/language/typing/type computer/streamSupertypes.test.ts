import { NodeFileSystem } from 'langium/node';
import { describe, expect, it } from 'vitest';
import { createSafeDsServicesWithBuiltins } from '../../../../src/language/index.js';
import { ClassType } from '../../../../src/language/typing/model.js';
import { isSdsAttribute } from '../../../../src/language/generated/ast.js';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';
import { AssertionError } from 'assert';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const typeComputer = services.types.TypeComputer;

describe('streamProperSupertypes', async () => {
    const properSupertypesAsStrings = (type: ClassType | undefined) =>
        typeComputer
            .streamProperSupertypes(type)
            .map((clazz) => clazz.toString())
            .toArray();

    it('should return an empty stream if passed undefined', () => {
        expect(properSupertypesAsStrings(undefined)).toStrictEqual([]);
    });

    const testCases = [
        {
            testName: 'should return "Any" if the class has no parent types',
            code: `
                    class Test {
                        attr a: A<Int>
                    }

                    class A<T>
                `,
            expected: ['Any'],
        },
        {
            testName: 'should return "Any" if the first parent type is not a class',
            code: `
                    class Test {
                        attr a: A<Int>
                    }

                    class A<T> sub E
                    enum E
                `,
            expected: ['Any'],
        },
        {
            testName: 'should return the superclasses of a class (no cycle, parameterized parent type, implicit any)',
            code: `
                    class Test {
                        attr a: A<Int>
                    }

                    class A<T> sub B<T>
                    class B<T>
                `,
            expected: ['B<Int>', 'Any'],
        },
        {
            testName: 'should return the superclasses of a class (no cycle, fixed parent type, implicit any)',
            code: `
                    class Test {
                        attr a: A<Int>
                    }

                    class A<T> sub B<String>
                    class B<T>
                `,
            expected: ['B<String>', 'Any'],
        },
        {
            testName: 'should return the superclasses of a class (no cycle, explicit any)',
            code: `
                    class Test {
                        attr a: A<Int>
                    }

                    class A<T> sub Any
                `,
            expected: ['Any'],
        },
        {
            testName: 'should return the superclasses of a class (cycle)',
            code: `
                    class Test {
                        attr a: A<Int>
                    }

                    class A<T> sub B
                    class B sub C
                    class C sub A<Int>
                `,
            expected: ['B', 'C', 'Any'],
        },
        {
            testName: 'should only consider the first parent type',
            code: `
                    class Test {
                        attr a: A<Int>
                    }

                    class A<T> sub B, C
                    class B
                    class C
                `,
            expected: ['B', 'Any'],
        },
        {
            testName: 'should consider the nullability of the parent type',
            code: `
                    class Test {
                        attr a: A
                    }

                    class A sub B?
                    class B
            `,
            expected: ['B?', 'Any?'],
        },
        {
            testName: 'should consider the nullability of the start type',
            code: `
                    class Test {
                        attr a: A?
                    }

                    class A sub B
                    class B
            `,
            expected: ['B?', 'Any?'],
        },
    ];

    it.each(testCases)('$testName', async ({ code, expected }) => {
        const firstAttribute = await getNodeOfType(services, code, isSdsAttribute);
        const type = typeComputer.computeType(firstAttribute);
        if (!(type instanceof ClassType)) {
            throw new AssertionError({ message: 'Expected type to be an instance of ClassType.', actual: type });
        }

        expect(properSupertypesAsStrings(type)).toStrictEqual(expected);
    });
});
