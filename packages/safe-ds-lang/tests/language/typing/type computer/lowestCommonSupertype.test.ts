import { streamAllContents } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { describe, expect, it } from 'vitest';
import {
    isSdsClass,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsModule,
} from '../../../../src/language/generated/ast.js';
import { getModuleMembers } from '../../../../src/language/helpers/nodeProperties.js';
import { createSafeDsServicesWithBuiltins } from '../../../../src/language/index.js';
import { BooleanConstant, IntConstant, NullConstant } from '../../../../src/language/partialEvaluation/model.js';
import {
    ClassType,
    LiteralType,
    NamedTupleType,
    StaticType,
    Type,
    UnionType,
    UnknownType,
} from '../../../../src/language/typing/model.js';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const coreTypes = services.types.CoreTypes;
const typeComputer = services.types.TypeComputer;

const code = `
    fun func() -> ()

    class Class1
    class Class2 sub Class1
    class Class3

    enum Enum1 {
        Variant1
        Variant2
    }
    enum Enum2 {
        Variant3
    }
`;
const module = await getNodeOfType(services, code, isSdsModule);
const func = getModuleMembers(module).find(isSdsFunction)!;
const callableType = typeComputer.computeType(func);

const classes = getModuleMembers(module).filter(isSdsClass);
const class1 = classes[0];
const class2 = classes[1];
const class3 = classes[2];
const classType1 = typeComputer.computeType(class1) as ClassType;
const classType2 = typeComputer.computeType(class2) as ClassType;
const classType3 = typeComputer.computeType(class3) as ClassType;

const enums = getModuleMembers(module).filter(isSdsEnum);
const enum1 = enums[0];
const enum2 = enums[1];
const enumType1 = typeComputer.computeType(enum1);
const enumType2 = typeComputer.computeType(enum2);

const enumVariants = streamAllContents(module).filter(isSdsEnumVariant).toArray();
const enumVariant1 = enumVariants[0];
const enumVariant2 = enumVariants[1];
const enumVariant3 = enumVariants[2];
const enumVariantType1 = typeComputer.computeType(enumVariant1);
const enumVariantType2 = typeComputer.computeType(enumVariant2);
const enumVariantType3 = typeComputer.computeType(enumVariant3);

