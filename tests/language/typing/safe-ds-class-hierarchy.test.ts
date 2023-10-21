import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { NodeFileSystem } from 'langium/node';
import { clearDocuments } from 'langium/test';
import { isSdsClass, SdsClass } from '../../../src/language/generated/ast.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
const builtinClasses = services.builtins.Classes;
const classHierarchy = services.types.ClassHierarchy;

describe('SafeDsClassHierarchy', async () => {
    beforeEach(async () => {
        // Load the builtin library
        await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
    });

    afterEach(async () => {
        await clearDocuments(services);
    });

    describe('isEqualToOrSubclassOf', () => {
        const testCases = [
            {
                testName: 'should return false if node is undefined',
                node: () => undefined,
                other: () => builtinClasses.Any,
                expected: false,
            },
            {
                testName: 'should return false if other is undefined',
                node: () => builtinClasses.Nothing,
                other: () => undefined,
                expected: false,
            },
            {
                testName: 'should return false if node and other are undefined',
                node: () => undefined,
                other: () => undefined,
                expected: false,
            },
            {
                testName: 'should return true if node is Nothing',
                node: () => builtinClasses.Nothing,
                other: () => builtinClasses.Any,
                expected: true,
            },
            {
                testName: 'should return true if node and other are equal',
                node: () => builtinClasses.Any,
                other: () => builtinClasses.Any,
                expected: true,
            },
            {
                testName: 'should return true if node is a subclass of other',
                node: () => builtinClasses.Int,
                other: () => builtinClasses.Any,
                expected: true,
            },
        ];

        it.each(testCases)('$testName', async ({ node, other, expected }) => {
            expect(classHierarchy.isEqualToOrSubclassOf(node(), other())).toStrictEqual(expected);
        });
    });

    describe('streamSuperclasses', () => {
        const superclassNames = (node: SdsClass | undefined) =>
            classHierarchy
                .streamSuperclasses(node)
                .map((clazz) => clazz.name)
                .toArray();

        it('should return an empty stream if passed undefined', () => {
            expect(superclassNames(undefined)).toStrictEqual([]);
        });

        const testCases = [
            {
                testName: 'should return "Any" if the class has no parent types',
                code: `
                    class A
                `,
                expected: ['Any'],
            },
            {
                testName: 'should return "Any" if the first parent type is not a class',
                code: `
                    class A sub E
                    enum E
                `,
                expected: ['Any'],
            },
            {
                testName: 'should return the superclasses of a class (no cycle, implicit any)',
                code: `
                    class A sub B
                    class B
                `,
                expected: ['B', 'Any'],
            },
            {
                testName: 'should return the superclasses of a class (no cycle, explicit any)',
                code: `
                    class A sub Any
                `,
                expected: ['Any'],
            },
            {
                testName: 'should return the superclasses of a class (cycle)',
                code: `
                    class A sub B
                    class B sub C
                    class C sub A
                `,
                expected: ['B', 'C', 'A', 'Any'],
            },
            {
                testName: 'should only consider the first parent type',
                code: `
                    class A sub B, C
                    class B
                    class C
                `,
                expected: ['B', 'Any'],
            },
        ];

        it.each(testCases)('$testName', async ({ code, expected }) => {
            const firstClass = await getNodeOfType(services, code, isSdsClass);
            expect(superclassNames(firstClass)).toStrictEqual(expected);
        });
    });
});
