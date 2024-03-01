import { NodeFileSystem } from 'langium/node';
import { describe, it } from 'vitest';
import {
    BooleanConstant,
    FloatConstant,
    IntConstant,
    NullConstant,
    StringConstant,
} from '../../../../src/language/partialEvaluation/model.js';
import { LiteralType, Type } from '../../../../src/language/typing/model.js';
import { expectEqualTypes } from '../../../helpers/testAssertions.js';
import { createSafeDsServices } from '../../../../src/language/index.js';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const coreTypes = services.types.CoreTypes;
const factory = services.types.TypeFactory;
const typeComputer = services.types.TypeComputer;

const tests: ComputeClassTypeForLiteralTypeTest[] = [
    // Base cases
    {
        literalType: factory.createLiteralType(),
        expected: coreTypes.Nothing,
    },
    {
        literalType: factory.createLiteralType(new BooleanConstant(false)),
        expected: coreTypes.Boolean,
    },
    {
        literalType: factory.createLiteralType(new FloatConstant(1.5)),
        expected: coreTypes.Float,
    },
    {
        literalType: factory.createLiteralType(new IntConstant(1n)),
        expected: coreTypes.Int,
    },
    {
        literalType: factory.createLiteralType(NullConstant),
        expected: coreTypes.NothingOrNull,
    },
    {
        literalType: factory.createLiteralType(new StringConstant('')),
        expected: coreTypes.String,
    },
    // Nullable types
    {
        literalType: factory.createLiteralType(new BooleanConstant(false), NullConstant),
        expected: coreTypes.Boolean.withExplicitNullability(true),
    },
    {
        literalType: factory.createLiteralType(new FloatConstant(1.5), NullConstant),
        expected: coreTypes.Float.withExplicitNullability(true),
    },
    {
        literalType: factory.createLiteralType(new IntConstant(1n), NullConstant),
        expected: coreTypes.Int.withExplicitNullability(true),
    },
    {
        literalType: factory.createLiteralType(new StringConstant(''), NullConstant),
        expected: coreTypes.String.withExplicitNullability(true),
    },
    // Other combinations
    {
        literalType: factory.createLiteralType(new BooleanConstant(false), new FloatConstant(1.5)),
        expected: coreTypes.Any,
    },
    {
        literalType: factory.createLiteralType(new FloatConstant(1.5), new IntConstant(1n)),
        expected: coreTypes.Number,
    },
    {
        literalType: factory.createLiteralType(new IntConstant(1n), new StringConstant('')),
        expected: coreTypes.Any,
    },
    {
        literalType: factory.createLiteralType(new BooleanConstant(false), new FloatConstant(1.5), NullConstant),
        expected: coreTypes.AnyOrNull,
    },
    {
        literalType: factory.createLiteralType(new FloatConstant(1.5), new IntConstant(1n), NullConstant),
        expected: coreTypes.Number.withExplicitNullability(true),
    },
    {
        literalType: factory.createLiteralType(new IntConstant(1n), new StringConstant(''), NullConstant),
        expected: coreTypes.AnyOrNull,
    },
];

describe.each(tests)('computeClassTypeForLiteralType', ({ literalType, expected }) => {
    it(`should return the class type for a literal type (${literalType})`, () => {
        const actual = typeComputer.computeClassTypeForLiteralType(literalType);
        expectEqualTypes(actual, expected);
    });
});

/**
 * A test case for {@link computeClassTypeForLiteralType}.
 */
interface ComputeClassTypeForLiteralTypeTest {
    /**
     * The literal type to compute the class type for.
     */
    literalType: LiteralType;

    /**
     * The expected type.
     */
    expected: Type;
}
