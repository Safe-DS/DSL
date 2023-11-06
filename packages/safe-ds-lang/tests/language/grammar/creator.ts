import { listTestSafeDsFiles, uriToShortenedTestResourceName } from '../../helpers/testResources.js';
import fs from 'fs';
import { findTestComments } from '../../helpers/testComments.js';
import { NoCommentsError } from '../../helpers/testChecks.js';
import { TestDescription, TestDescriptionError } from '../../helpers/testDescription.js';
import { URI } from 'langium';

const rootResourceName = 'grammar';

export const createGrammarTests = (): GrammarTest[] => {
    return listTestSafeDsFiles(rootResourceName).map(createGrammarTest);
};

const createGrammarTest = (uri: URI): GrammarTest => {
    const code = fs.readFileSync(uri.fsPath).toString();
    const comments = findTestComments(code);

    // Must contain at least one comment
    if (comments.length === 0) {
        return invalidTest(new NoCommentsError(uri));
    }

    // Must contain no more than one comment
    if (comments.length > 1) {
        return invalidTest(new MultipleCommentsError(comments, uri));
    }

    const comment = comments[0]!;

    // Must contain a valid comment
    if (comment !== 'syntax_error' && comment !== 'no_syntax_error') {
        return invalidTest(new InvalidCommentError(comment, uri));
    }

    const shortenedResourceName = uriToShortenedTestResourceName(uri, rootResourceName);
    let testName: string;
    if (comment === 'syntax_error') {
        testName = `[${shortenedResourceName}] should have syntax errors`;
    } else {
        testName = `[${shortenedResourceName}] should not have syntax errors`;
    }

    return {
        testName,
        code,
        expectedResult: comment,
        uri,
    };
};

/**
 * Report a test that has errors.
 *
 * @param error The error that occurred.
 */
const invalidTest = (error: TestDescriptionError): GrammarTest => {
    const shortenedResourceName = uriToShortenedTestResourceName(error.uri, rootResourceName);
    return {
        testName: `INVALID TEST FILE [${shortenedResourceName}]`,
        code: '',
        expectedResult: 'invalid',
        uri: URI.file(''),
        error,
    };
};

/**
 * A description of a grammar test.
 */
interface GrammarTest extends TestDescription {
    /**
     * The code to parse.
     */
    code: string;

    /**
     * The expected result after parsing the program.
     */
    expectedResult: 'syntax_error' | 'no_syntax_error' | 'invalid';

    /**
     * The URI of the corresponding file.
     */
    uri: URI;
}

/**
 * Found multiple test comments.
 */
class MultipleCommentsError extends TestDescriptionError {
    constructor(
        readonly comments: string[],
        uri: URI,
    ) {
        super(`Found multiple test comments (grammar tests expect only one): ${comments}`, uri);
    }
}

/**
 * Found one test comment but it was invalid.
 */
class InvalidCommentError extends TestDescriptionError {
    constructor(
        readonly comment: string,
        uri: URI,
    ) {
        super(`Invalid test comment (valid values are 'syntax_error' and 'no_syntax_error'): ${comment}`, uri);
    }
}
