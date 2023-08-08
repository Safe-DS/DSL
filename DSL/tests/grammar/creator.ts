import {listTestResources, resolvePathRelativeToResources} from "../helpers/testResources";
import path from "path";
import fs from "fs";
import {findTestComments} from "../helpers/testComments";
import {NoCommentsError} from "../helpers/testChecks";

export const createGrammarTests = (): GrammarTest[] => {
    return listTestResources('grammar').map((pathRelativeToResources): GrammarTest => {
        const absolutePath = resolvePathRelativeToResources(path.join('grammar', pathRelativeToResources));
        const program = fs.readFileSync(absolutePath).toString();
        const comments = findTestComments(program);

        // Must contain at least one comment
        if (comments.length === 0) {
            return {
                testName: `INVALID TEST FILE [${pathRelativeToResources}]`,
                absolutePath,
                expectedResult: 'invalid',
                error: new NoCommentsError(),
            };
        }

        // Must contain no more than one comment
        if (comments.length > 1) {
            return {
                testName: `INVALID TEST FILE [${pathRelativeToResources}]`,
                absolutePath,
                expectedResult: 'invalid',
                error: new MultipleCommentsError(comments),
            };
        }

        const comment = comments[0];

        // Must contain a valid comment
        if (comment !== 'syntax_error' && comment !== 'no_syntax_error') {
            return {
                testName: `INVALID TEST FILE [${pathRelativeToResources}]`,
                absolutePath,
                expectedResult: 'invalid',
                error: new InvalidCommentError(comment),
            };
        }

        let testName: string;
        if (comment === 'syntax_error') {
            testName = `[${pathRelativeToResources}] should have syntax errors`;
        } else {
            testName = `[${pathRelativeToResources}] should not have syntax errors`;
        }

        return {
            testName,
            absolutePath,
            expectedResult: comment,
        };
    });
};

interface GrammarTest {
    testName: string;
    absolutePath: string;
    expectedResult: 'syntax_error' | 'no_syntax_error' | 'invalid';
    error?: Error;
}

class MultipleCommentsError extends Error {
    constructor(readonly comments: string[]) {
        super(`Found multiple test comments (grammar tests expect only one): ${comments}`);
    }
}

class InvalidCommentError extends Error {
    constructor(readonly comment: string) {
        super(`Invalid test comment (valid values are 'syntax_error' and 'no_syntax_error'): ${comment}`);
    }
}
