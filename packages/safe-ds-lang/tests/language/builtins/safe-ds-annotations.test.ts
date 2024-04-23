import { describe, expect, it } from 'vitest';
import { NodeFileSystem } from 'langium/node';
import { createSafeDsServices } from '../../../src/language/index.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import { isSdsClass } from '../../../src/language/generated/ast.js';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const builtinAnnotations = services.builtins.Annotations;

describe('getCategory', () => {
    const testCases = [
        {
            testName: 'no annotation',
            code: `
            package test

            class Test
        `,
            expected: undefined,
        },
        {
            testName: 'annotation with invalid value',
            code: `
            package test

            @Category(1)
            class Test
        `,
            expected: undefined,
        },
        {
            testName: 'annotation with valid value',
            code: `
            package test

            @Category(DataScienceCategory.DataPreparation)
            class Test
        `,
            expected: 'DataPreparation',
        },
    ];

    it.each(testCases)('should return the category of the declaration ($testName)', async ({ code, expected }) => {
        const node = await getNodeOfType(services, code, isSdsClass);
        expect(builtinAnnotations.getCategory(node)?.name).toBe(expected);
    });
});

describe('getTags', () => {
    const testCases = [
        {
            testName: 'no annotation',
            code: `
            package test

            class Test
        `,
            expected: [],
        },
        {
            testName: 'annotation with invalid value',
            code: `
            package test

            @Tags(1)
            class Test
        `,
            expected: [],
        },
        {
            testName: 'annotation with some valid values',
            code: `
            package test

            @Tags([1, "test"])
            class Test
        `,
            expected: ['test'],
        },
        {
            testName: 'annotation with all valid values',
            code: `
            package test

            @Tags(["hello", "world"])
            class Test
        `,
            expected: ['hello', 'world'],
        },
    ];

    it.each(testCases)('should return the category of the declaration ($testName)', async ({ code, expected }) => {
        const node = await getNodeOfType(services, code, isSdsClass);
        expect(builtinAnnotations.getTags(node)).toStrictEqual(expected);
    });
});
