import { describe, expect, test } from 'vitest';
import { CloseWithoutOpenError, findTestRanges, OpenWithoutCloseError } from './testRanges';
import { Position, Range } from 'vscode-languageserver';
import { CLOSE, OPEN } from './testMarker';

describe('findTestRanges', () => {
    test('should find all ranges enclosed by test markers in order of opening markers', () => {
        const result = findTestRanges(`text${OPEN}text${CLOSE}\n${OPEN}text${CLOSE}`);
        expect(result.isOk).toEqual(true);

        if (result.isOk) {
            const ranges = result.value;
            expect(ranges).toStrictEqual([Range.create(1, 6, 1, 10), Range.create(2, 2, 2, 6)]);
        }
    });

    test('should handle nested test markers', () => {
        const result = findTestRanges(`${OPEN}\n    ${OPEN}${CLOSE}\n${CLOSE}`);
        expect(result.isOk).toBeTruthy();

        if (result.isOk) {
            const ranges = result.value;
            expect(ranges).toStrictEqual([Range.create(1, 2, 3, 1), Range.create(2, 6, 2, 6)]);
        }
    });

    test('should handle line feed (Unix)', () => {
        const result = findTestRanges(`\n${OPEN}\n${CLOSE}`);
        expect(result.isOk).toBeTruthy();

        if (result.isOk) {
            const ranges = result.value;
            expect(ranges).toStrictEqual([Range.create(2, 2, 3, 1)]);
        }
    });

    test('should handle carriage return (MacOS)', () => {
        const result = findTestRanges(`\r${OPEN}\r${CLOSE}`);
        expect(result.isOk).toBeTruthy();

        if (result.isOk) {
            const ranges = result.value;
            expect(ranges).toStrictEqual([Range.create(2, 2, 3, 1)]);
        }
    });

    test('should handle carriage return + line feed (Windows)', () => {
        const result = findTestRanges(`\r\n${OPEN}\r\n${CLOSE}`);
        expect(result.isOk).toBeTruthy();

        if (result.isOk) {
            const ranges = result.value;
            expect(ranges).toStrictEqual([Range.create(2, 2, 3, 1)]);
        }
    });

    test('should report closing test markers without matching opening test marker', () => {
        const result = findTestRanges(`${OPEN}\n${CLOSE}${CLOSE}`);
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            const error = result.error;
            expect(error).toBeInstanceOf(CloseWithoutOpenError);
            expect((error as CloseWithoutOpenError).position).toEqual(Position.create(2, 2));
            expect(error.message).toBe(`Found '${CLOSE}' without previous '${OPEN}' at 2:2.`);
        }
    });

    test('should report opening test markers without matching closing test marker', () => {
        const result = findTestRanges(`${OPEN}\n${OPEN}${OPEN}${CLOSE}`);
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            const error = result.error;
            expect(error).toBeInstanceOf(OpenWithoutCloseError);
            expect((error as OpenWithoutCloseError).positions).toEqual([Position.create(1, 1), Position.create(2, 1)]);
            expect(error.message).toBe(`Found '${OPEN}' without following '${CLOSE}' at 1:1, 2:1.`);
        }
    });
});
