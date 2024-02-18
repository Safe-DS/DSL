import { NodeFileSystem } from 'langium/node';
import { describe, it } from 'vitest';
import { createSafeDsServicesWithBuiltins } from '../../../../src/language/index.js';
import {
    BooleanConstant,
    FloatConstant,
    IntConstant,
    NullConstant,
    StringConstant,
} from '../../../../src/language/partialEvaluation/model.js';
import { LiteralType, Type } from '../../../../src/language/typing/model.js';
import { expectEqualTypes } from '../../../helpers/testAssertions.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const coreTypes = services.types.CoreTypes;
const typeComputer = services.types.TypeComputer;

const tests: ComputeClassTypeForLiteralTypeTest[] = [
    // Base cases
    {
        literalType: new LiteralType(),
        expected: coreTypes.Nothing,
    },
    {
        literalType: new LiteralType(new BooleanConstant(false)),
        expected: coreTypes.Boolean,
    },
    {
        literalType: new LiteralType(new FloatConstant(1.5)),
        expected: coreTypes.Float,
    },
    {
        literalType: new LiteralType(new IntConstant(1n)),
        expected: coreTypes.Int,
    },
    {
        literalType: new LiteralType(NullConstant),
        expected: coreTypes.NothingOrNull,
    },
    {
        literalType: new LiteralType(new StringConstant('')),
        expected: coreTypes.String,
    },
    // Nullable types
    {
        literalType: new LiteralType(new BooleanConstant(false), NullConstant),
        expected: coreTypes.Boolean.updateExplicitNullability(true),
    },
    {
        literalType: new LiteralType(new FloatConstant(1.5), NullConstant),
        expected: coreTypes.Float.updateExplicitNullability(true),
    },
    {
        literalType: new LiteralType(new IntConstant(1n), NullConstant),
        expected: coreTypes.Int.updateExplicitNullability(true),
    },
    {
        literalType: new LiteralType(new StringConstant(''), NullConstant),
        expected: coreTypes.String.updateExplicitNullability(true),
    },
    // Other combinations
    {
        literalType: new LiteralType(new BooleanConstant(false), new FloatConstant(1.5)),
        expected: coreTypes.Any,
    },
    {
        literalType: new LiteralType(new FloatConstant(1.5), new IntConstant(1n)),
        expected: coreTypes.Number,
    },
    {
        literalType: new LiteralType(new IntConstant(1n), new StringConstant('')),
        expected: coreTypes.Any,
    },
    {
        literalType: new LiteralType(new BooleanConstant(false), new FloatConstant(1.5), NullConstant),
        expected: coreTypes.AnyOrNull,
    },
    {
        literalType: new LiteralType(new FloatConstant(1.5), new IntConstant(1n), NullConstant),
        expected: coreTypes.Number.updateExplicitNullability(true),
    },
    {
        literalType: new LiteralType(new IntConstant(1n), new StringConstant(''), NullConstant),
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
