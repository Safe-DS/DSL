import { NodeFileSystem } from 'langium/node';
import { describe, expect, it } from 'vitest';
import { isSdsClass, isSdsEnum, isSdsEnumVariant, isSdsFunction } from '../../../src/language/generated/ast.js';
import {
    createSafeDsServicesWithBuiltins,
    getParameters,
    getResults,
    getTypeParameters,
} from '../../../src/language/index.js';
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
    TypeParameterSubstitutions,
    TypeParameterType,
    UnionType,
    UnknownType,
} from '../../../src/language/typing/model.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import type { EqualsTest, ToStringTest } from '../../helpers/testDescription.js';
import { expectEqualTypes } from '../../helpers/testAssertions.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const code = `
    fun f1(p1, p2: Int = 0) -> r
    fun f2(),

    class C1
    class C2<K, V>

    enum MyEnum1 {
        MyEnumVariant1
        MyEnumVariant2
    }
    enum MyEnum2 {}
`;
const callable1 = await getNodeOfType(services, code, isSdsFunction, 0);
const parameter1 = getParameters(callable1)[0]!;
const parameter2 = getParameters(callable1)[1]!;
const result = getResults(callable1.resultList)[0]!;
const callable2 = await getNodeOfType(services, code, isSdsFunction, 1);
const class1 = await getNodeOfType(services, code, isSdsClass, 0);
const class2 = await getNodeOfType(services, code, isSdsClass, 1);
const typeParameter1 = getTypeParameters(class2)[0]!;
const typeParameter2 = getTypeParameters(class2)[1]!;
const enum1 = await getNodeOfType(services, code, isSdsEnum, 0);
const enum2 = await getNodeOfType(services, code, isSdsEnum, 1);
const enumVariant1 = await getNodeOfType(services, code, isSdsEnumVariant, 0);
const enumVariant2 = await getNodeOfType(services, code, isSdsEnumVariant, 1);

describe('type model', async () => {
    const equalsTests: EqualsTest<Type>[] = [
        {
            value: () =>
                new CallableType(
                    callable1,
                    undefined,
                    new NamedTupleType(new NamedTupleEntry(parameter1, 'p1', UnknownType)),
                    new NamedTupleType(),
                ),
            unequalValueOfSameType: () =>
                new CallableType(callable2, undefined, new NamedTupleType(), new NamedTupleType()),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => new LiteralType(new BooleanConstant(true)),
            unequalValueOfSameType: () => new LiteralType(new IntConstant(1n)),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => new NamedTupleType(new NamedTupleEntry(parameter1, 'p1', UnknownType)),
            unequalValueOfSameType: () => new NamedTupleType(),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => new ClassType(class1, new Map(), true),
            unequalValueOfSameType: () => new ClassType(class2, new Map(), true),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => new ClassType(class1, new Map(), false),
            unequalValueOfSameType: () => new ClassType(class1, new Map(), true),
        },
        {
            value: () => new ClassType(class2, new Map([[typeParameter1, UnknownType]]), true),
            unequalValueOfSameType: () => new ClassType(class2, new Map([[typeParameter1, new UnionType()]]), true),
        },
        {
            value: () => new ClassType(class2, new Map(), true),
            unequalValueOfSameType: () => new ClassType(class2, new Map([[typeParameter1, new UnionType()]]), true),
        },
        {
            value: () => new EnumType(enum1, true),
            unequalValueOfSameType: () => new EnumType(enum2, true),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => new EnumVariantType(enumVariant1, true),
            unequalValueOfSameType: () => new EnumVariantType(enumVariant2, true),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => new TypeParameterType(typeParameter1, true),
            unequalValueOfSameType: () => new TypeParameterType(typeParameter2, true),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => new StaticType(new ClassType(class1, new Map(), false)),
            unequalValueOfSameType: () => new StaticType(new ClassType(class2, new Map(), false)),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => new UnionType(UnknownType),
            unequalValueOfSameType: () => new UnionType(),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => UnknownType,
            valueOfOtherType: () => new UnionType(),
        },
    ];
    describe.each(equalsTests)('equals', ({ value, unequalValueOfSameType, valueOfOtherType }) => {
        it(`should return true if both types are the same instance (${value().constructor.name})`, () => {
            const typeInstance = value();
            expect(typeInstance.equals(typeInstance)).toBeTruthy();
        });

        it(`should return true if both types have the same values (${value().constructor.name})`, () => {
            expect(value().equals(value())).toBeTruthy();
        });

        if (unequalValueOfSameType) {
            it(`should return false if both types have different values (${value().constructor.name})`, () => {
                expect(value().equals(unequalValueOfSameType())).toBeFalsy();
            });
        }

        if (valueOfOtherType) {
            it(`should return false if the other type is an instance of another class (${
                value().constructor.name
            })`, () => {
                expect(value().equals(valueOfOtherType())).toBeFalsy();
            });
        }
    });

    const toStringTests: ToStringTest<Type>[] = [
        {
            value: new CallableType(
                callable1,
                undefined,
                new NamedTupleType(new NamedTupleEntry(parameter1, 'p1', UnknownType)),
                new NamedTupleType(),
            ),
            expectedString: '(p1: $unknown) -> ()',
        },
        {
            value: new CallableType(
                callable1,
                undefined,
                new NamedTupleType(new NamedTupleEntry(parameter2, 'p2', UnknownType)),
                new NamedTupleType(),
            ),
            expectedString: '(p2?: $unknown) -> ()',
        },
        {
            value: new LiteralType(new BooleanConstant(true)),
            expectedString: 'literal<true>',
        },
        {
            value: new NamedTupleType(new NamedTupleEntry(parameter1, 'p1', UnknownType)),
            expectedString: '(p1: $unknown)',
        },
        {
            value: new ClassType(class1, new Map(), false),
            expectedString: 'C1',
        },
        {
            value: new ClassType(class1, new Map(), true),
            expectedString: 'C1?',
        },
        {
            value: new ClassType(class2, new Map([[typeParameter1, new UnionType()]]), true),
            expectedString: 'C2<union<>>?',
        },
        {
            value: new EnumType(enum1, false),
            expectedString: 'MyEnum1',
        },
        {
            value: new EnumType(enum1, true),
            expectedString: 'MyEnum1?',
        },
        {
            value: new EnumVariantType(enumVariant1, false),
            expectedString: 'MyEnumVariant1',
        },
        {
            value: new EnumVariantType(enumVariant1, true),
            expectedString: 'MyEnumVariant1?',
        },
        {
            value: new TypeParameterType(typeParameter1, false),
            expectedString: 'K',
        },
        {
            value: new TypeParameterType(typeParameter1, true),
            expectedString: 'K?',
        },
        {
            value: new StaticType(new ClassType(class1, new Map(), false)),
            expectedString: '$type<C1>',
        },
        {
            value: new UnionType(UnknownType),
            expectedString: 'union<$unknown>',
        },
        {
            value: UnknownType,
            expectedString: '$unknown',
        },
    ];
    describe.each(toStringTests)('toString', ({ value, expectedString }) => {
        it(`should return the expected string representation (${value.constructor.name} -- ${value})`, () => {
            expect(value.toString()).toStrictEqual(expectedString);
        });
    });

    const substitutions1 = new Map([[typeParameter1, new LiteralType(new IntConstant(1n))]]);
    const substituteTypeParametersTest: SubstituteTypeParametersTest[] = [
        {
            type: new CallableType(
                callable1,
                undefined,
                new NamedTupleType(new NamedTupleEntry(parameter1, 'p1', new TypeParameterType(typeParameter1, false))),
                new NamedTupleType(new NamedTupleEntry(result, 'r', new TypeParameterType(typeParameter1, false))),
            ),
            substitutions: substitutions1,
            expectedType: new CallableType(
                callable1,
                undefined,
                new NamedTupleType(new NamedTupleEntry(parameter1, 'p1', new LiteralType(new IntConstant(1n)))),
                new NamedTupleType(new NamedTupleEntry(result, 'r', new LiteralType(new IntConstant(1n)))),
            ),
        },
        {
            type: new LiteralType(new BooleanConstant(true)),
            substitutions: substitutions1,
            expectedType: new LiteralType(new BooleanConstant(true)),
        },
        {
            type: new NamedTupleType(
                new NamedTupleEntry(parameter1, 'p1', new TypeParameterType(typeParameter1, false)),
            ),
            substitutions: substitutions1,
            expectedType: new NamedTupleType(
                new NamedTupleEntry(parameter1, 'p1', new LiteralType(new IntConstant(1n))),
            ),
        },
        {
            type: new ClassType(
                class1,
                new Map([[typeParameter2, new TypeParameterType(typeParameter1, false)]]),
                false,
            ),
            substitutions: substitutions1,
            expectedType: new ClassType(
                class1,
                new Map([[typeParameter2, new LiteralType(new IntConstant(1n))]]),
                false,
            ),
        },
        {
            type: new EnumType(enum1, false),
            substitutions: substitutions1,
            expectedType: new EnumType(enum1, false),
        },
        {
            type: new EnumVariantType(enumVariant1, false),
            substitutions: substitutions1,
            expectedType: new EnumVariantType(enumVariant1, false),
        },
        {
            type: new TypeParameterType(typeParameter1, false),
            substitutions: substitutions1,
            expectedType: new LiteralType(new IntConstant(1n)),
        },
        {
            type: new TypeParameterType(typeParameter1, true),
            substitutions: substitutions1,
            expectedType: new LiteralType(new IntConstant(1n), NullConstant),
        },
        {
            type: new TypeParameterType(typeParameter2, false),
            substitutions: substitutions1,
            expectedType: new TypeParameterType(typeParameter2, false),
        },
        {
            type: new StaticType(
                new ClassType(class1, new Map([[typeParameter1, new TypeParameterType(typeParameter2, false)]]), false),
            ),
            substitutions: substitutions1,
            expectedType: new StaticType(
                new ClassType(class1, new Map([[typeParameter1, new TypeParameterType(typeParameter2, false)]]), false),
            ),
        },
        {
            type: new UnionType(
                new ClassType(class1, new Map([[typeParameter2, new TypeParameterType(typeParameter1, false)]]), false),
            ),
            substitutions: substitutions1,
            expectedType: new UnionType(
                new ClassType(class1, new Map([[typeParameter2, new LiteralType(new IntConstant(1n))]]), false),
            ),
        },
        {
            type: UnknownType,
            substitutions: substitutions1,
            expectedType: UnknownType,
        },
    ];
    describe.each(substituteTypeParametersTest)('substituteTypeParameters', ({ type, substitutions, expectedType }) => {
        it(`should return the expected value (${type.constructor.name} -- ${type})`, () => {
            const actual = type.substituteTypeParameters(substitutions);
            expectEqualTypes(actual, expectedType);
        });

        it(`should not change if no substitutions are passed (${type.constructor.name} -- ${type})`, () => {
            const actual = type.substituteTypeParameters(new Map());
            expectEqualTypes(actual, type);
        });
    });

    const unwrapTests: UnwrapTest[] = [
        {
            type: new CallableType(callable1, undefined, new NamedTupleType(), new NamedTupleType()),
            expectedType: new CallableType(callable1, undefined, new NamedTupleType(), new NamedTupleType()),
        },
        {
            type: new CallableType(
                callable1,
                undefined,
                new NamedTupleType(new NamedTupleEntry(parameter1, 'p1', new UnionType(UnknownType))),
                new NamedTupleType(new NamedTupleEntry(result, 'r', new UnionType(UnknownType))),
            ),
            expectedType: new CallableType(
                callable1,
                undefined,
                new NamedTupleType(new NamedTupleEntry(parameter1, 'p1', UnknownType)),
                new NamedTupleType(new NamedTupleEntry(result, 'r', UnknownType)),
            ),
        },
        {
            type: new LiteralType(new BooleanConstant(true)),
            expectedType: new LiteralType(new BooleanConstant(true)),
        },
        {
            type: new NamedTupleType(),
            expectedType: new NamedTupleType(),
        },
        {
            type: new NamedTupleType(
                new NamedTupleEntry(parameter1, 'p1', new UnionType(UnknownType)),
                new NamedTupleEntry(parameter1, 'p1', new UnionType(UnknownType)),
            ),
            expectedType: new NamedTupleType(
                new NamedTupleEntry(parameter1, 'p1', UnknownType),
                new NamedTupleEntry(parameter1, 'p1', UnknownType),
            ),
        },
        {
            type: new ClassType(class1, new Map(), false),
            expectedType: new ClassType(class1, new Map(), false),
        },
        {
            type: new ClassType(class1, new Map([[typeParameter1, new UnionType(UnknownType)]]), false),
            expectedType: new ClassType(class1, new Map([[typeParameter1, UnknownType]]), false),
        },
        {
            type: new EnumType(enum1, false),
            expectedType: new EnumType(enum1, false),
        },
        {
            type: new EnumVariantType(enumVariant1, false),
            expectedType: new EnumVariantType(enumVariant1, false),
        },
        {
            type: new TypeParameterType(typeParameter1, false),
            expectedType: new TypeParameterType(typeParameter1, false),
        },
        {
            type: new StaticType(new ClassType(class1, new Map(), false)),
            expectedType: new StaticType(new ClassType(class1, new Map(), false)),
        },
        {
            type: new UnionType(),
            expectedType: new UnionType(),
        },
        {
            type: new UnionType(new ClassType(class1, new Map(), false)),
            expectedType: new ClassType(class1, new Map(), false),
        },
        {
            type: new UnionType(new UnionType(new ClassType(class1, new Map(), false))),
            expectedType: new ClassType(class1, new Map(), false),
        },
        {
            type: new UnionType(
                new UnionType(new ClassType(class1, new Map(), false), new ClassType(class2, new Map(), false)),
                new UnionType(new EnumType(enum1, false), new EnumVariantType(enumVariant1, false)),
            ),
            expectedType: new UnionType(
                new ClassType(class1, new Map(), false),
                new ClassType(class2, new Map(), false),
                new EnumType(enum1, false),
                new EnumVariantType(enumVariant1, false),
            ),
        },
        {
            type: UnknownType,
            expectedType: UnknownType,
        },
    ];
    describe.each(unwrapTests)('unwrap', ({ type, expectedType }) => {
        it(`should remove any unnecessary containers (${type.constructor.name} -- ${type})`, () => {
            const actual = type.unwrap();
            expectEqualTypes(actual, expectedType);
        });
    });

    const updateNullabilityTests: UpdateNullabilityTest[] = [
        {
            type: new CallableType(callable1, undefined, new NamedTupleType(), new NamedTupleType()),
            isNullable: true,
            expectedType: new UnionType(
                new CallableType(callable1, undefined, new NamedTupleType(), new NamedTupleType()),
                new LiteralType(NullConstant),
            ),
        },
        {
            type: new CallableType(callable1, undefined, new NamedTupleType(), new NamedTupleType()),
            isNullable: false,
            expectedType: new CallableType(callable1, undefined, new NamedTupleType(), new NamedTupleType()),
        },
        {
            type: new LiteralType(new BooleanConstant(true)),
            isNullable: true,
            expectedType: new LiteralType(new BooleanConstant(true), NullConstant),
        },
        {
            type: new LiteralType(new BooleanConstant(true), NullConstant),
            isNullable: false,
            expectedType: new LiteralType(new BooleanConstant(true)),
        },
        {
            type: new LiteralType(new BooleanConstant(true), NullConstant),
            isNullable: true,
            expectedType: new LiteralType(new BooleanConstant(true), NullConstant),
        },
        {
            type: new LiteralType(new BooleanConstant(true)),
            isNullable: false,
            expectedType: new LiteralType(new BooleanConstant(true)),
        },
        {
            type: new NamedTupleType(),
            isNullable: true,
            expectedType: new UnionType(new NamedTupleType(), new LiteralType(NullConstant)),
        },
        {
            type: new NamedTupleType(),
            isNullable: false,
            expectedType: new NamedTupleType(),
        },
        {
            type: new ClassType(class1, new Map(), false),
            isNullable: true,
            expectedType: new ClassType(class1, new Map(), true),
        },
        {
            type: new ClassType(class1, new Map(), true),
            isNullable: false,
            expectedType: new ClassType(class1, new Map(), false),
        },
        {
            type: new EnumType(enum1, false),
            isNullable: true,
            expectedType: new EnumType(enum1, true),
        },
        {
            type: new EnumType(enum1, true),
            isNullable: false,
            expectedType: new EnumType(enum1, false),
        },
        {
            type: new EnumVariantType(enumVariant1, false),
            isNullable: true,
            expectedType: new EnumVariantType(enumVariant1, true),
        },
        {
            type: new EnumVariantType(enumVariant1, true),
            isNullable: false,
            expectedType: new EnumVariantType(enumVariant1, false),
        },
        {
            type: new StaticType(new ClassType(class1, new Map(), false)),
            isNullable: true,
            expectedType: new UnionType(
                new StaticType(new ClassType(class1, new Map(), false)),
                new LiteralType(NullConstant),
            ),
        },
        {
            type: new StaticType(new ClassType(class1, new Map(), false)),
            isNullable: false,
            expectedType: new StaticType(new ClassType(class1, new Map(), false)),
        },
        {
            type: new TypeParameterType(typeParameter1, false),
            isNullable: true,
            expectedType: new TypeParameterType(typeParameter1, true),
        },
        {
            type: new TypeParameterType(typeParameter1, true),
            isNullable: false,
            expectedType: new TypeParameterType(typeParameter1, false),
        },
        {
            type: new UnionType(),
            isNullable: true,
            expectedType: new LiteralType(NullConstant),
        },
        {
            type: new UnionType(),
            isNullable: false,
            expectedType: new UnionType(),
        },
        {
            type: new UnionType(new ClassType(class1, new Map(), false)),
            isNullable: true,
            expectedType: new UnionType(new ClassType(class1, new Map(), true)),
        },
        {
            type: new UnionType(new ClassType(class1, new Map(), false)),
            isNullable: false,
            expectedType: new UnionType(new ClassType(class1, new Map(), false)),
        },
        {
            type: new UnionType(new ClassType(class1, new Map(), true)),
            isNullable: true,
            expectedType: new UnionType(new ClassType(class1, new Map(), true)),
        },
        {
            type: new UnionType(new ClassType(class1, new Map(), true)),
            isNullable: false,
            expectedType: new UnionType(new ClassType(class1, new Map(), false)),
        },
        {
            type: UnknownType,
            isNullable: true,
            expectedType: UnknownType,
        },
        {
            type: UnknownType,
            isNullable: false,
            expectedType: UnknownType,
        },
    ];
    describe.each(updateNullabilityTests)('updateNullability', ({ type, isNullable, expectedType }) => {
        it(`should return the expected value (${type.constructor.name} -- ${type})`, () => {
            const actual = type.updateNullability(isNullable);
            expectEqualTypes(actual, expectedType);
        });
    });

    describe('CallableType', () => {
        describe('getParameterTypeByIndex', () => {
            it.each([
                {
                    type: new CallableType(callable1, undefined, new NamedTupleType(), new NamedTupleType()),
                    index: 0,
                    expectedType: UnknownType,
                },
                {
                    type: new CallableType(
                        callable1,
                        undefined,
                        new NamedTupleType(
                            new NamedTupleEntry(parameter1, 'p1', new ClassType(class1, new Map(), false)),
                        ),
                        new NamedTupleType(),
                    ),
                    index: 0,
                    expectedType: new ClassType(class1, new Map(), false),
                },
            ])('should return the type of the parameter at the given index (%#)', ({ type, index, expectedType }) => {
                const actual = type.getParameterTypeByIndex(index);
                expectEqualTypes(actual, expectedType);
            });
        });
    });

    describe('ClassType', () => {
        describe('getTypeParameterTypeByIndex', () => {
            it.each([
                {
                    type: new ClassType(class1, new Map(), false),
                    index: 0,
                    expectedType: UnknownType,
                },
                {
                    type: new ClassType(class2, new Map([[typeParameter1, new UnionType()]]), false),
                    index: 0,
                    expectedType: new UnionType(),
                },
            ])('should return the type of the parameter at the given index (%#)', ({ type, index, expectedType }) => {
                const actual = type.getTypeParameterTypeByIndex(index);
                expectEqualTypes(actual, expectedType);
            });
        });
    });

    describe('NamedTupleType', () => {
        describe('getTypeOfEntryByIndex', () => {
            it.each([
                {
                    type: new NamedTupleType(),
                    index: 0,
                    expectedType: UnknownType,
                },
                {
                    type: new NamedTupleType(
                        new NamedTupleEntry(parameter1, 'p1', new ClassType(class1, new Map(), false)),
                    ),
                    index: 0,
                    expectedType: new ClassType(class1, new Map(), false),
                },
            ])('should return the entry at the given index (%#)', ({ type, index, expectedType }) => {
                const actual = type.getTypeOfEntryByIndex(index);
                expectEqualTypes(actual, expectedType);
            });
        });
    });
});

/**
 * Tests for {@link Type.substituteTypeParameters}.
 */
interface SubstituteTypeParametersTest {
    /**
     * The type to test.
     */
    type: Type;

    /**
     * The type parameter substitutions to apply.
     */
    substitutions: TypeParameterSubstitutions;

    /**
     * The expected result.
     */
    expectedType: Type;
}

/**
 * Tests for {@link Type.unwrap}.
 */
interface UnwrapTest {
    /**
     * The type to test.
     */
    type: Type;

    /**
     * The expected result.
     */
    expectedType: Type;
}

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
    expectedType: Type;
}
