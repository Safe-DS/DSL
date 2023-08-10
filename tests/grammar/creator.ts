import { listTestResources, resolvePathRelativeToResources } from '../helpers/testResources';
import path from 'path';
import fs from 'fs';
import { findTestComments } from '../helpers/testComments';
import { NoCommentsError } from '../helpers/testChecks';

export const createGrammarTests = (): GrammarTest[] => {
    return listTestResources('grammar').map((pathRelativeToResources): GrammarTest => {
        const absolutePath = resolvePathRelativeToResources(path.join('grammar', pathRelativeToResources));
        const code = fs.readFileSync(absolutePath).toString();
        const comments = findTestComments(code);

        // Must contain at least one comment
        if (comments.length === 0) {
            return invalidTest(pathRelativeToResources, new NoCommentsError());
        }

        // Must contain no more than one comment
        if (comments.length > 1) {
            return invalidTest(pathRelativeToResources, new MultipleCommentsError(comments));
        }

        const comment = comments[0];

        // Must contain a valid comment
        if (comment !== 'syntax_error' && comment !== 'no_syntax_error') {
            return invalidTest(pathRelativeToResources, new InvalidCommentError(comment));
        }

        let testName: string;
        if (comment === 'syntax_error') {
            testName = `[${pathRelativeToResources}] should have syntax errors`;
        } else {
            testName = `[${pathRelativeToResources}] should not have syntax errors`;
        }

        return {
            testName,
            code,
            expectedResult: comment,
        };
    });
};

/**
 * Report a test that has errors.
 *
 * @param pathRelativeToResources The path to the test file relative to the resources directory.
 * @param error The error that occurred.
 */
const invalidTest = (pathRelativeToResources: string, error: Error): GrammarTest => {
    return {
        testName: `INVALID TEST FILE [${pathRelativeToResources}]`,
        code: '',
        expectedResult: 'invalid',
        error,
    };
};

/**
 * A description of a grammar test.
 */
interface GrammarTest {
    /**
     * The name of the test.
     */
    testName: string;

    /**
     * The code to parse.
     */
    code: string;

    /**
     * The expected result after parsing the program.
     */
    expectedResult: 'syntax_error' | 'no_syntax_error' | 'invalid';

    /**
     * An error that occurred while creating the test. If this is undefined, the test is valid.
     */
    error?: Error;
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
