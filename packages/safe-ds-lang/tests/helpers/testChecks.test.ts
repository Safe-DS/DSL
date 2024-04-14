import { describe, expect, it } from 'vitest';
import { CloseWithoutOpenError, OpenWithoutCloseError } from './testRanges.js';
import { CLOSE, OPEN } from './testMarker.js';
import {
    FewerRangesThanCommentsError,
    findTestChecks,
    MoreRangesThanCommentsError,
    NoCommentsError,
} from './testChecks.js';
import { Range } from 'vscode-languageserver';
import { URI } from 'langium';

const uri = 'file:///test.sdsdev';

describe('findTestChecks', () => {
    it.each([
        {
            program: '',
            expected: [],
            id: 'no comments, no ranges',
        },
        {
            program: `
// $TEST$ no_syntax_error
`,
            expected: [
                {
                    comment: 'no_syntax_error',
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
                    location: {
                        uri,
                        range: Range.create(2, 1, 2, 1),
                    },
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
                    location: {
                        uri,
                        range: Range.create(2, 1, 2, 1),
                    },
                },
                {
                    comment: 'syntax_error',
                    location: {
                        uri,
                        range: Range.create(4, 1, 4, 1),
                    },
                },
            ],
            id: 'two comments, two ranges',
        },
    ])('should associated comments and ranges ($id)', ({ program, expected }) => {
        const result = findTestChecks(program, URI.parse(uri));
        expect(result.isOk).toBeTruthy();

        if (result.isOk) {
            expect(result.value).toStrictEqual(expected);
        }
    });

    it('should report closing test markers without matching opening test marker', () => {
        const result = findTestChecks(
            `
            // $TEST$ no_syntax_error
            ${OPEN}\n${CLOSE}${CLOSE}
        `,
            URI.parse(uri),
        );
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            expect(result.error).toBeInstanceOf(CloseWithoutOpenError);
        }
    });

    it('should report opening test markers without matching closing test marker', () => {
        const result = findTestChecks(
            `
            // $TEST$ no_syntax_error
            ${OPEN}\n${OPEN}${OPEN}${CLOSE}
        `,
            URI.parse(uri),
        );
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            expect(result.error).toBeInstanceOf(OpenWithoutCloseError);
        }
    });

    it('should report if more ranges than comments are found', () => {
        const result = findTestChecks(
            `
            // $TEST$ no_syntax_error
            ${OPEN}\n${CLOSE}${OPEN}\n${CLOSE}
        `,
            URI.parse(uri),
        );
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            expect(result.error).toBeInstanceOf(MoreRangesThanCommentsError);
        }
    });

    it('should report if no test comments are found if corresponding check is enabled', () => {
        const result = findTestChecks('', URI.parse(uri), { failIfNoComments: true });
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            expect(result.error).toBeInstanceOf(NoCommentsError);
        }
    });

    it('should report if fewer ranges than comments are found if corresponding check is enabled', () => {
        const result = findTestChecks(
            `
            // $TEST$ no_syntax_error
        `,
            URI.parse(uri),
            { failIfFewerRangesThanComments: true },
        );
        expect(result.isErr).toBeTruthy();

        if (result.isErr) {
            expect(result.error).toBeInstanceOf(FewerRangesThanCommentsError);
        }
    });
});
