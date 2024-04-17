import { NodeFileSystem } from 'langium/node';
import { describe, it } from 'vitest';
import { isSdsClass, isSdsModule, SdsTypeParameter } from '../../../../src/language/generated/ast.js';
import { createSafeDsServices, getModuleMembers, getTypeParameters } from '../../../../src/language/index.js';
import { Type, UnknownType } from '../../../../src/language/typing/model.js';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';
import { expectEqualTypes } from '../../../helpers/testAssertions.js';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const coreTypes = services.typing.CoreTypes;
const typeComputer = services.typing.TypeComputer;

const code = `
    class MyClass<
        Unbounded,
        LegalDirectBounds sub Number,
        LegalIndirectBounds sub LegalDirectBounds,
        UnnamedBounds sub literal<2>,
        UnresolvedBounds sub Unresolved,
    >
`;
const module = await getNodeOfType(services, code, isSdsModule);

const classes = getModuleMembers(module).filter(isSdsClass);
const typeParameters = getTypeParameters(classes[0]);

const unbounded = typeParameters[0]!;
const legalDirectBounds = typeParameters[1]!;
const legalIndirectBounds = typeParameters[2]!;
const unnamedBounds = typeParameters[3]!;
const unresolvedBounds = typeParameters[4]!;

const computeUpperBoundTests: ComputeUpperBoundTest[] = [
    {
        typeParameter: unbounded,
        expected: coreTypes.AnyOrNull,
    },
    {
        typeParameter: legalDirectBounds,
        expected: coreTypes.Number,
    },
    {
        typeParameter: legalIndirectBounds,
        expected: coreTypes.Number,
    },
    {
        typeParameter: unnamedBounds,
        expected: UnknownType,
    },
    {
        typeParameter: unresolvedBounds,
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
