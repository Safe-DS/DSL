import { describe, expect, it } from 'vitest';
import { normalizeLineBreaks, pluralize } from '../../src/helpers/strings.js';

describe('normalizeLineBreaks', () => {
    it.each([
        {
            text: undefined,
            expected: '',
        },
        {
            text: '',
            expected: '',
        },
        {
            text: 'foo\nbar',
            expected: 'foo\nbar',
        },
        {
            text: 'foo\rbar',
            expected: 'foo\nbar',
        },
        {
            text: 'foo\r\nbar',
            expected: 'foo\nbar',
        },
    ])(`should normalize line breaks (%#)`, ({ text, expected }) => {
        expect(normalizeLineBreaks(text)).toBe(expected);
    });
});

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
