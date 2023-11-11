import { streamAllContents } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { describe, expect, it } from 'vitest';
import {
    isSdsClass,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsModule,
} from '../../../src/language/generated/ast.js';
import { getModuleMembers } from '../../../src/language/helpers/nodeProperties.js';
import { createSafeDsServicesWithBuiltins } from '../../../src/language/index.js';
import {
    BooleanConstant,
    FloatConstant,
    IntConstant,
    NullConstant,
    StringConstant,
} from '../../../src/language/partialEvaluation/model.js';
import {
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
const coreTypes = services.types.CoreTypes;
const typeChecker = services.types.TypeChecker;
const typeComputer = services.types.TypeComputer;

const code = `
    fun func1() -> ()
    fun func2(p: Int = 0) -> ()
    fun func3(p: Int) -> ()
    fun func4(r: Int) -> ()
    fun func5(p: Any) -> ()
    fun func6(p: String) -> ()
    fun func7() -> (r: Int)
    fun func8() -> (s: Int)
    fun func9() -> (r: Any)
    fun func10() -> (r: String)
    fun func11() -> (r: Class1)
    fun func12() -> (r: Enum1)

    class Class1(p: Int)
    class Class2() sub Class1
    class Class3

    enum Enum1 {
        Variant1(p: Int)
        Variant2
    }
    enum Enum2
`;
const module = await getNodeOfType(services, code, isSdsModule);
const functions = getModuleMembers(module).filter(isSdsFunction);
const callableType1 = typeComputer.computeType(functions[0]);
const callableType2 = typeComputer.computeType(functions[1]);
const callableType3 = typeComputer.computeType(functions[2]);
const callableType4 = typeComputer.computeType(functions[3]);
const callableType5 = typeComputer.computeType(functions[4]);
const callableType6 = typeComputer.computeType(functions[5]);
const callableType7 = typeComputer.computeType(functions[6]);
const callableType8 = typeComputer.computeType(functions[7]);
const callableType9 = typeComputer.computeType(functions[8]);
const callableType10 = typeComputer.computeType(functions[9]);
const callableType11 = typeComputer.computeType(functions[10]);
const callableType12 = typeComputer.computeType(functions[11]);

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
const enumType1 = typeComputer.computeType(enum1) as EnumType;
const enumType2 = typeComputer.computeType(enum2) as EnumType;

const enumVariants = streamAllContents(module).filter(isSdsEnumVariant).toArray();
const enumVariant1 = enumVariants[0];
const enumVariant2 = enumVariants[1];
const enumVariantType1 = typeComputer.computeType(enumVariant1) as EnumVariantType;
const enumVariantType2 = typeComputer.computeType(enumVariant2) as EnumVariantType;

describe('SafeDsTypeChecker', async () => {
    const testCases: IsAssignableToTest[] = [
        {
            type1: callableType1,
            type2: callableType1,
            expected: true,
        },
        {
            type1: callableType2,
            type2: callableType1,
            expected: true,
        },
        {
            type1: callableType1,
            type2: callableType2,
            expected: false,
        },
        {
            type1: callableType2,
            type2: callableType3,
            expected: true,
        },
        {
            type1: callableType3,
            type2: callableType2,
            expected: false,
        },
        {
            type1: callableType3,
            type2: callableType1,
            expected: false,
        },
        {
            type1: callableType3,
            type2: callableType4,
            expected: false,
        },
        {
            type1: callableType3,
            type2: callableType5,
            expected: false,
        },
        {
            type1: callableType5,
            type2: callableType3,
            expected: true,
        },
        {
            type1: callableType6,
            type2: callableType3,
            expected: false,
        },
        {
            type1: callableType7,
            type2: callableType1,
            expected: true,
        },
        {
            type1: callableType1,
            type2: callableType7,
            expected: false,
        },
        {
            type1: callableType8,
            type2: callableType7,
            expected: true,
        },
        {
            type1: callableType9,
            type2: callableType7,
            expected: false,
        },
        {
            type1: callableType7,
            type2: callableType9,
            expected: true,
        },
        {
            type1: callableType10,
            type2: callableType7,
            expected: false,
        },
        // Callable type to class type
        {
            type1: callableType1,
            type2: coreTypes.Any,
            expected: true,
        },
        {
            type1: callableType1,
            type2: coreTypes.AnyOrNull,
            expected: true,
        },
        // Callable type to other
        {
            type1: callableType1,
            type2: enumType1,
            expected: false,
        },
        // Class type to class type
        {
            type1: classType1,
            type2: classType1,
            expected: true,
        },
        {
            type1: classType2,
            type2: classType1,
            expected: true,
        },
        {
            type1: classType1,
            type2: classType3,
            expected: false,
        },
        {
            type1: classType1,
            type2: coreTypes.Any,
            expected: true,
        },
        {
            type1: classType2.updateNullability(true),
            type2: classType1,
            expected: false,
        },
        {
            type1: classType2.updateNullability(true),
            type2: classType1.updateNullability(true),
            expected: true,
        },
        // Class type to union type
        {
            type1: classType1,
            type2: new UnionType(classType1),
            expected: true,
        },
        {
            type1: classType1,
            type2: new UnionType(classType3),
            expected: false,
        },
        // Class type to other
        {
            type1: classType1,
            type2: enumType1,
            expected: false,
        },
        // Enum type to class type
        {
            type1: enumType1,
            type2: classType1,
            expected: false,
        },
        {
            type1: enumType1,
            type2: coreTypes.Any,
            expected: true,
        },
        {
            type1: enumType1.updateNullability(true),
            type2: coreTypes.Any,
            expected: false,
        },
        {
            type1: enumType1.updateNullability(true),
            type2: coreTypes.AnyOrNull,
            expected: true,
        },
        // Enum type to enum type
        {
            type1: enumType1,
            type2: enumType1,
            expected: true,
        },
        {
            type1: enumType1,
            type2: enumType2,
            expected: false,
        },
        {
            type1: enumType1.updateNullability(true),
            type2: enumType1,
            expected: false,
        },
        {
            type1: enumType1.updateNullability(true),
            type2: enumType1.updateNullability(true),
            expected: true,
        },
        // Enum type to union type
        {
            type1: enumType1,
            type2: new UnionType(enumType1),
            expected: true,
        },
        {
            type1: enumType1,
            type2: new UnionType(enumType2),
            expected: false,
        },
        // Enum type to other
        {
            type1: enumType1,
            type2: new LiteralType(),
            expected: false,
        },
        // Enum variant type to class type
        {
            type1: enumVariantType1,
            type2: classType1,
            expected: false,
        },
        {
            type1: enumVariantType1,
            type2: coreTypes.Any,
            expected: true,
        },
        {
            type1: enumVariantType1.updateNullability(true),
            type2: coreTypes.Any,
            expected: false,
        },
        {
            type1: enumVariantType1.updateNullability(true),
            type2: coreTypes.AnyOrNull,
            expected: true,
        },
        // Enum variant type to enum type
        {
            type1: enumVariantType1,
            type2: enumType1,
            expected: true,
        },
        {
            type1: enumVariantType1,
            type2: enumType2,
            expected: false,
        },
        {
            type1: enumVariantType1.updateNullability(true),
            type2: enumType1,
            expected: false,
        },
        {
            type1: enumVariantType1.updateNullability(true),
            type2: enumType1.updateNullability(true),
            expected: true,
        },
        // Enum variant type to enum variant type
        {
            type1: enumVariantType1,
            type2: enumVariantType1,
            expected: true,
        },
        {
            type1: enumVariantType1,
            type2: enumVariantType2,
            expected: false,
        },
        {
            type1: enumVariantType1.updateNullability(true),
            type2: enumVariantType1,
            expected: false,
        },
        {
            type1: enumVariantType1.updateNullability(true),
            type2: enumVariantType1.updateNullability(true),
            expected: true,
        },
        // Enum variant type to union type
        {
            type1: enumVariantType1,
            type2: new UnionType(enumType1),
            expected: true,
        },
        {
            type1: enumVariantType1,
            type2: new UnionType(enumType2),
            expected: false,
        },
        // Enum variant type to other
        {
            type1: enumVariantType1,
            type2: new LiteralType(),
            expected: false,
        },
        // Literal type to class type
        {
            type1: new LiteralType(),
            type2: classType1,
            expected: true,
        },
        {
            type1: new LiteralType(new BooleanConstant(true)),
            type2: coreTypes.Boolean,
            expected: true,
        },
        {
            type1: new LiteralType(new FloatConstant(1.5)),
            type2: coreTypes.Float,
            expected: true,
        },
        {
            type1: new LiteralType(new IntConstant(1n)),
            type2: coreTypes.Int,
            expected: true,
        },
        {
            type1: new LiteralType(NullConstant),
            type2: coreTypes.NothingOrNull,
            expected: true,
        },
        {
            type1: new LiteralType(new StringConstant('')),
            type2: coreTypes.String,
            expected: true,
        },
        {
            type1: new LiteralType(new IntConstant(1n)),
            type2: coreTypes.Any,
            expected: true,
        },
        {
            type1: new LiteralType(new IntConstant(1n)),
            type2: coreTypes.String,
            expected: false,
        },
        {
            type1: new LiteralType(new IntConstant(1n), NullConstant),
            type2: coreTypes.Int.updateNullability(true),
            expected: true,
        },
        {
            type1: new LiteralType(new IntConstant(1n), NullConstant),
            type2: coreTypes.Int,
            expected: false,
        },
        {
            type1: new LiteralType(new IntConstant(1n), new StringConstant('')),
            type2: coreTypes.Int,
            expected: false,
        },
        {
            type1: new LiteralType(new IntConstant(1n), new StringConstant('')),
            type2: coreTypes.String,
            expected: false,
        },
        {
            type1: new LiteralType(new IntConstant(1n), new StringConstant('')),
            type2: coreTypes.Any,
            expected: true,
        },
        {
            type1: new LiteralType(new IntConstant(1n), new StringConstant(''), NullConstant),
            type2: coreTypes.AnyOrNull,
            expected: true,
        },
        // Literal type to literal type
        {
            type1: new LiteralType(),
            type2: new LiteralType(),
            expected: true,
        },
        {
            type1: new LiteralType(new BooleanConstant(true)),
            type2: new LiteralType(new BooleanConstant(true)),
            expected: true,
        },
        {
            type1: new LiteralType(new BooleanConstant(true)),
            type2: new LiteralType(new BooleanConstant(false)),
            expected: false,
        },
        {
            type1: new LiteralType(new BooleanConstant(true)),
            type2: new LiteralType(new FloatConstant(1.5)),
            expected: false,
        },
        {
            type1: new LiteralType(new BooleanConstant(true), NullConstant),
            type2: new LiteralType(new BooleanConstant(true), NullConstant),
            expected: true,
        },
        {
            type1: new LiteralType(new BooleanConstant(true), NullConstant),
            type2: new LiteralType(new BooleanConstant(true)),
            expected: false,
        },
        // Literal type to union type
        {
            type1: new LiteralType(new IntConstant(1n)),
            type2: new UnionType(coreTypes.Any),
            expected: true,
        },
        {
            type1: new LiteralType(new IntConstant(1n)),
            type2: new UnionType(coreTypes.String),
            expected: false,
        },
        // Literal type to other
        {
            type1: new LiteralType(new IntConstant(1n)),
            type2: enumType1,
            expected: false,
        },
        // Named tuple type to named tuple type
        {
            type1: new NamedTupleType(),
            type2: new NamedTupleType(),
            expected: true,
        },
        {
            type1: new NamedTupleType(new NamedTupleEntry(undefined, 'a', coreTypes.Int)),
            type2: new NamedTupleType(new NamedTupleEntry(undefined, 'a', coreTypes.Int)),
            expected: true,
        },
        {
            type1: new NamedTupleType(new NamedTupleEntry(class1, 'a', coreTypes.Int)),
            type2: new NamedTupleType(new NamedTupleEntry(class2, 'a', coreTypes.Int)),
            expected: true,
        },
        {
            type1: new NamedTupleType(new NamedTupleEntry(undefined, 'a', coreTypes.Int)),
            type2: new NamedTupleType(new NamedTupleEntry(undefined, 'a', coreTypes.Any)),
            expected: true,
        },
        {
            type1: new NamedTupleType(new NamedTupleEntry(undefined, 'a', coreTypes.Any)),
            type2: new NamedTupleType(new NamedTupleEntry(undefined, 'a', coreTypes.Int)),
            expected: false,
        },
        {
            type1: new NamedTupleType(new NamedTupleEntry(undefined, 'a', coreTypes.Int)),
            type2: new NamedTupleType(new NamedTupleEntry(undefined, 'b', coreTypes.Int)),
            expected: false,
        },
        // Named tuple type to other
        {
            type1: new NamedTupleType(),
            type2: enumType1,
            expected: false,
        },
        // Static type to callable type
        {
            type1: new StaticType(classType1),
            type2: callableType1,
            expected: false,
        },
        {
            type1: new StaticType(classType1),
            type2: callableType3,
            expected: true,
        },
        {
            type1: new StaticType(classType2),
            type2: callableType11,
            expected: true,
        },
        {
            type1: new StaticType(classType3),
            type2: callableType1,
            expected: false,
        },
        {
            type1: new StaticType(enumType1),
            type2: callableType1,
            expected: false,
        },
        {
            type1: new StaticType(enumVariantType1),
            type2: callableType1,
            expected: false,
        },
        {
            type1: new StaticType(enumVariantType1),
            type2: callableType3,
            expected: true,
        },
        {
            type1: new StaticType(enumVariantType2),
            type2: callableType12,
            expected: true,
        },
        // Static type to static type
        {
            type1: new StaticType(classType1),
            type2: new StaticType(classType1),
            expected: true,
        },
        {
            type1: new StaticType(classType1),
            type2: new StaticType(classType2),
            expected: false,
        },
        // Static type to other
        {
            type1: new StaticType(classType1),
            type2: enumType1,
            expected: false,
        },
        // Union type to X
        {
            type1: new UnionType(),
            type2: classType1,
            expected: true,
        },
        {
            type1: new UnionType(classType1),
            type2: classType1,
            expected: true,
        },
        {
            type1: new UnionType(classType1, classType2),
            type2: classType1,
            expected: true,
        },
        {
            type1: new UnionType(classType1, classType3),
            type2: classType1,
            expected: false,
        },
        {
            type1: new UnionType(classType1.updateNullability(true)),
            type2: classType1,
            expected: false,
        },
        {
            type1: new UnionType(classType1.updateNullability(true)),
            type2: classType1.updateNullability(true),
            expected: true,
        },
        // Unknown to X
        {
            type1: UnknownType,
            type2: UnknownType,
            expected: false,
        },
    ];

    describe.each(testCases)('isAssignableTo', ({ type1, type2, expected }) => {
        it(`should check whether ${type1} is assignable to ${type2}`, () => {
            expect(typeChecker.isAssignableTo(type1, type2)).toBe(expected);
        });
    });
});

/**
 * A test case for {@link SafeDsTypeChecker.isAssignableTo}.
 */
interface IsAssignableToTest {
    /**
     * The first type to check.
     */
    type1: Type;

    /**
     * The second type to check.
     */
    type2: Type;

    /**
     * Whether {@link type1} is expected to be assignable to {@link type2}.
     */
    expected: boolean;
}
