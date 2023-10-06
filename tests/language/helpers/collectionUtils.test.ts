import { describe, expect, it } from 'vitest';
import { duplicatesBy, uniqueOrUndefined } from '../../../src/language/helpers/collectionUtils.js';

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

describe('uniqueOrUndefined', () => {
    it('should return undefined if the list is empty', () => {
        expect(uniqueOrUndefined([])).toBeUndefined();
    });

    it('should return the singular element of the list', () => {
        expect(uniqueOrUndefined([1])).toBe(1);
    });

    it('should return undefined if the list has multiple elements', () => {
        expect(uniqueOrUndefined([1, 2])).toBeUndefined();
    });
});
