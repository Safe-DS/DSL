import { describe, expect, it } from 'vitest';
import { duplicatesBy, isEmpty, uniqueOrUndefined } from '../../src/helpers/collectionUtils.js';

describe('duplicatesBy', () => {
    const id = (element: any) => element;

    it('should return an empty list given an empty list', () => {
        expect([...duplicatesBy([], id)]).toStrictEqual([]);
    });

    it('should keep elements with the same label as a previous one', () => {
        expect([...duplicatesBy([1, 2, 1, 3], id)]).toStrictEqual([1]);
    });

    it('should remove elements with an undefined label', () => {
        const zeroToUndefined = (element: number) => (element === 0 ? undefined : element);
        expect([...duplicatesBy([0, 1, 0], zeroToUndefined)]).toStrictEqual([]);
    });

    it('should remove elements with a unique label', () => {
        expect([...duplicatesBy([1, 2, 3], id)]).toStrictEqual([]);
    });
});

describe('isEmpty', () => {
    it('should return true if the iterable has no elements', () => {
        expect(isEmpty([])).toBeTruthy();
    });

    it('should keep false if the iterable has elements', () => {
        expect(isEmpty([1])).toBeFalsy();
    });
});

describe('uniqueOrUndefined', () => {
    it('should return undefined if the iterable is empty', () => {
        expect(uniqueOrUndefined([])).toBeUndefined();
    });

    it('should return the singular element of the iterable', () => {
        expect(uniqueOrUndefined([1])).toBe(1);
    });

    it('should return undefined if the iterable has multiple elements', () => {
        expect(uniqueOrUndefined([1, undefined])).toBeUndefined();
    });
});
