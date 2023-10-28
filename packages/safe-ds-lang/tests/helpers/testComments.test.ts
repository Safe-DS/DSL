import { describe, it, expect } from 'vitest';
import { findTestComments } from './testComments.js';

describe('findTestComments', () => {
    it.each([
        {
            program: '',
            expected: [],
            id: 'empty program',
        },
        {
            program: `// $TEST$ no_syntax_error`,
            expected: ['no_syntax_error'],
            id: 'single comment',
        },
        {
            program: `// $TEST$ no_syntax_error
                      // $TEST$ syntax_error
                      // another comment`,
            expected: ['no_syntax_error', 'syntax_error'],
            id: 'multiple comments',
        },
    ])('should find all test comments ($id)', ({ program, expected }) => {
        const result = findTestComments(program);
        expect(result).toStrictEqual(expected);
    });
});
