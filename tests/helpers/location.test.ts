import { describe, expect, it } from 'vitest';
import { getNodeByLocation, isLocationEqual, locationToString, positionToString, rangeToString } from './location.js';
import { createSafeDsServices } from '../../src/language/safe-ds-module.js';
import { EmptyFileSystem } from 'langium';
import { AssertionError } from 'assert';
import { parseHelper } from 'langium/test';
import { isSdsClass } from '../../src/language/generated/ast.js';

describe('positionToString', () => {
    it.each([
        {
            position: { line: 0, character: 0 },
            expected: '1:1',
        },
        {
            position: { line: 1, character: 0 },
            expected: '2:1',
        },
    ])('should convert position to string ($expected)', ({ position, expected }) => {
        expect(positionToString(position)).toBe(expected);
    });
});

describe('rangeToString', () => {
    it.each([
        {
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            expected: '1:1 -> 1:1',
        },
        {
            range: { start: { line: 0, character: 0 }, end: { line: 1, character: 0 } },
            expected: '1:1 -> 2:1',
        },
    ])('should convert range to string ($expected)', ({ range, expected }) => {
        expect(rangeToString(range)).toBe(expected);
    });
});

describe('locationToString', () => {
    it.each([
        {
            location: {
                uri: 'file:///test.sdstest',
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            },
            expected: 'file:///test.sdstest:1:1 -> 1:1',
        },
        {
            location: {
                uri: 'file:///test.sdstest',
                range: { start: { line: 0, character: 0 }, end: { line: 1, character: 0 } },
            },
            expected: 'file:///test.sdstest:1:1 -> 2:1',
        },
    ])(`should convert location to string ($expected)`, ({ location, expected }) => {
        expect(locationToString(location)).toBe(expected);
    });
});

describe('isLocationEqual', () => {
    it.each([
        {
            location1: {
                uri: 'file:///test.sdstest',
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            },
            location2: {
                uri: 'file:///test.sdstest',
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            },
            expected: true,
            id: 'same location',
        },
        {
            location1: {
                uri: 'file:///test.sdstest',
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            },
            location2: {
                uri: 'file:///test2.sdstest',
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            },
            expected: false,
            id: 'different uri',
        },
        {
            location1: {
                uri: 'file:///test.sdstest',
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            },
            location2: {
                uri: 'file:///test.sdstest',
                range: { start: { line: 0, character: 0 }, end: { line: 1, character: 0 } },
            },
            expected: false,
            id: 'different range',
        },
    ])('should compare locations for equality ($id)', ({ location1, location2, expected }) => {
        expect(isLocationEqual(location1, location2)).toBe(expected);
    });
});

describe('getNodeByLocation', () => {
    it('should raise if no document is found', () => {
        const services = createSafeDsServices(EmptyFileSystem).SafeDs;

        expect(() => {
            getNodeByLocation(services, {
                uri: 'file:///test.sdstest',
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            });
        }).toThrowErrorMatchingSnapshot();
    });

    it('should raise if no node is found', async () => {
        const services = createSafeDsServices(EmptyFileSystem).SafeDs;
        const document = await parseHelper(services)(`class C`);

        expect(() => {
            getNodeByLocation(services, {
                uri: document.uri.toString(),
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            });
        }).toThrow(AssertionError);
    });

    it('should return the node that fills the range completely', async () => {
        const services = createSafeDsServices(EmptyFileSystem).SafeDs;
        const document = await parseHelper(services)(`class C`);

        expect(
            getNodeByLocation(services, {
                uri: document.uri.toString(),
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 7 } },
            }),
        ).to.satisfy(isSdsClass);
    });

    it('should return the node whose name fills the range completely', async () => {
        const services = createSafeDsServices(EmptyFileSystem).SafeDs;
        const document = await parseHelper(services)(`class C`);

        expect(
            getNodeByLocation(services, {
                uri: document.uri.toString(),
                range: { start: { line: 0, character: 6 }, end: { line: 0, character: 7 } },
            }),
        ).to.satisfy(isSdsClass);
    });
});
