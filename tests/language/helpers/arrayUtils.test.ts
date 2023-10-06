import { describe, expect, it } from 'vitest';
import { uniqueOrUndefined } from '../../../src/language/helpers/arrayUtils.js';

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
