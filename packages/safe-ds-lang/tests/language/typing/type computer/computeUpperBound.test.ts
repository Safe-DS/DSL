import { NodeFileSystem } from 'langium/node';
import { describe, it } from 'vitest';
import { isSdsClass, isSdsModule, SdsTypeParameter } from '../../../../src/language/generated/ast.js';
import { createSafeDsServices, getModuleMembers, getTypeParameters } from '../../../../src/language/index.js';
import { Type, UnknownType } from '../../../../src/language/typing/model.js';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';
import { expectEqualTypes } from '../../../helpers/testAssertions.js';
import { IntConstant } from '../../../../src/language/partialEvaluation/model.js';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const coreTypes = services.typing.CoreTypes;
const typeComputer = services.typing.TypeComputer;
const typeFactory = services.typing.TypeFactory;

const code = `
    class MyClass<
        Unbounded,
        LiteralBounds sub literal<2>,
        NamedBounds sub Number,
        TypeParameterBounds sub NamedBounds,

        // Illegal
        CallableBounds sub () -> (),
        UnionBounds sub union<Number, String>,
        UnknownBounds sub unknown,
    >
`;
const module = await getNodeOfType(services, code, isSdsModule);

const classes = getModuleMembers(module).filter(isSdsClass);
const typeParameters = getTypeParameters(classes[0]);

const unbounded = typeParameters[0]!;
const literalBounds = typeParameters[1]!;
const namedBounds = typeParameters[2]!;
const typeParameterBounds = typeParameters[3]!;
const callableBounds = typeParameters[4]!;
const unionBounds = typeParameters[5]!;
const unknownBounds = typeParameters[6]!;

const computeUpperBoundTests: ComputeUpperBoundTest[] = [
    {
        typeParameter: unbounded,
        expected: coreTypes.AnyOrNull,
    },
    {
        typeParameter: literalBounds,
        expected: typeFactory.createLiteralType(new IntConstant(2n)),
    },
    {
        typeParameter: namedBounds,
        expected: coreTypes.Number,
    },
    {
        typeParameter: typeParameterBounds,
        expected: coreTypes.Number,
    },
    {
        typeParameter: callableBounds,
        expected: UnknownType,
    },
    {
        typeParameter: unionBounds,
        expected: UnknownType,
    },
    {
        typeParameter: unknownBounds,
        expected: UnknownType,
    },
];

describe.each(computeUpperBoundTests)('computeUpperBound', ({ typeParameter, expected }) => {
    it(`should return the upper bound (${typeParameter.name})`, () => {
        const actual = typeComputer.computeUpperBound(typeParameter);
        expectEqualTypes(actual, expected);
    });
});

/**
 * A test case for {@link TypeComputer.computeUpperBound}.
 */
interface ComputeUpperBoundTest {
    /**
     * The type parameter to get the bound for.
     */
    typeParameter: SdsTypeParameter;

    /**
     * The expected bound
     */
    expected: Type;
}
