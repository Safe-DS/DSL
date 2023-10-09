import { describe, expect, it } from 'vitest';
import { CloseWithoutOpenError, findTestRanges, OpenWithoutCloseError } from './testRanges.js';
import { Position, Range } from 'vscode-languageserver';
import { CLOSE, OPEN } from './testMarker.js';
import { URI } from 'langium';

const uri = URI.file('');

describe('findTestRanges', () => {
    it('should find all ranges enclosed by test markers in order of opening markers', () => {
        const result = findTestRanges(`text${OPEN}text${CLOSE}\n${OPEN}text${CLOSE}`, uri);
        expect(result.isOk).toBeTruthy();

        if (result.isOk) {
            const ranges = result.value;
            expect(ranges).toStrictEqual([Range.create(0, 5, 0, 9), Range.create(1, 1, 1, 5)]);
        }
    });

    it('should handle nested test markers', () => {
        const result = findTestRanges(`${OPEN}\n    ${OPEN}${CLOSE}\n${CLOSE}`, uri);
        expect(result.isOk).toBeTruthy();

        if (result.isOk) {
            const ranges = result.value;
            expect(ranges).toStrictEqual([Range.create(0, 1, 2, 0), Range.create(1, 5, 1, 5)]);
        }
    });

    it('should handle line feed (Unix)', () => {
        const result = findTestRanges(`\n${OPEN}\n${CLOSE}`, uri);
        expect(result.isOk).toBeTruthy();

        if (result.isOk) {
            const ranges = result.value;
            expect(ranges).toStrictEqual([Range.create(1, 1, 2, 0)]);
        }
    });

    it('should handle carriage return (MacOS)', () => {
        const result = findTestRanges(`\r${OPEN}\r${CLOSE}`, uri);
        expect(result.isOk).toBeTruthy();

        if (result.isOk) {
            const ranges = result.value;
            expect(ranges).toStrictEqual([Range.create(1, 1, 2, 0)]);
        }
    });

    it('should handle carriage return + line feed (Windows)', () => {
        const result = findTestRanges(`\r\n${OPEN}\r\n${CLOSE}`, uri);
        expect(result.isOk).toBeTruthy();

        if (result.isOk) {
            const ranges = result.value;
            expect(ranges).toStrictEqual([Range.create(1, 1, 2, 0)]);
        }
    });

    it('should report closing test markers without matching opening test marker', () => {
        const result = findTestRanges(`${OPEN}\n${CLOSE}${CLOSE}`, uri);
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            const error = result.error;
            expect(error).toBeInstanceOf(CloseWithoutOpenError);
            expect((error as CloseWithoutOpenError).position).toStrictEqual(Position.create(1, 1));
            expect(error.message).toBe(`Found '${CLOSE}' without previous '${OPEN}' at 2:2.`);
        }
    });

    it('should report opening test markers without matching closing test marker', () => {
        const result = findTestRanges(`${OPEN}\n${OPEN}${OPEN}${CLOSE}`, uri);
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            const error = result.error;
            expect(error).toBeInstanceOf(OpenWithoutCloseError);
            expect((error as OpenWithoutCloseError).positions).toStrictEqual([
                Position.create(0, 0),
                Position.create(1, 0),
            ]);
            expect(error.message).toBe(`Found '${OPEN}' without following '${CLOSE}' at 1:1, 2:1.`);
        }
    });
});
