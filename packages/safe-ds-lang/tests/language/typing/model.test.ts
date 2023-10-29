import { NodeFileSystem } from 'langium/node';
import { describe, expect, it } from 'vitest';
import { isSdsClass, isSdsEnum, isSdsEnumVariant, isSdsFunction } from '../../../src/language/generated/ast.js';
import { getParameters } from '../../../src/language/helpers/nodeProperties.js';
import { createSafeDsServicesWithBuiltins } from '../../../src/language/index.js';
import { BooleanConstant, IntConstant, NullConstant } from '../../../src/language/partialEvaluation/model.js';
import {
    CallableType,
    ClassType,
    EnumType,
    EnumVariantType,
    LiteralType,
    NamedTupleEntry,
    NamedTupleType,
    StaticType,
    Type,
    UnionType,
    UnknownType,
} from '../../../src/language/typing/model.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const code = `
    fun f1(p)
    fun f2(),

    class C1
    class C2

    enum MyEnum1 {
        MyEnumVariant1
        MyEnumVariant2
    }
    enum MyEnum2 {}
`;
const callable1 = await getNodeOfType(services, code, isSdsFunction, 0);
const parameter = getParameters(callable1)[0]!;
const callable2 = await getNodeOfType(services, code, isSdsFunction, 1);
const class1 = await getNodeOfType(services, code, isSdsClass, 0);
const class2 = await getNodeOfType(services, code, isSdsClass, 1);
const enum1 = await getNodeOfType(services, code, isSdsEnum, 0);
const enum2 = await getNodeOfType(services, code, isSdsEnum, 1);
const enumVariant1 = await getNodeOfType(services, code, isSdsEnumVariant, 0);
const enumVariant2 = await getNodeOfType(services, code, isSdsEnumVariant, 1);

describe('type model', async () => {
    const equalsTests: EqualsTest<Type>[] = [
        {
            type: () =>
                new CallableType(
                    callable1,
                    new NamedTupleType([new NamedTupleEntry(parameter, 'p', UnknownType)]),
                    new NamedTupleType([]),
                ),
            unequalTypeOfSameType: () => new CallableType(callable2, new NamedTupleType([]), new NamedTupleType([])),
            typeOfOtherType: () => UnknownType,
        },
        {
            type: () => new LiteralType([new BooleanConstant(true)]),
            unequalTypeOfSameType: () => new LiteralType([new IntConstant(1n)]),
            typeOfOtherType: () => UnknownType,
        },
        {
            type: () => new NamedTupleType([new NamedTupleEntry(parameter, 'p', UnknownType)]),
            unequalTypeOfSameType: () => new NamedTupleType([]),
            typeOfOtherType: () => UnknownType,
        },
        {
            type: () => new ClassType(class1, true),
            unequalTypeOfSameType: () => new ClassType(class2, true),
            typeOfOtherType: () => UnknownType,
        },
        {
            type: () => new EnumType(enum1, true),
            unequalTypeOfSameType: () => new EnumType(enum2, true),
            typeOfOtherType: () => UnknownType,
        },
        {
            type: () => new EnumVariantType(enumVariant1, true),
            unequalTypeOfSameType: () => new EnumVariantType(enumVariant2, true),
            typeOfOtherType: () => UnknownType,
        },
        {
            type: () => new StaticType(new ClassType(class1, false)),
            unequalTypeOfSameType: () => new StaticType(new ClassType(class2, false)),
            typeOfOtherType: () => UnknownType,
        },
        {
            type: () => new UnionType([UnknownType]),
            unequalTypeOfSameType: () => new UnionType([]),
            typeOfOtherType: () => UnknownType,
        },
        {
            type: () => UnknownType,
            typeOfOtherType: () => new UnionType([]),
        },
    ];
    describe.each(equalsTests)('equals', ({ type, unequalTypeOfSameType, typeOfOtherType }) => {
        it(`should return true if both types are the same instance (${type().constructor.name})`, () => {
            const typeInstance = type();
            expect(typeInstance.equals(typeInstance)).toBeTruthy();
        });

        it(`should return false if the other type is an instance of another class (${type().constructor.name})`, () => {
            expect(type().equals(typeOfOtherType())).toBeFalsy();
        });

        it(`should return true if both types have the same values (${type().constructor.name})`, () => {
            expect(type().equals(type())).toBeTruthy();
        });

        if (unequalTypeOfSameType) {
            it(`should return false if both types have different values (${type().constructor.name})`, () => {
                expect(type().equals(unequalTypeOfSameType())).toBeFalsy();
            });
        }
    });

    const toStringTests: ToStringTest<Type>[] = [
        {
            type: new CallableType(
                callable1,
                new NamedTupleType([new NamedTupleEntry(parameter, 'p', UnknownType)]),
                new NamedTupleType([]),
            ),
            expectedString: '(p: ?) -> ()',
        },
        {
            type: new LiteralType([new BooleanConstant(true)]),
            expectedString: 'literal<true>',
        },
        {
            type: new NamedTupleType([new NamedTupleEntry(parameter, 'p', UnknownType)]),
            expectedString: '(p: ?)',
        },
        {
            type: new ClassType(class1, true),
            expectedString: 'C1?',
        },
        {
            type: new EnumType(enum1, true),
            expectedString: 'MyEnum1?',
        },
        {
            type: new EnumVariantType(enumVariant1, true),
            expectedString: 'MyEnumVariant1?',
        },
        {
            type: new StaticType(new ClassType(class1, false)),
            expectedString: '$type<C1>',
        },
        {
            type: new UnionType([UnknownType]),
            expectedString: 'union<?>',
        },
        {
            type: UnknownType,
            expectedString: '?',
        },
    ];
    describe.each(toStringTests)('toString', ({ type, expectedString }) => {
        it(`should return the expected string representation (${type.constructor.name} -- ${type})`, () => {
            expect(type.toString()).toStrictEqual(expectedString);
        });
    });

    const updateNullabilityTest: UpdateNullabilityTest[] = [
        {
            type: new CallableType(callable1, new NamedTupleType([]), new NamedTupleType([])),
            isNullable: true,
            expectedCopy: new CallableType(callable1, new NamedTupleType([]), new NamedTupleType([])),
        },
        {
            type: new LiteralType([new BooleanConstant(true)]),
            isNullable: true,
            expectedCopy: new LiteralType([new BooleanConstant(true), NullConstant]),
        },
        {
            type: new LiteralType([new BooleanConstant(true), NullConstant]),
            isNullable: false,
            expectedCopy: new LiteralType([new BooleanConstant(true)]),
        },
        {
            type: new LiteralType([new BooleanConstant(true), NullConstant]),
            isNullable: true,
            expectedCopy: new LiteralType([new BooleanConstant(true), NullConstant]),
        },
        {
            type: new LiteralType([new BooleanConstant(true)]),
            isNullable: false,
            expectedCopy: new LiteralType([new BooleanConstant(true)]),
        },
        {
            type: new NamedTupleType([]),
            isNullable: true,
            expectedCopy: new NamedTupleType([]),
        },
        {
            type: new ClassType(class1, false),
            isNullable: true,
            expectedCopy: new ClassType(class1, true),
        },
        {
            type: new ClassType(class1, true),
            isNullable: false,
            expectedCopy: new ClassType(class1, false),
        },
        {
            type: new EnumType(enum1, false),
            isNullable: true,
            expectedCopy: new EnumType(enum1, true),
        },
        {
            type: new EnumType(enum1, true),
            isNullable: false,
            expectedCopy: new EnumType(enum1, false),
        },
        {
            type: new EnumVariantType(enumVariant1, false),
            isNullable: true,
            expectedCopy: new EnumVariantType(enumVariant1, true),
        },
        {
            type: new EnumVariantType(enumVariant1, true),
            isNullable: false,
            expectedCopy: new EnumVariantType(enumVariant1, false),
        },
        {
            type: new StaticType(new ClassType(class1, false)),
            isNullable: true,
            expectedCopy: new StaticType(new ClassType(class1, false)),
        },
        {
            type: new UnionType([]),
            isNullable: false,
            expectedCopy: new UnionType([]),
        },
        {
            type: UnknownType,
            isNullable: true,
            expectedCopy: UnknownType,
        },
    ];
    describe.each(updateNullabilityTest)('updateNullability', ({ type, isNullable, expectedCopy }) => {
        it(`should return the expected value (${type.constructor.name} -- ${type})`, () => {
            expect(type.updateNullability(isNullable).equals(expectedCopy)).toBeTruthy();
        });
    });

    describe('CallableType', () => {
        describe('getParameterTypeByIndex', () => {
            it.each([
                {
                    type: new CallableType(callable1, new NamedTupleType([]), new NamedTupleType([])),
                    index: 0,
                    expectedType: UnknownType,
                },
                {
                    type: new CallableType(
                        callable1,
                        new NamedTupleType([new NamedTupleEntry(parameter, 'p', new ClassType(class1, false))]),
                        new NamedTupleType([]),
                    ),
                    index: 0,
                    expectedType: new ClassType(class1, false),
                },
            ])('should return the type of the parameter at the given index (%#)', ({ type, index, expectedType }) => {
                expect(type.getParameterTypeByIndex(index).equals(expectedType)).toBeTruthy();
            });
        });
    });

    describe('NamedTupleType', () => {
        describe('getTypeOfEntryByIndex', () => {
            it.each([
                {
                    type: new NamedTupleType([]),
                    index: 0,
                    expectedType: UnknownType,
                },
                {
                    type: new NamedTupleType([new NamedTupleEntry(parameter, 'p', new ClassType(class1, false))]),
                    index: 0,
                    expectedType: new ClassType(class1, false),
                },
            ])('should return the entry at the given index (%#)', ({ type, index, expectedType }) => {
                expect(type.getTypeOfEntryByIndex(index).equals(expectedType)).toBeTruthy();
            });
        });

        describe('unwrap', () => {
            it.each([
                {
                    type: new NamedTupleType([]),
                    expectedType: new NamedTupleType([]),
                },
                {
                    type: new NamedTupleType([new NamedTupleEntry(parameter, 'p', UnknownType)]),
                    expectedType: UnknownType,
                },
                {
                    type: new NamedTupleType([
                        new NamedTupleEntry(parameter, 'p', UnknownType),
                        new NamedTupleEntry(parameter, 'p', UnknownType),
                    ]),
                    expectedType: new NamedTupleType([
                        new NamedTupleEntry(parameter, 'p', UnknownType),
                        new NamedTupleEntry(parameter, 'p', UnknownType),
                    ]),
                },
            ])('should return the expected type (%#)', ({ type, expectedType }) => {
                expect(type.unwrap().equals(expectedType)).toBeTruthy();
            });
        });
    });
});

/**
 * Tests for {@link Type.updateNullability}.
 */
interface UpdateNullabilityTest {
    /**
     * The type to test.
     */
    type: Type;

    /**
     * The new nullability.
     */
    isNullable: boolean;

    /**
     * The expected result.
     */
    expectedCopy: Type;
}

/**
 * Tests for {@link Type.equals}.
 */
interface EqualsTest<T extends Type> {
    /**
     * Produces the first type to compare, which must not be equal to {@link unequalTypeOfSameType}.
     */
    type: () => T;

    /**
     * Produces the second type to compare, which must not be equal to {@link type}. If the type is a singleton, leave
     * this field undefined.
     */
    unequalTypeOfSameType?: () => T;

    /**
     * Produces a type of a different type.
     */
    typeOfOtherType: () => Type;
}

/**
 * Tests for {@link Type.toString}.
 */
interface ToStringTest<T extends Type> {
    /**
     * The type to convert to a string.
     */
    type: T;

    /**
     * The expected string representation of the type.
     */
    expectedString: string;
}
