import { streamAllContents } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { describe, expect, it } from 'vitest';
import {
    isSdsAttribute,
    isSdsClass,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsModule,
    SdsDeclaration,
} from '../../../../src/language/generated/ast.js';
import {
    createSafeDsServicesWithBuiltins,
    getClassMembers,
    getModuleMembers,
    getTypeParameters,
} from '../../../../src/language/index.js';

import {
    BooleanConstant,
    FloatConstant,
    IntConstant,
    NullConstant,
    StringConstant,
} from '../../../../src/language/partialEvaluation/model.js';
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
} from '../../../../src/language/typing/model.js';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const coreTypes = services.types.CoreTypes;
const typeChecker = services.types.TypeChecker;
const typeComputer = services.types.TypeComputer;

const basic = async (): Promise<IsSubOrSupertypeOfTest[]> => {
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

        class Class4

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

    return [
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
            type1: new LiteralType(), // Empty literal type
            type2: enumType1,
            expected: true,
        },
        {
            type1: new LiteralType(NullConstant),
            type2: enumType1,
            expected: false,
        },
        {
            type1: new LiteralType(NullConstant),
            type2: enumType1.updateNullability(true),
            expected: true,
        },
        {
            type1: new LiteralType(NullConstant, NullConstant),
            type2: enumType1.updateNullability(true),
            expected: true,
        },
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
};

