import { streamAllContents } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { clearDocuments } from 'langium/test';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    isSdsClass,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsModule,
} from '../../../src/language/generated/ast.js';
import { getModuleMembers } from '../../../src/language/helpers/nodeProperties.js';
import { createSafeDsServices } from '../../../src/language/index.js';
import { ClassType, Type, UnionType, UnknownType } from '../../../src/language/typing/model.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
const coreTypes = services.types.CoreTypes;
const typeChecker = services.types.TypeChecker;
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

describe('SafeDsTypeChecker', async () => {
    beforeEach(async () => {
        // Load the builtin library
        await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
    });

    afterEach(async () => {
        await clearDocuments(services);
    });

    const testCases: IsAssignableToTest[] = [
        // Callable type to X
        // TODO
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
            expected: false,
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
        // Enum type to X
        // TODO
        // Enum variant type to X
        // TODO
        // Literal type to X
        // TODO
        // Named tuple type to X
        // TODO
        // Static type to X
        // TODO
        // Union type to X
        // TODO
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
