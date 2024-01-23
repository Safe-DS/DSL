import { describe, expect, it } from 'vitest';
import {
    duplicatesBy,
    groupBy,
    isEmpty,
    isEqualSet,
    isSubset,
    last,
    uniqueOrUndefined,
} from '../../src/helpers/collections.js';

describe('duplicatesBy', () => {
    const id = (element: any) => element;

    it('should return an empty stream given an empty iterable', () => {
        expect(duplicatesBy([], id).toArray()).toStrictEqual([]);
    });

    it('should keep values with the same label as a previous one', () => {
        expect(duplicatesBy([1, 2, 1, 3], id).toArray()).toStrictEqual([1]);
    });

    it('should remove values with an undefined label', () => {
        const zeroToUndefined = (element: number) => (element === 0 ? undefined : element);
        expect(duplicatesBy([0, 1, 0], zeroToUndefined).toArray()).toStrictEqual([]);
    });

    it('should remove values with a unique label', () => {
        expect(duplicatesBy([1, 2, 3], id).toArray()).toStrictEqual([]);
    });
});

describe('isEmpty', () => {
    it('should return true if the iterable has no values', () => {
        expect(isEmpty([])).toBeTruthy();
    });

    it('should return false if the iterable has values', () => {
        expect(isEmpty([1])).toBeFalsy();
    });
});

describe('isEqualTest', () => {
    it('should return true if the sets are equal', () => {
        expect(isEqualSet(new Set([1, 2]), new Set([1, 2]))).toBeTruthy();
    });

    it('should return false if the sets are not equal', () => {
        expect(isEqualSet(new Set([1]), new Set([1, 2]))).toBeFalsy();
    });
});

describe('isSubset', () => {
    it('should return true if the first set is a subset of the second', () => {
        expect(isSubset(new Set([1]), new Set([1, 2]))).toBeTruthy();
    });

    it('should return false if the first set is not a subset of the second', () => {
        expect(isSubset(new Set([3]), new Set([1, 2]))).toBeFalsy();
    });
});

describe('groupBy', () => {
    it('should return an empty list given an empty iterable', () => {
        const id = (element: any) => element;
        expect(groupBy([], id).toArray()).toStrictEqual([]);
    });

    it('should remove values with an undefined label', () => {
        const zeroToUndefined = (element: number) => (element === 0 ? undefined : element);
        expect(groupBy([0, 1, 0], zeroToUndefined).toArray()).toStrictEqual([[1, [1]]]);
    });

    it('should group values together that get the same label', () => {
        const isEven = (element: number) => element % 2 === 0;
        expect(groupBy([1, 2, 3, 4, 2], isEven).toArray()).toStrictEqual([
            [false, [1, 3]],
            [true, [2, 4, 2]],
        ]);
    });
});

describe('last', () => {
    it('should return undefined if the array is empty', () => {
        expect(last([])).toBeUndefined();
    });

    it('should return the last element of the array', () => {
        expect(last([1, 2])).toBe(2);
    });
});

describe('uniqueOrUndefined', () => {
    it('should return undefined if the iterable is empty', () => {
        expect(uniqueOrUndefined([])).toBeUndefined();
    });

    it('should return the singular value of the iterable', () => {
        expect(uniqueOrUndefined([1])).toBe(1);
    });

    it('should return undefined if the iterable has multiple values', () => {
        expect(uniqueOrUndefined([1, undefined])).toBeUndefined();
    });
});