const classTypesWithTypeParameters = async (): Promise<IsSubOrSupertypeOfTest[]> => {
    const code = `
        class TestClass {
            attr any: MyAny

            attr baseClassInvariantAny: BaseClassInvariant<MyAny>
            attr baseClassCovariantAny: BaseClassCovariant<MyAny>
            attr baseClassContravariantAny: BaseClassContravariant<MyAny>

            attr baseClassInvariantNumber: BaseClassInvariant<MyNumber>
            attr baseClassCovariantNumber: BaseClassCovariant<MyNumber>
            attr baseClassContravariantNumber: BaseClassContravariant<MyNumber>

            attr baseClassInvariantInt: BaseClassInvariant<MyInt>
            attr baseClassCovariantInt: BaseClassCovariant<MyInt>
            attr baseClassContravariantInt: BaseClassContravariant<MyInt>

            attr subclassParameterizedInvariantAny: SubclassParameterizedInvariant<MyAny>
            attr subclassParameterizedCovariantAny: SubclassParameterizedCovariant<MyAny>
            attr subclassParameterizedContravariantAny: SubclassParameterizedContravariant<MyAny>

            attr subclassParameterizedInvariantNumber: SubclassParameterizedInvariant<MyNumber>
            attr subclassParameterizedCovariantNumber: SubclassParameterizedCovariant<MyNumber>
            attr subclassParameterizedContravariantNumber: SubclassParameterizedContravariant<MyNumber>

            attr subclassParameterizedInvariantInt: SubclassParameterizedInvariant<MyInt>
            attr subclassParameterizedCovariantInt: SubclassParameterizedCovariant<MyInt>
            attr subclassParameterizedContravariantInt: SubclassParameterizedContravariant<MyInt>

            attr subclassFixedInvariant: SubclassFixedInvariant
            attr subclassFixedCovariant: SubclassFixedCovariant
            attr subclassFixedContravariant: SubclassFixedContravariant
        }

        class MyAny
        class MyNumber sub MyAny
        class MyInt sub MyNumber

        class BaseClassInvariant<T> sub MyAny
        class BaseClassCovariant<out T> sub MyAny
        class BaseClassContravariant<in T> sub MyAny

        class SubclassParameterizedInvariant<T> sub BaseClassInvariant<T>
        class SubclassParameterizedCovariant<T> sub BaseClassCovariant<T>
        class SubclassParameterizedContravariant<T> sub BaseClassContravariant<T>

        class SubclassFixedInvariant sub BaseClassInvariant<MyNumber>
        class SubclassFixedCovariant sub BaseClassCovariant<MyNumber>
        class SubclassFixedContravariant sub BaseClassContravariant<MyNumber>
    `;
    const module = await getNodeOfType(services, code, isSdsModule);
    const classes = getModuleMembers(module).filter(isSdsClass);
    const attributes = getClassMembers(classes[0]).filter(isSdsAttribute);

    const computeTypeOfAttributeWithName = computeTypeOfDeclarationWithName(attributes);

    const any = computeTypeOfAttributeWithName('any');

    const baseClassInvariantAny = computeTypeOfAttributeWithName('baseClassInvariantAny');
    const baseClassCovariantAny = computeTypeOfAttributeWithName('baseClassCovariantAny');
    const baseClassContravariantAny = computeTypeOfAttributeWithName('baseClassContravariantAny');

    const baseClassInvariantNumber = computeTypeOfAttributeWithName('baseClassInvariantNumber');
    const baseClassCovariantNumber = computeTypeOfAttributeWithName('baseClassCovariantNumber');
    const baseClassContravariantNumber = computeTypeOfAttributeWithName('baseClassContravariantNumber');

    const baseClassInvariantInt = computeTypeOfAttributeWithName('baseClassInvariantInt');
    const baseClassCovariantInt = computeTypeOfAttributeWithName('baseClassCovariantInt');
    const baseClassContravariantInt = computeTypeOfAttributeWithName('baseClassContravariantInt');

    const subclassParameterizedInvariantAny = computeTypeOfAttributeWithName('subclassParameterizedInvariantAny');
    const subclassParameterizedCovariantAny = computeTypeOfAttributeWithName('subclassParameterizedCovariantAny');
    const subclassParameterizedContravariantAny = computeTypeOfAttributeWithName(
        'subclassParameterizedContravariantAny',
    );

    const subclassParameterizedInvariantNumber = computeTypeOfAttributeWithName('subclassParameterizedInvariantNumber');
    const subclassParameterizedCovariantNumber = computeTypeOfAttributeWithName('subclassParameterizedCovariantNumber');
    const subclassParameterizedContravariantNumber = computeTypeOfAttributeWithName(
        'subclassParameterizedContravariantNumber',
    );

    const subclassParameterizedInvariantInt = computeTypeOfAttributeWithName('subclassParameterizedInvariantInt');
    const subclassParameterizedCovariantInt = computeTypeOfAttributeWithName('subclassParameterizedCovariantInt');
    const subclassParameterizedContravariantInt = computeTypeOfAttributeWithName(
        'subclassParameterizedContravariantInt',
    );

    const subclassFixedInvariant = computeTypeOfAttributeWithName('subclassFixedInvariant');
    const subclassFixedCovariant = computeTypeOfAttributeWithName('subclassFixedCovariant');
    const subclassFixedContravariant = computeTypeOfAttributeWithName('subclassFixedContravariant');

    return [
        // Compare to MyAny
        {
            type1: baseClassInvariantAny,
            type2: any,
            expected: true,
        },
        {
            type1: subclassParameterizedCovariantAny,
            type2: any,
            expected: true,
        },
        {
            type1: subclassFixedContravariant,
            type2: any,
            expected: true,
        },

        // Compare to BaseClassInvariant<MyAny>
        {
            type1: subclassParameterizedInvariantAny,
            type2: baseClassInvariantAny,
            expected: true,
        },
        {
            type1: subclassParameterizedInvariantNumber,
            type2: baseClassInvariantAny,
            expected: false,
        },
        {
            type1: subclassParameterizedInvariantInt,
            type2: baseClassInvariantAny,
            expected: false,
        },
        {
            type1: subclassFixedInvariant,
            type2: baseClassInvariantAny,
            expected: false,
        },

        // Compare to BaseClassCovariant<MyAny>
        {
            type1: subclassParameterizedCovariantAny,
            type2: baseClassCovariantAny,
            expected: true,
        },
        {
            type1: subclassParameterizedCovariantNumber,
            type2: baseClassCovariantAny,
            expected: true,
        },
        {
            type1: subclassParameterizedCovariantInt,
            type2: baseClassCovariantAny,
            expected: true,
        },
        {
            type1: subclassFixedCovariant,
            type2: baseClassCovariantAny,
            expected: true,
        },

        // Compare to BaseClassContravariant<MyAny>
        {
            type1: subclassParameterizedContravariantAny,
            type2: baseClassContravariantAny,
            expected: true,
        },
        {
            type1: subclassParameterizedContravariantNumber,
            type2: baseClassContravariantAny,
            expected: false,
        },
        {
            type1: subclassParameterizedContravariantInt,
            type2: baseClassContravariantAny,
            expected: false,
        },
        {
            type1: subclassFixedContravariant,
            type2: baseClassContravariantAny,
            expected: false,
        },

        // Compare to BaseClassInvariant<MyNumber>
        {
            type1: subclassParameterizedInvariantAny,
            type2: baseClassInvariantNumber,
            expected: false,
        },
        {
            type1: subclassParameterizedInvariantNumber,
            type2: baseClassInvariantNumber,
            expected: true,
        },
        {
            type1: subclassParameterizedInvariantInt,
            type2: baseClassInvariantNumber,
            expected: false,
        },
        {
            type1: subclassFixedInvariant,
            type2: baseClassInvariantNumber,
            expected: true,
        },

        // Compare to BaseClassCovariant<MyNumber>
        {
            type1: subclassParameterizedCovariantAny,
            type2: baseClassCovariantNumber,
            expected: false,
        },
        {
            type1: subclassParameterizedCovariantNumber,
            type2: baseClassCovariantNumber,
            expected: true,
        },
        {
            type1: subclassParameterizedCovariantInt,
            type2: baseClassCovariantNumber,
            expected: true,
        },
        {
            type1: subclassFixedCovariant,
            type2: baseClassCovariantNumber,
            expected: true,
        },

        // Compare to BaseClassContravariant<MyNumber>
        {
            type1: subclassParameterizedContravariantAny,
            type2: baseClassContravariantNumber,
            expected: true,
        },
        {
            type1: subclassParameterizedContravariantNumber,
            type2: baseClassContravariantNumber,
            expected: true,
        },
        {
            type1: subclassParameterizedContravariantInt,
            type2: baseClassContravariantNumber,
            expected: false,
        },
        {
            type1: subclassFixedContravariant,
            type2: baseClassContravariantNumber,
            expected: true,
        },

        // Compare to BaseClassInvariant<MyInt>
        {
            type1: subclassParameterizedInvariantAny,
            type2: baseClassInvariantInt,
            expected: false,
        },
        {
            type1: subclassParameterizedInvariantNumber,
            type2: baseClassInvariantInt,
            expected: false,
        },
        {
            type1: subclassParameterizedInvariantInt,
            type2: baseClassInvariantInt,
            expected: true,
        },
        {
            type1: subclassFixedInvariant,
            type2: baseClassInvariantInt,
            expected: false,
        },

        // Compare to BaseClassCovariant<MyInt>
        {
            type1: subclassParameterizedCovariantAny,
            type2: baseClassCovariantInt,
            expected: false,
        },
        {
            type1: subclassParameterizedCovariantNumber,
            type2: baseClassCovariantInt,
            expected: false,
        },
        {
            type1: subclassParameterizedCovariantInt,
            type2: baseClassCovariantInt,
            expected: true,
        },
        {
            type1: subclassFixedCovariant,
            type2: baseClassCovariantInt,
            expected: false,
        },

        // Compare to BaseClassContravariant<MyInt>
        {
            type1: subclassParameterizedContravariantAny,
            type2: baseClassContravariantInt,
            expected: true,
        },
        {
            type1: subclassParameterizedContravariantNumber,
            type2: baseClassContravariantInt,
            expected: true,
        },
        {
            type1: subclassParameterizedContravariantInt,
            type2: baseClassContravariantInt,
            expected: true,
        },
        {
            type1: subclassFixedContravariant,
            type2: baseClassContravariantInt,
            expected: true,
        },
    ];
};

