import { Location, Range } from 'vscode-languageserver';
import { findTestComments } from './testComments.js';
import { findTestRanges, FindTestRangesError } from './testRanges.js';
import { Result } from 'true-myth';
import { URI } from 'langium';
import { TestDescriptionError } from './testDescription.js';

/**
 * Finds all test checks, i.e. test comments and their corresponding test ranges.
 *
 * @param program The program with test comments and test markers.
 * @param uri The URI of the program.
 * @param options Options for the function.
 */
export const findTestChecks = (
    program: string,
    uri: URI,
    options: FindTestChecksOptions = {},
): Result<TestCheck[], FindTestChecksError> => {
    const { failIfNoComments = false, failIfFewerRangesThanComments = false } = options;

    const comments = findTestComments(program);
    const rangesResult = findTestRanges(program, uri);

    // Opening and closing test markers must match
    if (rangesResult.isErr) {
        return Result.err(rangesResult.error);
    }
    const ranges = rangesResult.value;

    // Must never contain more ranges than comments
    if (ranges.length > comments.length) {
        return Result.err(new MoreRangesThanCommentsError(comments, ranges, uri));
    }

    // Must contain at least one comment, if corresponding check is enabled
    if (failIfNoComments && comments.length === 0) {
        return Result.err(new NoCommentsError(uri));
    }

    // Must not contain fewer ranges than comments, if corresponding check is enabled
    if (failIfFewerRangesThanComments && ranges.length < comments.length) {
        return Result.err(new FewerRangesThanCommentsError(comments, ranges, uri));
    }

    return Result.ok(
        comments.map((comment, index) => ({
            comment,
            location: { uri: uri.toString(), range: ranges[index] },
        })),
    );
};

/**
 * Options for the `findTestChecks` function.
 */
export interface FindTestChecksOptions {
    /**
     * If this option is set to `true`, an error is returned if there are no comments.
     */
    failIfNoComments?: boolean;

    /**
     * It is never permissible to have *more* ranges than comments. If this option is set to `true`, the number of
     * ranges must be *equal to* the number of comments.
     */
    failIfFewerRangesThanComments?: boolean;
}

/**
 * A test check, i.e. a test comment and its corresponding test range. The range is optional. If it is omitted, the test
 * comment is associated with the whole program.
 */
export interface TestCheck {
    comment: string;
    location?: Location;
}

/**
 * Something went wrong while finding test checks.
 */
export type FindTestChecksError =
    | FindTestRangesError
    | MoreRangesThanCommentsError
    | NoCommentsError
    | FewerRangesThanCommentsError;

/**
 * Found more test ranges than test comments.
 */
export class MoreRangesThanCommentsError extends TestDescriptionError {
    constructor(
        readonly comments: string[],
        readonly ranges: Range[],
        uri: URI,
    ) {
        super(`Found more test ranges (${ranges.length}) than test comments (${comments.length}).`, uri);
    }
}

/**
 * Did not find any test comments.
 */
export class NoCommentsError extends TestDescriptionError {
    constructor(uri: URI) {
        super('No test comments found.', uri);
    }
}

/**
 * Found fewer test ranges than test comments.
 */
export class FewerRangesThanCommentsError extends TestDescriptionError {
    constructor(
        readonly comments: string[],
        readonly ranges: Range[],
        uri: URI,
    ) {
        super(`Found fewer test ranges (${ranges.length}) than test comments (${comments.length}).`, uri);
    }
}
