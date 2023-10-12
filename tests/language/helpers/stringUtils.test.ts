import { describe, expect, it } from 'vitest';
import { pluralize } from '../../../src/language/helpers/stringUtils.js';

describe('pluralize', () => {
    it.each([
        {
            count: 0,
            singular: 'apple',
            plural: 'apples',
            expected: 'apples',
        },
        {
            count: 1,
            singular: 'apple',
            plural: 'apple',
            expected: 'apple',
        },
        {
            count: 2,
            singular: 'apple',
            plural: 'apples',
            expected: 'apples',
        },
        {
            count: 0,
            singular: 'apple',
            expected: 'apples',
        },
        {
            count: 1,
            singular: 'apple',
            expected: 'apple',
        },
        {
            count: 2,
            singular: 'apple',
            expected: 'apples',
        },
    ])('should return the singular or plural form based on the count (%#)', ({ count, singular, plural, expected }) => {
        expect(pluralize(count, singular, plural)).toBe(expected);
    });
});
