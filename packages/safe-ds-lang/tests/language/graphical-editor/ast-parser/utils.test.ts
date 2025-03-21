import { describe, expect, it } from 'vitest';
import { zip, filterErrors } from '../../../../src/language/graphical-editor/ast-parser/utils.js';
import { CustomError } from '../../../../src/language/graphical-editor/types.js';

describe('Utils', () => {
    it('should zip arrays correctly', () => {
        const arr1 = [1, 2, 3];
        const arr2 = ['a', 'b', 'c'];

        const zipped = zip(arr1, arr2);

        expect(zipped).toHaveLength(3);
        expect(zipped[0]).toStrictEqual([1, 'a']);
        expect(zipped[1]).toStrictEqual([2, 'b']);
        expect(zipped[2]).toStrictEqual([3, 'c']);
    });

    it('should handle arrays of different lengths', () => {
        const arr1 = [1, 2, 3, 4];
        const arr2 = ['a', 'b', 'c'];

        const zipped = zip(arr1, arr2);

        expect(zipped).toHaveLength(3); // Zip only creates pairs for the shorter array's length
        expect(zipped[0]).toStrictEqual([1, 'a']);
        expect(zipped[1]).toStrictEqual([2, 'b']);
        expect(zipped[2]).toStrictEqual([3, 'c']);
    });

    it('should filter errors from arrays', () => {
        const array = [1, new CustomError('block', 'Test error'), 3, new CustomError('block', 'Another error')];

        const filtered = filterErrors(array);

        expect(filtered).toHaveLength(2);
        expect(filtered).toContain(1);
        expect(filtered).toContain(3);
    });

    it('should handle empty arrays', () => {
        const emptyArray: any[] = [];

        const zippedEmpty = zip(emptyArray, emptyArray);
        expect(zippedEmpty).toHaveLength(0);

        const filteredEmpty = filterErrors(emptyArray);
        expect(filteredEmpty).toHaveLength(0);
    });

    it('should correctly identify error instances', () => {
        const arrayWithError = [1, new CustomError('block', 'Test error'), 3];
        const arrayWithoutError = [1, 2, 3];

        // Test filterErrors behavior with and without errors
        expect(filterErrors(arrayWithError).length).toBeLessThan(arrayWithError.length);
        expect(filterErrors(arrayWithoutError)).toHaveLength(arrayWithoutError.length);

        // Manual check for presence of CustomError
        const hasError = arrayWithError.some((item) => item instanceof CustomError);
        const noError = arrayWithoutError.every((item) => !((item as any) instanceof CustomError));

        expect(hasError).toBeTruthy();
        expect(noError).toBeTruthy();
    });
});