const tests: LowestCommonSupertypeTest[] = [
    // No types
    {
        types: [],
        expected: coreTypes.Nothing,
    },
    {
        types: [new LiteralType()],
        expected: coreTypes.Nothing,
    },
    {
        types: [new UnionType()],
        expected: coreTypes.Nothing,
    },
    // Union types get flattened
    {
        types: [new UnionType(new UnionType(new LiteralType(NullConstant)))],
        expected: new LiteralType(NullConstant),
    },
    // Types with no clear lowest common supertype
    {
        types: [callableType],
        expected: UnknownType,
    },
    {
        types: [new LiteralType(NullConstant), callableType],
        expected: UnknownType,
    },
    {
        types: [new NamedTupleType()],
        expected: UnknownType,
    },
    {
        types: [new LiteralType(NullConstant), new NamedTupleType()],
        expected: UnknownType,
    },
    {
        types: [new StaticType(classType1)],
        expected: UnknownType,
    },
    {
        types: [new LiteralType(NullConstant), new StaticType(classType1)],
        expected: UnknownType,
    },
    {
        types: [UnknownType],
        expected: UnknownType,
    },
    {
        types: [new LiteralType(NullConstant), UnknownType],
        expected: UnknownType,
    },
    // Singular type
    {
        types: [new LiteralType(NullConstant)],
        expected: new LiteralType(NullConstant),
    },
    // Class type & class type
    {
        types: [classType1, classType1],
        expected: classType1,
    },
    {
        types: [classType1, classType2],
        expected: classType1,
    },
    {
        types: [classType1, classType3],
        expected: coreTypes.Any,
    },
    {
        types: [classType1.updateNullability(true), classType1],
        expected: classType1.updateNullability(true),
    },
    {
        types: [classType1.updateNullability(true), classType2],
        expected: classType1.updateNullability(true),
    },
    {
        types: [classType1.updateNullability(true), classType3],
        expected: coreTypes.AnyOrNull,
    },
    // Class type & enum type
    {
        types: [classType1, enumType1],
        expected: coreTypes.Any,
    },
    {
        types: [classType1.updateNullability(true), enumType1],
        expected: coreTypes.AnyOrNull,
    },
    // Class type & enum variant type
    {
        types: [classType1, enumVariantType1],
        expected: coreTypes.Any,
    },
    {
        types: [classType1.updateNullability(true), enumType1],
        expected: coreTypes.AnyOrNull,
    },
    // Class type & literal type
    {
        types: [classType1, new LiteralType()],
        expected: classType1,
    },
    {
        types: [coreTypes.Int, new LiteralType(new IntConstant(1n))],
        expected: coreTypes.Int,
    },
    {
        types: [coreTypes.String, new LiteralType(new IntConstant(1n))],
        expected: coreTypes.Any,
    },
    {
        types: [classType1.updateNullability(true), new LiteralType()],
        expected: classType1.updateNullability(true),
    },
    {
        types: [coreTypes.Int.updateNullability(true), new LiteralType(new IntConstant(1n))],
        expected: coreTypes.Int.updateNullability(true),
    },
    {
        types: [coreTypes.String.updateNullability(true), new LiteralType(new IntConstant(1n))],
        expected: coreTypes.AnyOrNull,
    },
    {
        types: [classType1, new LiteralType(NullConstant)],
        expected: classType1.updateNullability(true),
    },
    {
        types: [coreTypes.Int, new LiteralType(new IntConstant(1n), NullConstant)],
        expected: coreTypes.Int.updateNullability(true),
    },
    {
        types: [coreTypes.String, new LiteralType(new IntConstant(1n), NullConstant)],
        expected: coreTypes.AnyOrNull,
    },
    {
        types: [coreTypes.Nothing, new LiteralType(new IntConstant(1n))],
        expected: new LiteralType(new IntConstant(1n)),
    },
    {
        types: [coreTypes.NothingOrNull, new LiteralType(new IntConstant(1n))],
        expected: new LiteralType(NullConstant, new IntConstant(1n)),
    },
    // Enum type & enum type
    {
        types: [enumType1, enumType1],
        expected: enumType1,
    },
    {
        types: [enumType1, enumType2],
        expected: coreTypes.Any,
    },
    {
        types: [enumType1.updateNullability(true), enumType1],
        expected: enumType1.updateNullability(true),
    },
    {
        types: [enumType1.updateNullability(true), enumType2],
        expected: coreTypes.AnyOrNull,
    },
    // Enum type & enum variant type
    {
        types: [enumType1, enumVariantType1],
        expected: enumType1,
    },
    {
        types: [enumType2, enumVariantType1],
        expected: coreTypes.Any,
    },
    {
        types: [enumType1.updateNullability(true), enumVariantType1],
        expected: enumType1.updateNullability(true),
    },
    {
        types: [enumType2.updateNullability(true), enumVariantType1],
        expected: coreTypes.AnyOrNull,
    },
    // Enum type & literal type
    {
        types: [enumType1, new LiteralType()],
        expected: enumType1,
    },
    {
        types: [enumType1, new LiteralType(new BooleanConstant(true))],
        expected: coreTypes.Any,
    },
    {
        types: [enumType1.updateNullability(true), new LiteralType(new BooleanConstant(true))],
        expected: coreTypes.AnyOrNull,
    },
    {
        types: [enumType1, new LiteralType(NullConstant)],
        expected: coreTypes.AnyOrNull,
    },
    // Enum variant type & enum variant type
    {
        types: [enumVariantType1, enumVariantType1],
        expected: enumVariantType1,
    },
    {
        types: [enumVariantType1, enumVariantType2],
        expected: enumType1,
    },
    {
        types: [enumVariantType1, enumVariantType3],
        expected: coreTypes.Any,
    },
    {
        types: [enumVariantType1.updateNullability(true), enumVariantType1],
        expected: enumVariantType1.updateNullability(true),
    },
    {
        types: [enumVariantType1.updateNullability(true), enumVariantType2],
        expected: enumType1.updateNullability(true),
    },
    {
        types: [enumVariantType1.updateNullability(true), enumVariantType3],
        expected: coreTypes.AnyOrNull,
    },
    // Enum variant type & literal type
    {
        types: [enumVariantType1, new LiteralType()],
        expected: enumVariantType1,
    },
    {
        types: [enumVariantType1, new LiteralType(new BooleanConstant(true))],
        expected: coreTypes.Any,
    },
    {
        types: [enumVariantType1.updateNullability(true), new LiteralType(new BooleanConstant(true))],
        expected: coreTypes.AnyOrNull,
    },
    {
        types: [enumVariantType1, new LiteralType(NullConstant)],
        expected: coreTypes.AnyOrNull,
    },
    // Literal type & literal type
    {
        types: [new LiteralType(new BooleanConstant(true)), new LiteralType(new IntConstant(1n))],
        expected: new LiteralType(new BooleanConstant(true), new IntConstant(1n)),
    },
    {
        types: [new LiteralType(new BooleanConstant(true)), new LiteralType(NullConstant)],
        expected: new LiteralType(new BooleanConstant(true), NullConstant),
    },
];

describe.each(tests)('lowestCommonSupertype', ({ types, expected }) => {
    it(`should return the lowest common supertype [${types}]`, () => {
        expect(typeComputer.lowestCommonSupertype(...types)).toSatisfy((actual: Type) => actual.equals(expected));
    });
});

/**
 * A test case for {@link lowestCommonSupertype}.
 */
interface LowestCommonSupertypeTest {
    /**
     * The types to compute the lowest common supertype of.
     */
    types: Type[];

    /**
     * The expected lowest common supertype.
     */
    expected: Type;
}
