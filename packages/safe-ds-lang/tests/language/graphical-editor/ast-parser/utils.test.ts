import { describe, expect, it } from 'vitest';
import { filterErrors, zip } from '../../../../src/language/graphical-editor/ast-parser/utils.js';
import { CustomError } from '../../../../src/language/graphical-editor/types.js';

describe('utils', () => {
    describe('zip', () => {
        it('should zip two arrays of equal length', () => {
            const array1 = [1, 2, 3];
            const array2 = ['a', 'b', 'c'];

            const result = zip(array1, array2);

            expect(result).toStrictEqual([
                [1, 'a'],
                [2, 'b'],
                [3, 'c'],
            ]);
        });

        it('should zip arrays to the length of the shorter array', () => {
            const array1 = [1, 2, 3, 4, 5];
            const array2 = ['a', 'b', 'c'];

            const result = zip(array1, array2);

            expect(result).toStrictEqual([
                [1, 'a'],
                [2, 'b'],
                [3, 'c'],
            ]);

            // Test with the first array being shorter
            const array3 = [1, 2];
            const array4 = ['a', 'b', 'c', 'd'];

            const result2 = zip(array3, array4);

            expect(result2).toStrictEqual([
                [1, 'a'],
                [2, 'b'],
            ]);
        });

        it('should return an empty array when either input is empty', () => {
            const array1: number[] = [];
            const array2 = ['a', 'b', 'c'];

            const result = zip(array1, array2);

            expect(result).toStrictEqual([]);

            const array3 = [1, 2, 3];
            const array4: string[] = [];

            const result2 = zip(array3, array4);

            expect(result2).toStrictEqual([]);
        });
    });

    describe('filterErrors', () => {
        it('should filter out CustomError instances from an array', () => {
            const error1 = new CustomError('block', 'Error 1');
            const error2 = new CustomError('notify', 'Error 2');
            const validValue1 = 'valid1';
            const validValue2 = 'valid2';

            const mixedArray = [validValue1, error1, validValue2, error2];

            const result = filterErrors(mixedArray);

            expect(result).toStrictEqual([validValue1, validValue2]);
        });

        it('should return an empty array when all items are errors', () => {
            const error1 = new CustomError('block', 'Error 1');
            const error2 = new CustomError('notify', 'Error 2');

            const errorArray = [error1, error2];

            const result = filterErrors(errorArray);

            expect(result).toStrictEqual([]);
        });

        it('should return the original array when no errors are present', () => {
            const validValues = ['valid1', 'valid2', 'valid3'];

            const result = filterErrors(validValues);

            expect(result).toStrictEqual(validValues);
        });
    });
});
