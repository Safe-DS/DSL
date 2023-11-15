import { NodeFileSystem } from 'langium/node';
import { describe, expect, it } from 'vitest';
import { isSdsClass, isSdsEnum, isSdsModule } from '../../../../src/language/generated/ast.js';
import { getEnumVariants, getModuleMembers } from '../../../../src/language/helpers/nodeProperties.js';
import { createSafeDsServicesWithBuiltins } from '../../../../src/language/index.js';
import {
    ClassType,
    EnumType,
    EnumVariantType,
    LiteralType,
    Type,
    UnknownType,
} from '../../../../src/language/typing/model.js';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const coreTypes = services.types.CoreTypes;
const typeChecker = services.types.TypeChecker;
const typeComputer = services.types.TypeComputer;

const code = `
    class MyClass

    enum ConstantEnum {
        Variant1
        Variant2(const param: Int)
    }

    enum NormalEnum {
        Variant1
        Variant2(param: Int)
    }
`;
const module = await getNodeOfType(services, code, isSdsModule);
const classes = getModuleMembers(module).filter(isSdsClass);
const myClassType = typeComputer.computeType(classes[0]) as ClassType;

const enums = getModuleMembers(module).filter(isSdsEnum);
const constantEnum = enums[0];
const normalEnum = enums[1];
const constantEnumType = typeComputer.computeType(constantEnum) as EnumType;
const normalEnumType = typeComputer.computeType(normalEnum) as EnumType;

const constantEnumVariantType = typeComputer.computeType(getEnumVariants(constantEnum)[1]) as EnumVariantType;
const normalEnumVariantType = typeComputer.computeType(getEnumVariants(normalEnum)[1]) as EnumVariantType;

describe('SafeDsTypeChecker', async () => {
    const testCases: CanBeTypeOfConstantParameterTest[] = [
        {
            type: coreTypes.Any,
            expected: false,
        },
        {
            type: coreTypes.Boolean,
            expected: true,
        },
        {
            type: coreTypes.Float,
            expected: true,
        },
        {
            type: coreTypes.Int,
            expected: true,
        },
        {
            type: coreTypes.List,
            expected: true,
        },
        {
            type: coreTypes.Map,
            expected: true,
        },
        {
            type: coreTypes.Nothing,
            expected: true,
        },
        {
            type: coreTypes.String,
            expected: true,
        },
        {
            type: myClassType,
            expected: false,
        },
        {
            type: constantEnumType,
            expected: true,
        },
        {
            type: normalEnumType,
            expected: false,
        },
        {
            type: constantEnumVariantType,
            expected: true,
        },
        {
            type: normalEnumVariantType,
            expected: false,
        },
        {
            type: new LiteralType(),
            expected: true,
        },
        {
            type: UnknownType,
            expected: true,
        },
    ];

    describe.each(testCases)('isUsableAsTypeOfConstantParameter', ({ type, expected }) => {
        it(type.toString(), () => {
            expect(typeChecker.canBeTypeOfConstantParameter(type)).toBe(expected);
        });

        it(type.updateNullability(true).toString, () => {
            expect(typeChecker.canBeTypeOfConstantParameter(type.updateNullability(true))).toBe(expected);
        });
    });
});

/**
 * A test case for {@link SafeDsTypeChecker.canBeTypeOfConstantParameter}.
 */
interface CanBeTypeOfConstantParameterTest {
    /**
     * The type to check.
     */
    type: Type;

    /**
     * Whether {@link type} is expected to be usable as the type of a constant parameter.
     */
    expected: boolean;
}
