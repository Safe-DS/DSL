import { EmptyFileSystem } from 'langium';
import { describe, expect, it } from 'vitest';
import {
    isSdsEnumVariant,
    isSdsExpressionLambda,
    isSdsReference,
    isSdsResult,
    type SdsBlockLambdaResult,
} from '../../../src/language/generated/ast.js';
import { getParameters } from '../../../src/language/helpers/nodeProperties.js';
import { createSafeDsServices } from '../../../src/language/index.js';
import {
    BlockLambdaClosure,
    BooleanConstant,
    Constant,
    EvaluatedEnumVariant,
    EvaluatedList,
    EvaluatedMap,
    EvaluatedMapEntry,
    EvaluatedNamedTuple,
    EvaluatedNode,
    ExpressionLambdaClosure,
    FloatConstant,
    IntConstant,
    NullConstant,
    SegmentClosure,
    StringConstant,
    UnknownEvaluatedNode,
} from '../../../src/language/partialEvaluation/model.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const code = `
enum MyEnum {
    MyEnumVariant1
    MyEnumVariant2(p: Int)
}
segment mySegment() -> (result1: Int, result2: Int) {
    () -> 1;
    () -> 2;

    (() { yield a; })().a;
    MyEnum;
}
`;
const enumVariantWithoutParameters = await getNodeOfType(services, code, isSdsEnumVariant, 0);
const enumVariantWithParameters = await getNodeOfType(services, code, isSdsEnumVariant, 1);
const result1 = await getNodeOfType(services, code, isSdsResult, 0);
const result2 = await getNodeOfType(services, code, isSdsResult, 0);
const enumVariantParameter = getParameters(enumVariantWithParameters)[0]!;
const expressionLambdaResult1 = (await getNodeOfType(services, code, isSdsExpressionLambda, 0)).result;
const expressionLambdaResult2 = (await getNodeOfType(services, code, isSdsExpressionLambda, 1)).result;
const reference1 = await getNodeOfType(services, code, isSdsReference, 0);
const reference2 = await getNodeOfType(services, code, isSdsReference, 1);
const blockLambdaResult1 = reference1.target.ref as SdsBlockLambdaResult;

describe('partial evaluation model', async () => {
    const equalsTests: EqualsTest<EvaluatedNode>[] = [
        {
            node: () => new BooleanConstant(true),
            unequalNodeOfSameType: () => new BooleanConstant(false),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new FloatConstant(1.0),
            unequalNodeOfSameType: () => new FloatConstant(2.0),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new IntConstant(1n),
            unequalNodeOfSameType: () => new IntConstant(2n),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => NullConstant,
            nodeOfOtherType: () => new StringConstant('foo'),
        },
        {
            node: () => new StringConstant('foo'),
            unequalNodeOfSameType: () => new StringConstant('bar'),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new BlockLambdaClosure(new Map([[enumVariantParameter, NullConstant]]), []),
            unequalNodeOfSameType: () => new BlockLambdaClosure(new Map(), []),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () =>
                new ExpressionLambdaClosure(new Map([[enumVariantParameter, NullConstant]]), expressionLambdaResult1),
            unequalNodeOfSameType: () => new ExpressionLambdaClosure(new Map(), expressionLambdaResult2),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new SegmentClosure([result1]),
            unequalNodeOfSameType: () => new SegmentClosure([]),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () =>
                new EvaluatedEnumVariant(enumVariantWithParameters, new Map([[enumVariantParameter, NullConstant]])),
            unequalNodeOfSameType: () => new EvaluatedEnumVariant(enumVariantWithoutParameters, new Map()),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new EvaluatedList([new IntConstant(1n)]),
            unequalNodeOfSameType: () => new EvaluatedList([new IntConstant(2n)]),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new EvaluatedMap([new EvaluatedMapEntry(NullConstant, NullConstant)]),
            unequalNodeOfSameType: () => new EvaluatedMap([new EvaluatedMapEntry(NullConstant, new IntConstant(1n))]),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new EvaluatedMapEntry(NullConstant, NullConstant),
            unequalNodeOfSameType: () => new EvaluatedMapEntry(UnknownEvaluatedNode, NullConstant),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new EvaluatedNamedTuple(new Map([[result1, NullConstant]])),
            unequalNodeOfSameType: () => new EvaluatedNamedTuple(new Map()),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => UnknownEvaluatedNode,
            nodeOfOtherType: () => NullConstant,
        },
    ];

    describe.each(equalsTests)('equals', ({ node, unequalNodeOfSameType, nodeOfOtherType }) => {
        it(`should return true if both nodes are the same instance (${node().constructor.name})`, () => {
            const nodeInstance = node();
            expect(nodeInstance.equals(nodeInstance)).toBeTruthy();
        });

        it(`should return false if the other node is an instance of another class (${node().constructor.name})`, () => {
            expect(node().equals(nodeOfOtherType())).toBeFalsy();
        });

        it(`should return true if both nodes have the same values (${node().constructor.name})`, () => {
            expect(node().equals(node())).toBeTruthy();
        });

        if (unequalNodeOfSameType) {
            it(`should return false if both nodes have different values (${node().constructor.name})`, () => {
                expect(node().equals(unequalNodeOfSameType())).toBeFalsy();
            });
        }
    });

    const toStringTests: ToStringTest<EvaluatedNode>[] = [
        {
            node: new BooleanConstant(true),
            expectedString: 'true',
        },
        {
            node: new FloatConstant(1.5),
            expectedString: '1.5',
        },
        {
            node: new IntConstant(1n),
            expectedString: '1',
        },
        {
            node: NullConstant,
            expectedString: 'null',
        },
        {
            node: new StringConstant('foo'),
            expectedString: '"foo"',
        },
        {
            node: new BlockLambdaClosure(new Map(), []),
            expectedString: '$BlockLambdaClosure',
        },
        {
            node: new ExpressionLambdaClosure(new Map(), expressionLambdaResult1),
            expectedString: '$ExpressionLambdaClosure',
        },
        {
            node: new SegmentClosure([]),
            expectedString: '$SegmentClosure',
        },
        {
            node: new EvaluatedEnumVariant(enumVariantWithoutParameters, undefined),
            expectedString: 'MyEnumVariant1',
        },
        {
            node: new EvaluatedEnumVariant(enumVariantWithParameters, undefined),
            expectedString: 'MyEnumVariant2',
        },
        {
            node: new EvaluatedEnumVariant(
                enumVariantWithParameters,
                new Map([[enumVariantParameter, UnknownEvaluatedNode]]),
            ),
            expectedString: 'MyEnumVariant2(?)',
        },
        {
            node: new EvaluatedEnumVariant(enumVariantWithParameters, new Map([[enumVariantParameter, NullConstant]])),
            expectedString: 'MyEnumVariant2(null)',
        },
        {
            node: new EvaluatedList([]),
            expectedString: '[]',
        },
        {
            node: new EvaluatedList([NullConstant]),
            expectedString: '[null]',
        },
        {
            node: new EvaluatedMap([]),
            expectedString: '{}',
        },
        {
            node: new EvaluatedMap([new EvaluatedMapEntry(NullConstant, NullConstant)]),
            expectedString: '{null: null}',
        },
        {
            node: new EvaluatedMapEntry(NullConstant, NullConstant),
            expectedString: 'null: null',
        },
        {
            node: new EvaluatedNamedTuple(new Map()),
            expectedString: '()',
        },
        {
            node: new EvaluatedNamedTuple(new Map([[result1, NullConstant]])),
            expectedString: '(result1 = null)',
        },
        {
            node: new EvaluatedNamedTuple(new Map([[result1, UnknownEvaluatedNode]])),
            expectedString: '(result1 = ?)',
        },
        {
            node: UnknownEvaluatedNode,
            expectedString: '?',
        },
    ];

    describe.each(toStringTests)('toString', ({ node, expectedString }) => {
        it(`should return the expected string representation (${node.constructor.name} -- ${node})`, () => {
            expect(node.toString()).toStrictEqual(expectedString);
        });
    });

    const isFullyEvaluatedTests: IsFullyEvaluatedTest[] = [
        {
            node: new BooleanConstant(true),
            expectedValue: true,
        },
        {
            node: new FloatConstant(1.0),
            expectedValue: true,
        },
        {
            node: new IntConstant(1n),
            expectedValue: true,
        },
        {
            node: NullConstant,
            expectedValue: true,
        },
        {
            node: new StringConstant('foo'),
            expectedValue: true,
        },
        {
            node: new BlockLambdaClosure(new Map(), []),
            expectedValue: false,
        },
        {
            node: new ExpressionLambdaClosure(new Map(), expressionLambdaResult1),
            expectedValue: false,
        },
        {
            node: new SegmentClosure([]),
            expectedValue: false,
        },
        {
            node: new EvaluatedEnumVariant(enumVariantWithoutParameters, undefined),
            expectedValue: true,
        },
        {
            node: new EvaluatedEnumVariant(enumVariantWithParameters, undefined),
            expectedValue: false,
        },
        {
            node: new EvaluatedEnumVariant(
                enumVariantWithParameters,
                new Map([[enumVariantParameter, UnknownEvaluatedNode]]),
            ),
            expectedValue: false,
        },
        {
            node: new EvaluatedEnumVariant(enumVariantWithParameters, new Map([[enumVariantParameter, NullConstant]])),
            expectedValue: true,
        },
        {
            node: new EvaluatedList([NullConstant]),
            expectedValue: true,
        },
        {
            node: new EvaluatedList([UnknownEvaluatedNode]),
            expectedValue: false,
        },
        {
            node: new EvaluatedMap([new EvaluatedMapEntry(NullConstant, NullConstant)]),
            expectedValue: true,
        },
        {
            node: new EvaluatedMap([new EvaluatedMapEntry(UnknownEvaluatedNode, NullConstant)]),
            expectedValue: false,
        },
        {
            node: new EvaluatedMap([new EvaluatedMapEntry(NullConstant, UnknownEvaluatedNode)]),
            expectedValue: false,
        },
        {
            node: new EvaluatedMapEntry(NullConstant, NullConstant),
            expectedValue: true,
        },
        {
            node: new EvaluatedMapEntry(UnknownEvaluatedNode, NullConstant),
            expectedValue: false,
        },
        {
            node: new EvaluatedMapEntry(NullConstant, UnknownEvaluatedNode),
            expectedValue: false,
        },
        {
            node: new EvaluatedNamedTuple(new Map()),
            expectedValue: true,
        },
        {
            node: new EvaluatedNamedTuple(new Map([[result1, NullConstant]])),
            expectedValue: true,
        },
        {
            node: new EvaluatedNamedTuple(new Map([[result1, UnknownEvaluatedNode]])),
            expectedValue: false,
        },
        {
            node: UnknownEvaluatedNode,
            expectedValue: false,
        },
    ];
    describe.each(isFullyEvaluatedTests)('isFullyEvaluated', ({ node, expectedValue }) => {
        it(`should return the expected value (${node.constructor.name} -- ${node})`, () => {
            expect(node.isFullyEvaluated).toStrictEqual(expectedValue);
        });
    });

    const toInterpolationStringTests: ToStringTest<Constant>[] = [
        { node: new BooleanConstant(true), expectedString: 'true' },
        { node: new FloatConstant(1.5), expectedString: '1.5' },
        { node: new IntConstant(1n), expectedString: '1' },
        { node: NullConstant, expectedString: 'null' },
        { node: new StringConstant('foo'), expectedString: 'foo' },
    ];

    describe.each(toInterpolationStringTests)('toInterpolationString', ({ node, expectedString }) => {
        it(`should return the expected string representation (${node.constructor.name} -- ${node})`, () => {
            expect(node.toInterpolationString()).toStrictEqual(expectedString);
        });
    });

    describe('EvaluatedList', () => {
        describe('getElementByIndex', () => {
            it.each([
                {
                    list: new EvaluatedList([]),
                    index: 0,
                    expectedValue: UnknownEvaluatedNode,
                },
                {
                    list: new EvaluatedList([new IntConstant(1n)]),
                    index: 0,
                    expectedValue: new IntConstant(1n),
                },
            ])('should return the element at the given index (%#)', ({ list, index, expectedValue }) => {
                expect(list.getElementByIndex(index)).toStrictEqual(expectedValue);
            });
        });
    });

    describe('EvaluatedMap', () => {
        describe('getLastValueForKey', () => {
            it.each([
                {
                    map: new EvaluatedMap([]),
                    key: NullConstant,
                    expectedValue: UnknownEvaluatedNode,
                },
                {
                    map: new EvaluatedMap([new EvaluatedMapEntry(NullConstant, NullConstant)]),
                    key: NullConstant,
                    expectedValue: NullConstant,
                },
                {
                    map: new EvaluatedMap([
                        new EvaluatedMapEntry(NullConstant, NullConstant),
                        new EvaluatedMapEntry(NullConstant, new IntConstant(1n)),
                    ]),
                    key: NullConstant,
                    expectedValue: new IntConstant(1n),
                },
            ])('should return the last value for the given key (%#)', ({ map, key, expectedValue }) => {
                expect(map.getLastValueForKey(key)).toStrictEqual(expectedValue);
            });
        });
    });

    describe('EvaluatedNamedTuple', () => {
        describe('getSubstitutionByReference', () => {
            it.each([
                {
                    tuple: new EvaluatedNamedTuple(new Map([[blockLambdaResult1, NullConstant]])),
                    reference: reference1,
                    expectedValue: NullConstant,
                },
                {
                    tuple: new EvaluatedNamedTuple(new Map([[result1, NullConstant]])),
                    reference: reference2,
                    expectedValue: UnknownEvaluatedNode,
                },
            ])(
                'should return the substitution for the target of the given reference',
                ({ tuple, reference, expectedValue }) => {
                    expect(tuple.getSubstitutionByReference(reference)).toStrictEqual(expectedValue);
                },
            );
        });

        describe('getSubstitutionByIndex', () => {
            it.each([
                {
                    tuple: new EvaluatedNamedTuple(new Map()),
                    index: 0,
                    expectedValue: UnknownEvaluatedNode,
                },
                {
                    tuple: new EvaluatedNamedTuple(new Map([[result1, NullConstant]])),
                    index: 0,
                    expectedValue: NullConstant,
                },
            ])('should return the substitution at the given index', ({ tuple, index, expectedValue }) => {
                expect(tuple.getSubstitutionByIndex(index)).toStrictEqual(expectedValue);
            });
        });

        describe('unwrap', () => {
            it('should return the single substitution if the tuple contains exactly one substitution', () => {
                const tuple = new EvaluatedNamedTuple(new Map([[result1, NullConstant]]));
                expect(tuple.unwrap()).toStrictEqual(NullConstant);
            });

            it('should return the tuple if it contains no substitutions', () => {
                const tuple = new EvaluatedNamedTuple(new Map([]));
                expect(tuple.unwrap()).toStrictEqual(tuple);
            });

            it('should return the tuple if it contains more than one substitution', () => {
                const tuple = new EvaluatedNamedTuple(
                    new Map([
                        [result1, NullConstant],
                        [result2, NullConstant],
                    ]),
                );
                expect(tuple.unwrap()).toStrictEqual(tuple);
            });
        });
    });
});

/**
 * Tests for {@link EvaluatedNode.isFullyEvaluated}.
 */
interface IsFullyEvaluatedTest {
    /**
     * The node to test.
     */
    node: EvaluatedNode;

    /**
     * Whether the node is fully evaluated.
     */
    expectedValue: boolean;
}

/**
 * Tests for {@link EvaluatedNode.equals}.
 */
interface EqualsTest<T extends EvaluatedNode> {
    /**
     * Produces the first node to compare, which must not be equal to {@link unequalNodeOfSameType}.
     */
    node: () => T;

    /**
     * Produces the second node to compare, which must not be equal to {@link node}. If the type is a singleton, leave
     * this field undefined.
     */
    unequalNodeOfSameType?: () => T;

    /**
     * Produces a node of a different type.
     */
    nodeOfOtherType: () => EvaluatedNode;
}

/**
 * Tests for {@link EvaluatedNode.toString} and {@link Constant.toInterpolationString}.
 */
interface ToStringTest<T extends EvaluatedNode> {
    /**
     * The node to convert to a string.
     */
    node: T;

    /**
     * The expected string representation of the node.
     */
    expectedString: string;
}
