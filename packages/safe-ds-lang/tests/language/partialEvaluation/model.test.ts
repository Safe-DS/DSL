import { EmptyFileSystem } from 'langium';
import { describe, expect, it } from 'vitest';
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

const services = createSafeDsServices(EmptyFileSystem).SafeDs;

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
            node: () => new BlockLambdaClosure([], []),
            unequalNodeOfSameType: () => new BlockLambdaClosure([], []),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new ExpressionLambdaClosure([], []),
            unequalNodeOfSameType: () => new ExpressionLambdaClosure([], []),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new SegmentClosure([], []),
            unequalNodeOfSameType: () => new SegmentClosure([], []),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new EvaluatedEnumVariant([], []),
            unequalNodeOfSameType: () => new EvaluatedEnumVariant([], []),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new EvaluatedList([new IntConstant(1n)]),
            unequalNodeOfSameType: () => new EvaluatedList([new IntConstant(2n)]),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new EvaluatedMap([], []),
            unequalNodeOfSameType: () => new EvaluatedMap([], []),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new EvaluatedMapEntry([], []),
            unequalNodeOfSameType: () => new EvaluatedMapEntry([], []),
            nodeOfOtherType: () => NullConstant,
        },
        {
            node: () => new EvaluatedNamedTuple([], []),
            unequalNodeOfSameType: () => new EvaluatedNamedTuple([], []),
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

        it('should return false if the other node is an instance of another class', () => {
            expect(node().equals(nodeOfOtherType())).toBeFalsy();
        });

        it('should return true if both nodes have the same values', () => {
            expect(node().equals(node())).toBeTruthy();
        });

        if (unequalNodeOfSameType) {
            it('should return false if both nodes have different values', () => {
                expect(node().equals(unequalNodeOfSameType())).toBeFalsy();
            });
        }
    });

    const toStringTests: ToStringTest<EvaluatedNode>[] = [
        { node: new BooleanConstant(true), expectedString: 'true' },
        { node: new FloatConstant(1.0), expectedString: '1.0' },
        { node: new IntConstant(1n), expectedString: '1' },
        { node: NullConstant, expectedString: 'null' },
        { node: new StringConstant('foo'), expectedString: '"foo"' },
        { node: new BlockLambdaClosure([], []), expectedString: '[] => []' },
        { node: new ExpressionLambdaClosure([], []), expectedString: '() => []' },
        { node: new SegmentClosure([], []), expectedString: '[] => []' },
        { node: new EvaluatedEnumVariant([], []), expectedString: '[]' },
        { node: new EvaluatedList([new IntConstant(1n)]), expectedString: '[1]' },
        { node: new EvaluatedMap([], []), expectedString: '[:]' },
        { node: new EvaluatedMapEntry([], []), expectedString: '[] => []' },
        { node: new EvaluatedNamedTuple([], []), expectedString: '[:]' },
        { node: UnknownEvaluatedNode, expectedString: 'unknown' },
    ];

    describe.each(toStringTests)('toString', ({ node, expectedString }) => {
        it(`should return the expected string representation (${node.constructor.name})`, () => {
            expect(node.toString()).toStrictEqual(expectedString);
        });
    });

    const isFullyEvaluatedTests: IsFullyEvaluatedTest[] = [
        { node: new BooleanConstant(true), expectedIsFullyEvaluated: true },
        { node: new FloatConstant(1.0), expectedIsFullyEvaluated: true },
        { node: new IntConstant(1n), expectedIsFullyEvaluated: true },
        { node: NullConstant, expectedIsFullyEvaluated: true },
        { node: new StringConstant('foo'), expectedIsFullyEvaluated: true },
        { node: new BlockLambdaClosure([], []), expectedIsFullyEvaluated: false },
        { node: new ExpressionLambdaClosure([], []), expectedIsFullyEvaluated: false },
        { node: new SegmentClosure([], []), expectedIsFullyEvaluated: false },
        { node: new EvaluatedEnumVariant([], []), expectedIsFullyEvaluated: false },
        { node: new EvaluatedList([new IntConstant(1n)]), expectedIsFullyEvaluated: false },
        { node: new EvaluatedMap([], []), expectedIsFullyEvaluated: false },
        { node: new EvaluatedMapEntry([], []), expectedIsFullyEvaluated: false },
        { node: new EvaluatedNamedTuple([], []), expectedIsFullyEvaluated: false },
        { node: UnknownEvaluatedNode, expectedIsFullyEvaluated: false },
    ];
    describe.each(isFullyEvaluatedTests)('isFullyEvaluated', ({ node, expectedIsFullyEvaluated }) => {
        it(`should return the expected value (${node.constructor.name} -- ${node})`, () => {
            expect(node.isFullyEvaluated).toStrictEqual(expectedIsFullyEvaluated);
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
        it(`should return the expected string representation (${node.constructor.name})`, () => {
            expect(node.toInterpolationString()).toStrictEqual(expectedString);
        });
    });

    describe('BlockLambdaClosure', () => {});

    describe('ExpressionLambdaClosure', () => {});

    describe('SegmentClosure', () => {});

    describe('EvaluatedList', () => {
        // TODO test getElementByIndex
    });

    describe('EvaluatedMap', () => {
        // TODO test getLastValueForKey
    });

    describe('EvaluatedNamedTuple', () => {
        // TODO test getSubstitutionByReference
        // TODO test getSubstitutionByIndex
        // TODO test unwrap
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
    expectedIsFullyEvaluated: boolean;
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
