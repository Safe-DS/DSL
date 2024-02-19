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
    ClassType,
    EnumType,
    EnumVariantType,
    NamedTupleEntry,
    Type,
    TypeParameterSubstitutions,
    TypeParameterType,
    UnknownType,
} from '../../../src/language/typing/model.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import type { EqualsTest, ToStringTest } from '../../helpers/testDescription.js';
import { expectEqualTypes } from '../../helpers/testAssertions.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const coreTypes = services.types.CoreTypes;
const factory = services.types.TypeFactory;

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
                factory.createCallableType(
                    callable1,
                    undefined,
                    factory.createNamedTupleType(new NamedTupleEntry(parameter1, 'p1', UnknownType)),
                    factory.createNamedTupleType(),
                ),
            unequalValueOfSameType: () =>
                factory.createCallableType(
                    callable2,
                    undefined,
                    factory.createNamedTupleType(),
                    factory.createNamedTupleType(),
                ),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => factory.createIntersectionType(UnknownType),
            unequalValueOfSameType: () => factory.createIntersectionType(),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => factory.createLiteralType(new BooleanConstant(true)),
            unequalValueOfSameType: () => factory.createLiteralType(new IntConstant(1n)),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => factory.createNamedTupleType(new NamedTupleEntry(parameter1, 'p1', UnknownType)),
            unequalValueOfSameType: () => factory.createNamedTupleType(),
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
            unequalValueOfSameType: () =>
                new ClassType(class2, new Map([[typeParameter1, factory.createUnionType()]]), true),
        },
        {
            value: () => new ClassType(class2, new Map(), true),
            unequalValueOfSameType: () =>
                new ClassType(class2, new Map([[typeParameter1, factory.createUnionType()]]), true),
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
            value: () => factory.createStaticType(new ClassType(class1, new Map(), false)),
            unequalValueOfSameType: () => factory.createStaticType(new ClassType(class2, new Map(), false)),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => factory.createUnionType(UnknownType),
            unequalValueOfSameType: () => factory.createUnionType(),
            valueOfOtherType: () => UnknownType,
        },
        {
            value: () => UnknownType,
            valueOfOtherType: () => factory.createUnionType(),
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
            value: factory.createCallableType(
                callable1,
                undefined,
                factory.createNamedTupleType(new NamedTupleEntry(parameter1, 'p1', UnknownType)),
                factory.createNamedTupleType(),
            ),
            expectedString: '(p1: $unknown) -> ()',
        },
        {
            value: factory.createCallableType(
                callable1,
                undefined,
                factory.createNamedTupleType(new NamedTupleEntry(parameter2, 'p2', UnknownType)),
                factory.createNamedTupleType(),
            ),
            expectedString: '(p2?: $unknown) -> ()',
        },
        {
            value: factory.createIntersectionType(UnknownType),
            expectedString: '$intersection<$unknown>',
        },
        {
            value: factory.createLiteralType(new BooleanConstant(true)),
            expectedString: 'literal<true>',
        },
        {
            value: factory.createNamedTupleType(new NamedTupleEntry(parameter1, 'p1', UnknownType)),
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
            value: new ClassType(class2, new Map([[typeParameter1, factory.createUnionType()]]), true),
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
            value: factory.createStaticType(new ClassType(class1, new Map(), false)),
            expectedString: '$type<C1>',
        },
        {
            value: factory.createUnionType(UnknownType),
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

    const substitutions1 = new Map([[typeParameter1, factory.createLiteralType(new IntConstant(1n))]]);
    const substituteTypeParametersTest: SubstituteTypeParametersTest[] = [
        {
            type: factory.createCallableType(
                callable1,
                undefined,
                factory.createNamedTupleType(
                    new NamedTupleEntry(parameter1, 'p1', new TypeParameterType(typeParameter1, false)),
                ),
                factory.createNamedTupleType(
                    new NamedTupleEntry(result, 'r', new TypeParameterType(typeParameter1, false)),
                ),
            ),
            substitutions: substitutions1,
            expectedType: factory.createCallableType(
                callable1,
                undefined,
                factory.createNamedTupleType(
                    new NamedTupleEntry(parameter1, 'p1', factory.createLiteralType(new IntConstant(1n))),
                ),
                factory.createNamedTupleType(
                    new NamedTupleEntry(result, 'r', factory.createLiteralType(new IntConstant(1n))),
                ),
            ),
        },
        {
            type: factory.createIntersectionType(
                new ClassType(class1, new Map([[typeParameter2, new TypeParameterType(typeParameter1, false)]]), false),
            ),
            substitutions: substitutions1,
            expectedType: factory.createIntersectionType(
                new ClassType(
                    class1,
                    new Map([[typeParameter2, factory.createLiteralType(new IntConstant(1n))]]),
                    false,
                ),
            ),
        },
        {
            type: factory.createLiteralType(new BooleanConstant(true)),
            substitutions: substitutions1,
            expectedType: factory.createLiteralType(new BooleanConstant(true)),
        },
        {
            type: factory.createNamedTupleType(
                new NamedTupleEntry(parameter1, 'p1', new TypeParameterType(typeParameter1, false)),
            ),
            substitutions: substitutions1,
            expectedType: factory.createNamedTupleType(
                new NamedTupleEntry(parameter1, 'p1', factory.createLiteralType(new IntConstant(1n))),
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
                new Map([[typeParameter2, factory.createLiteralType(new IntConstant(1n))]]),
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
            expectedType: factory.createLiteralType(new IntConstant(1n)),
        },
        {
            type: new TypeParameterType(typeParameter1, true),
            substitutions: substitutions1,
            expectedType: factory.createLiteralType(new IntConstant(1n), NullConstant),
        },
        {
            type: new TypeParameterType(typeParameter2, false),
            substitutions: substitutions1,
            expectedType: new TypeParameterType(typeParameter2, false),
        },
        {
            type: factory.createStaticType(
                new ClassType(class1, new Map([[typeParameter1, new TypeParameterType(typeParameter2, false)]]), false),
            ),
            substitutions: substitutions1,
            expectedType: factory.createStaticType(
                new ClassType(class1, new Map([[typeParameter1, new TypeParameterType(typeParameter2, false)]]), false),
            ),
        },
        {
            type: factory.createUnionType(
                new ClassType(class1, new Map([[typeParameter2, new TypeParameterType(typeParameter1, false)]]), false),
            ),
            substitutions: substitutions1,
            expectedType: factory.createUnionType(
                new ClassType(
                    class1,
                    new Map([[typeParameter2, factory.createLiteralType(new IntConstant(1n))]]),
                    false,
                ),
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

    const simplifyTests: SimplifyTest[] = [
        {
            type: factory.createIntersectionType(),
            expectedType: factory.createIntersectionType(),
        },
        {
            type: factory.createIntersectionType(new ClassType(class1, new Map(), false)),
            expectedType: new ClassType(class1, new Map(), false),
        },
        {
            type: factory.createIntersectionType(
                factory.createIntersectionType(new ClassType(class1, new Map(), false)),
            ),
            expectedType: new ClassType(class1, new Map(), false),
        },
        {
            type: factory.createIntersectionType(
                factory.createIntersectionType(
                    new ClassType(class1, new Map(), false),
                    new ClassType(class2, new Map(), false),
                ),
                factory.createIntersectionType(new EnumType(enum1, false), new EnumVariantType(enumVariant1, false)),
            ),
            expectedType: factory.createIntersectionType(
                new ClassType(class1, new Map(), false),
                new ClassType(class2, new Map(), false),
                new EnumType(enum1, false),
                new EnumVariantType(enumVariant1, false),
            ),
        },
    ];
    describe.each(simplifyTests)('simplify', ({ type, expectedType }) => {
        it(`should simplify type (${type.constructor.name} -- ${type})`, () => {
            const actual = type.simplify();
            expectEqualTypes(actual, expectedType);
        });
    });

    const withExplicitNullabilityTests: WithExplicitNullabilityTest[] = [
        {
            type: factory.createCallableType(
                callable1,
                undefined,
                factory.createNamedTupleType(),
                factory.createNamedTupleType(),
            ),
            isNullable: true,
            expectedType: factory.createUnionType(
                factory.createCallableType(
                    callable1,
                    undefined,
                    factory.createNamedTupleType(),
                    factory.createNamedTupleType(),
                ),
                factory.createLiteralType(NullConstant),
            ),
        },
        {
            type: factory.createCallableType(
                callable1,
                undefined,
                factory.createNamedTupleType(),
                factory.createNamedTupleType(),
            ),
            isNullable: false,
            expectedType: factory.createCallableType(
                callable1,
                undefined,
                factory.createNamedTupleType(),
                factory.createNamedTupleType(),
            ),
        },
        {
            type: factory.createIntersectionType(),
            isNullable: true,
            expectedType: coreTypes.AnyOrNull,
        },
        {
            type: factory.createIntersectionType(),
            isNullable: false,
            expectedType: coreTypes.Any,
        },
        {
            type: factory.createIntersectionType(new ClassType(class1, new Map(), false)),
            isNullable: true,
            expectedType: factory.createIntersectionType(new ClassType(class1, new Map(), true)),
        },
        {
            type: factory.createIntersectionType(new ClassType(class1, new Map(), false)),
            isNullable: false,
            expectedType: factory.createIntersectionType(new ClassType(class1, new Map(), false)),
        },
        {
            type: factory.createIntersectionType(new ClassType(class1, new Map(), true)),
            isNullable: true,
            expectedType: factory.createIntersectionType(new ClassType(class1, new Map(), true)),
        },
        {
            type: factory.createIntersectionType(new ClassType(class1, new Map(), true)),
            isNullable: false,
            expectedType: factory.createIntersectionType(new ClassType(class1, new Map(), false)),
        },
        {
            type: factory.createLiteralType(new BooleanConstant(true)),
            isNullable: true,
            expectedType: factory.createLiteralType(new BooleanConstant(true), NullConstant),
        },
        {
            type: factory.createLiteralType(new BooleanConstant(true), NullConstant),
            isNullable: false,
            expectedType: factory.createLiteralType(new BooleanConstant(true)),
        },
        {
            type: factory.createLiteralType(new BooleanConstant(true), NullConstant),
            isNullable: true,
            expectedType: factory.createLiteralType(new BooleanConstant(true), NullConstant),
        },
        {
            type: factory.createLiteralType(new BooleanConstant(true)),
            isNullable: false,
            expectedType: factory.createLiteralType(new BooleanConstant(true)),
        },
        {
            type: factory.createNamedTupleType(),
            isNullable: true,
            expectedType: factory.createUnionType(
                factory.createNamedTupleType(),
                factory.createLiteralType(NullConstant),
            ),
        },
        {
            type: factory.createNamedTupleType(),
            isNullable: false,
            expectedType: factory.createNamedTupleType(),
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
            type: factory.createStaticType(new ClassType(class1, new Map(), false)),
            isNullable: true,
            expectedType: factory.createUnionType(
                factory.createStaticType(new ClassType(class1, new Map(), false)),
                factory.createLiteralType(NullConstant),
            ),
        },
        {
            type: factory.createStaticType(new ClassType(class1, new Map(), false)),
            isNullable: false,
            expectedType: factory.createStaticType(new ClassType(class1, new Map(), false)),
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
            type: factory.createUnionType(),
            isNullable: true,
            expectedType: coreTypes.NothingOrNull,
        },
        {
            type: factory.createUnionType(),
            isNullable: false,
            expectedType: coreTypes.Nothing,
        },
        {
            type: factory.createUnionType(new ClassType(class1, new Map(), false)),
            isNullable: true,
            expectedType: factory.createUnionType(new ClassType(class1, new Map(), true)),
        },
        {
            type: factory.createUnionType(new ClassType(class1, new Map(), false)),
            isNullable: false,
            expectedType: factory.createUnionType(new ClassType(class1, new Map(), false)),
        },
        {
            type: factory.createUnionType(new ClassType(class1, new Map(), true)),
            isNullable: true,
            expectedType: factory.createUnionType(new ClassType(class1, new Map(), true)),
        },
        {
            type: factory.createUnionType(new ClassType(class1, new Map(), true)),
            isNullable: false,
            expectedType: factory.createUnionType(new ClassType(class1, new Map(), false)),
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
    describe.each(withExplicitNullabilityTests)('withExplicitNullability', ({ type, isNullable, expectedType }) => {
        it(`should return the expected value (${type.constructor.name} -- ${type})`, () => {
            const actual = type.withExplicitNullability(isNullable);
            expectEqualTypes(actual, expectedType);
        });
    });

    describe('CallableType', () => {
        describe('getParameterTypeByIndex', () => {
            it.each([
                {
                    type: factory.createCallableType(
                        callable1,
                        undefined,
                        factory.createNamedTupleType(),
                        factory.createNamedTupleType(),
                    ),
                    index: 0,
                    expectedType: UnknownType,
                },
                {
                    type: factory.createCallableType(
                        callable1,
                        undefined,
                        factory.createNamedTupleType(
                            new NamedTupleEntry(parameter1, 'p1', new ClassType(class1, new Map(), false)),
                        ),
                        factory.createNamedTupleType(),
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
                    type: new ClassType(class2, new Map([[typeParameter1, factory.createUnionType()]]), false),
                    index: 0,
                    expectedType: factory.createUnionType(),
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
                    type: factory.createNamedTupleType(),
                    index: 0,
                    expectedType: UnknownType,
                },
                {
                    type: factory.createNamedTupleType(
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
 * Tests for {@link Type.simplify}.
 */
interface SimplifyTest {
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
 * Tests for {@link Type.withExplicitNullability}.
 */
interface WithExplicitNullabilityTest {
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
