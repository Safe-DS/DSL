import { Range } from 'vscode-languageserver';
import { findTestComments } from './testComments';
import { findTestRanges, FindTestRangesError } from './testRanges';
import { Result } from 'true-myth';

/**
 * Finds all test checks, i.e. test comments and their corresponding test ranges.
 *
 * @param program The program with test comments and test markers.
 */
export const findTestChecks = (program: string): Result<TestCheck[], FindTestChecksError> => {
    const comments = findTestComments(program);
    const ranges = findTestRanges(program);

    // Must contain at least one comment
    if (comments.length === 0) {
        return Result.err(new NoCommentsError());
    }

    // Opening and closing test markers must match
    if (ranges.isErr) {
        return Result.err(ranges.error);
    }

    // Must not contain more locations markers than severities
    if (ranges.value.length > comments.length) {
        return Result.err(new MoreRangesThanCommentsError(comments, ranges.value));
    }

    return Result.ok(comments.map((comment, index) => ({ comment, range: ranges.value[index] })));
};

/**
 * A test check, i.e. a test comment and its corresponding test range. The range is optional. If it is omitted, the test
 * comment is associated with the whole program.
 */
interface TestCheck {
    comment: string;
    range?: Range;
}

/**
 * Something went wrong while finding test checks.
 */
export type FindTestChecksError = NoCommentsError | MoreRangesThanCommentsError | FindTestRangesError;

/**
 * Did not find any test comments.
 */
export class NoCommentsError extends Error {
    constructor() {
        super('No test comments found.');
    }
}

/**
 * Found more test ranges than test comments.
 */
export class MoreRangesThanCommentsError extends Error {
    constructor(readonly comments: string[], readonly ranges: Range[]) {
        super(`Found more test ranges (${ranges.length}) than test comments (${comments.length}).`);
    }
}