const typeParameterTypes = async (): Promise<IsSubOrSupertypeOfTest[]> => {
    const code = `
        class TestClass<
            Unbounded,
            LowerBound,
            UpperBound,
            BothBounds,

            IndirectLowerBound,
            IndirectUpperBound,
            Cyclic,
            Unresolved,
        > where {
            LowerBound super Number,
            UpperBound sub Number,
            BothBounds super Int,
            BothBounds sub Number,

            IndirectLowerBound super LowerBound,
            IndirectUpperBound sub UpperBound,
            Cyclic sub Cyclic,
            Unresolved super Unknown,
            Unresolved sub Unknown,
        }
    `;
    const module = await getNodeOfType(services, code, isSdsModule);
    const classes = getModuleMembers(module).filter(isSdsClass);
    const typeParameters = getTypeParameters(classes[0]);

    const computeTypeOfTypeParameterWithName = computeTypeOfDeclarationWithName(typeParameters);

    const unbounded = computeTypeOfTypeParameterWithName('Unbounded');
    const lowerBound = computeTypeOfTypeParameterWithName('LowerBound');
    const upperBound = computeTypeOfTypeParameterWithName('UpperBound');
    const bothBounds = computeTypeOfTypeParameterWithName('BothBounds');
    const indirectLowerBound = computeTypeOfTypeParameterWithName('IndirectLowerBound');
    const indirectUpperBound = computeTypeOfTypeParameterWithName('IndirectUpperBound');
    const cyclic = computeTypeOfTypeParameterWithName('Cyclic');
    const unresolved = computeTypeOfTypeParameterWithName('Unresolved');

    return [
        // Compare to Unbounded
        {
            type1: unbounded,
            type2: unbounded,
            expected: true,
        },
        {
            type1: lowerBound,
            type2: unbounded,
            expected: true,
        },
        {
            type1: upperBound,
            type2: unbounded,
            expected: true,
        },
        {
            type1: bothBounds,
            type2: unbounded,
            expected: true,
        },
        {
            type1: indirectLowerBound,
            type2: unbounded,
            expected: true,
        },
        {
            type1: indirectUpperBound,
            type2: unbounded,
            expected: true,
        },
        {
            type1: cyclic,
            type2: unbounded,
            expected: false,
        },
        {
            type1: unresolved,
            type2: unbounded,
            expected: false,
        },
        {
            type1: coreTypes.AnyOrNull,
            type2: unbounded,
            expected: true,
        },
        {
            type1: coreTypes.Nothing,
            type2: unbounded,
            expected: true,
        },
        {
            type1: coreTypes.NothingOrNull,
            type2: unbounded,
            expected: true,
        },

        // Compare to LowerBound
        {
            type1: unbounded,
            type2: lowerBound,
            expected: false,
        },
        {
            type1: lowerBound,
            type2: lowerBound,
            expected: true,
        },
        {
            type1: upperBound,
            type2: lowerBound,
            expected: false,
        },
        {
            type1: bothBounds,
            type2: lowerBound,
            expected: false,
        },
        {
            type1: indirectLowerBound,
            type2: lowerBound,
            expected: true,
        },
        {
            type1: indirectUpperBound,
            type2: lowerBound,
            expected: false,
        },
        {
            type1: cyclic,
            type2: lowerBound,
            expected: false,
        },
        {
            type1: unresolved,
            type2: lowerBound,
            expected: false,
        },
        {
            type1: coreTypes.AnyOrNull,
            type2: lowerBound,
            expected: true,
        },
        {
            type1: coreTypes.Number,
            type2: lowerBound,
            expected: true,
        },
        {
            type1: coreTypes.Number.updateNullability(true),
            type2: lowerBound,
            expected: true,
        },
        {
            type1: coreTypes.Nothing,
            type2: lowerBound,
            expected: false,
        },

        // Compare to UpperBound
        {
            type1: unbounded,
            type2: upperBound,
            expected: false,
        },
        {
            type1: lowerBound,
            type2: upperBound,
            expected: false,
        },
        {
            type1: upperBound,
            type2: upperBound,
            expected: true,
        },
        {
            type1: bothBounds,
            type2: upperBound,
            expected: true,
        },
        {
            type1: indirectLowerBound,
            type2: upperBound,
            expected: false,
        },
        {
            type1: indirectUpperBound,
            type2: upperBound,
            expected: true,
        },
        {
            type1: cyclic,
            type2: upperBound,
            expected: false,
        },
        {
            type1: unresolved,
            type2: upperBound,
            expected: false,
        },
        {
            type1: coreTypes.AnyOrNull,
            type2: upperBound,
            expected: false,
        },
        {
            type1: coreTypes.Number,
            type2: upperBound,
            expected: true,
        },
        {
            type1: coreTypes.Number.updateNullability(true),
            type2: upperBound,
            expected: false,
        },
        {
            type1: coreTypes.Number.updateNullability(true),
            type2: upperBound.updateNullability(true),
            expected: true,
        },
        {
            type1: coreTypes.Nothing,
            type2: upperBound,
            expected: true,
        },

        // Compare to BothBounds
        {
            type1: unbounded,
            type2: bothBounds,
            expected: false,
        },
        {
            type1: lowerBound,
            type2: bothBounds,
            expected: false,
        },
        {
            type1: upperBound,
            type2: bothBounds,
            expected: false,
        },
        {
            type1: bothBounds,
            type2: bothBounds,
            expected: true,
        },
        {
            type1: indirectLowerBound,
            type2: bothBounds,
            expected: false,
        },
        {
            type1: indirectUpperBound,
            type2: bothBounds,
            expected: false,
        },
        {
            type1: cyclic,
            type2: bothBounds,
            expected: false,
        },
        {
            type1: unresolved,
            type2: bothBounds,
            expected: false,
        },
        {
            type1: coreTypes.AnyOrNull,
            type2: bothBounds,
            expected: false,
        },
        {
            type1: coreTypes.Number,
            type2: bothBounds,
            expected: true,
        },
        {
            type1: coreTypes.Number.updateNullability(true),
            type2: bothBounds,
            expected: false,
        },
        {
            type1: coreTypes.Number.updateNullability(true),
            type2: bothBounds.updateNullability(true),
            expected: true,
        },
        {
            type1: coreTypes.Int,
            type2: bothBounds,
            expected: true,
        },
        {
            type1: coreTypes.Int.updateNullability(true),
            type2: bothBounds,
            expected: false,
        },
        {
            type1: coreTypes.Int.updateNullability(true),
            type2: bothBounds.updateNullability(true),
            expected: true,
        },
        {
            type1: coreTypes.Nothing,
            type2: bothBounds,
            expected: false,
        },

        // Compare to IndirectLowerBound
        {
            type1: indirectLowerBound,
            type2: indirectLowerBound,
            expected: true,
        },
        {
            type1: coreTypes.AnyOrNull,
            type2: indirectLowerBound,
            expected: true,
        },
        {
            type1: coreTypes.Nothing,
            type2: indirectLowerBound,
            expected: false,
        },

        // Compare to IndirectUpperBound
        {
            type1: indirectUpperBound,
            type2: indirectUpperBound,
            expected: true,
        },
        {
            type1: coreTypes.AnyOrNull,
            type2: indirectUpperBound,
            expected: false,
        },
        {
            type1: coreTypes.Nothing,
            type2: indirectUpperBound,
            expected: true,
        },

        // Compare to Cyclic
        {
            type1: cyclic,
            type2: cyclic,
            expected: false,
        },
        {
            type1: coreTypes.AnyOrNull,
            type2: cyclic,
            expected: false,
        },
        {
            type1: coreTypes.Nothing,
            type2: cyclic,
            expected: false,
        },

        // Compare to Unresolved
        {
            type1: cyclic,
            type2: unresolved,
            expected: false,
        },
        {
            type1: coreTypes.AnyOrNull,
            type2: unresolved,
            expected: false,
        },
        {
            type1: coreTypes.Nothing,
            type2: unresolved,
            expected: false,
        },

        // Compare to some other type
        {
            type1: unbounded,
            type2: coreTypes.Any,
            expected: false,
        },
        {
            type1: unbounded,
            type2: coreTypes.AnyOrNull,
            expected: true,
        },
        {
            type1: unbounded.updateNullability(true),
            type2: coreTypes.Any,
            expected: false,
        },
        {
            type1: unbounded.updateNullability(true),
            type2: coreTypes.AnyOrNull,
            expected: true,
        },
        {
            type1: lowerBound,
            type2: coreTypes.Any,
            expected: false,
        },
        {
            type1: lowerBound,
            type2: coreTypes.AnyOrNull,
            expected: true,
        },
        {
            type1: lowerBound.updateNullability(true),
            type2: coreTypes.Any,
            expected: false,
        },
        {
            type1: lowerBound.updateNullability(true),
            type2: coreTypes.AnyOrNull,
            expected: true,
        },
        {
            type1: upperBound,
            type2: coreTypes.Any,
            expected: true,
        },
        {
            type1: upperBound.updateNullability(true),
            type2: coreTypes.AnyOrNull,
            expected: true,
        },
        {
            type1: upperBound,
            type2: coreTypes.Number,
            expected: true,
        },
        {
            type1: upperBound.updateNullability(true),
            type2: coreTypes.Any,
            expected: false,
        },
        {
            type1: upperBound.updateNullability(true),
            type2: coreTypes.AnyOrNull,
            expected: true,
        },
        {
            type1: upperBound.updateNullability(true),
            type2: coreTypes.Number,
            expected: false,
        },
        {
            type1: bothBounds,
            type2: coreTypes.Any,
            expected: true,
        },
        {
            type1: bothBounds.updateNullability(true),
            type2: coreTypes.AnyOrNull,
            expected: true,
        },
        {
            type1: bothBounds,
            type2: coreTypes.Number,
            expected: true,
        },
        {
            type1: bothBounds.updateNullability(true),
            type2: coreTypes.Any,
            expected: false,
        },
        {
            type1: bothBounds.updateNullability(true),
            type2: coreTypes.AnyOrNull,
            expected: true,
        },
        {
            type1: bothBounds.updateNullability(true),
            type2: coreTypes.Number,
            expected: false,
        },
    ];
};

describe('SafeDsTypeChecker', async () => {
    const testCases = (await Promise.all([basic(), classTypesWithTypeParameters(), typeParameterTypes()])).flat();

    describe.each(testCases)('isSubtypeOf', ({ type1, type2, expected }) => {
        it(`should check whether ${type1} a subtype of ${type2}`, () => {
            expect(typeChecker.isSubtypeOf(type1, type2)).toBe(expected);
        });
    });

    describe.each(testCases)('isSupertypeOf', ({ type2, type1, expected }) => {
        it(`should check whether ${type2} a supertype of ${type1}`, () => {
            expect(typeChecker.isSupertypeOf(type2, type1)).toBe(expected);
        });
    });
});

const computeTypeOfDeclarationWithName = <T extends SdsDeclaration>(declarations: T[]) => {
    return (name: string): Type => {
        const result = declarations.find((declaration) => declaration.name === name);
        return typeComputer.computeType(result);
    };
};

/**
 * A test case for {@link SafeDsTypeChecker.isSubtypeOf}.
 */
interface IsSubOrSupertypeOfTest {
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
