import { listSafeDsFiles, uriToShortenedResourceName } from '../../helpers/testResources.js';
import fs from 'fs';
import { findTestComments } from '../../helpers/testComments.js';
import { NoCommentsError } from '../../helpers/testChecks.js';
import { TestDescription } from '../../helpers/testDescription.js';
import { URI } from 'langium';

const rootResourceName = 'grammar';

export const createGrammarTests = (): GrammarTest[] => {
    return listSafeDsFiles(rootResourceName).map(createGrammarTest);
};

const createGrammarTest = (uri: URI): GrammarTest => {
    const code = fs.readFileSync(uri.fsPath).toString();
    const comments = findTestComments(code);

    // Must contain at least one comment
    if (comments.length === 0) {
        return invalidTest(uri, new NoCommentsError());
    }

    // Must contain no more than one comment
    if (comments.length > 1) {
        return invalidTest(uri, new MultipleCommentsError(comments));
    }

    const comment = comments[0];

    // Must contain a valid comment
    if (comment !== 'syntax_error' && comment !== 'no_syntax_error') {
        return invalidTest(uri, new InvalidCommentError(comment));
    }

    const shortenedResourceName = uriToShortenedResourceName(uri, rootResourceName);
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
    };
};

/**
 * Report a test that has errors.
 *
 * @param uri The URI of the test file.
 * @param error The error that occurred.
 */
const invalidTest = (uri: URI, error: Error): GrammarTest => {
    const shortenedResourceName = uriToShortenedResourceName(uri, rootResourceName);
    return {
        testName: `INVALID TEST FILE [${shortenedResourceName}]`,
        code: '',
        expectedResult: 'invalid',
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
}

/**
 * Found multiple test comments.
 */
class MultipleCommentsError extends Error {
    constructor(readonly comments: string[]) {
        super(`Found multiple test comments (grammar tests expect only one): ${comments}`);
    }
}

/**
 * Found one test comment but it was invalid.
 */
class InvalidCommentError extends Error {
    constructor(readonly comment: string) {
        super(`Invalid test comment (valid values are 'syntax_error' and 'no_syntax_error'): ${comment}`);
    }
}
