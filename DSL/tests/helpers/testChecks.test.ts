import { describe, expect, it } from 'vitest';
import { CloseWithoutOpenError, OpenWithoutCloseError } from './testRanges';
import { CLOSE, OPEN } from './testMarker';
import {FewerRangesThanCommentsError, findTestChecks, MoreRangesThanCommentsError, NoCommentsError} from './testChecks';
import { Range } from 'vscode-languageserver';

describe('findTestChecks', () => {
    it.each([
        {
            program: `
// $TEST$ no_syntax_error
`,
            expected: [
                {
                    comment: 'no_syntax_error',
                    range: undefined,
                },
            ],
            id: 'one comment, no range',
        },
        {
            program: `
// $TEST$ no_syntax_error
${OPEN}${CLOSE}
`,
            expected: [
                {
                    comment: 'no_syntax_error',
                    range: Range.create(3, 2, 3, 2),
                },
            ],
            id: 'one comment, one range',
        },
        {
            program: `
// $TEST$ no_syntax_error
${OPEN}${CLOSE}
// $TEST$ syntax_error
${OPEN}${CLOSE}
`,
            expected: [
                {
                    comment: 'no_syntax_error',
                    range: Range.create(3, 2, 3, 2),
                },
                {
                    comment: 'syntax_error',
                    range: Range.create(5, 2, 5, 2),
                },
            ],
            id: 'two comments, two ranges',
        },
    ])('should associated comments and ranges ($id)', ({ program, expected }) => {
        const result = findTestChecks(program);
        expect(result.isOk).toBeTruthy();

        if (result.isOk) {
            expect(result.value).toStrictEqual(expected);
        }
    });

    it('should report if no test comments are found', () => {
        const result = findTestChecks('');
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            expect(result.error).toBeInstanceOf(NoCommentsError);
        }
    });

    it('should report if more ranges than comments are found', () => {
        const result = findTestChecks(`
            // $TEST$ no_syntax_error
            ${OPEN}\n${CLOSE}${OPEN}\n${CLOSE}
        `);
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            expect(result.error).toBeInstanceOf(MoreRangesThanCommentsError);
        }
    });

    it('should report if fewer ranges than comments are found if strictLengthCheck is enabled', () => {
        const result = findTestChecks(`
            // $TEST$ no_syntax_error
        `, { strictLengthCheck: true });
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            expect(result.error).toBeInstanceOf(FewerRangesThanCommentsError);
        }
    });

    it('should report closing test markers without matching opening test marker', () => {
        const result = findTestChecks(`
            // $TEST$ no_syntax_error
            ${OPEN}\n${CLOSE}${CLOSE}
        `);
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            expect(result.error).toBeInstanceOf(CloseWithoutOpenError);
        }
    });

    it('should report opening test markers without matching closing test marker', () => {
        const result = findTestChecks(`
            // $TEST$ no_syntax_error
            ${OPEN}\n${OPEN}${OPEN}${CLOSE}
        `);
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            expect(result.error).toBeInstanceOf(OpenWithoutCloseError);
        }
    });
});
