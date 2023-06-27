import { listTestResources, resolvePathRelativeToResources } from '../helpers/testResources';
import { describe, it } from 'vitest';
import { NoCommentsError } from '../helpers/testChecks';
import fs from 'fs';
import { findTestComments } from '../helpers/testComments';
import path from 'path';
import { createSafeDsServices } from '../../src/language-server/safe-ds-module';
import { NodeFileSystem } from 'langium/node';
import { URI } from 'vscode-uri';
import { AssertionError } from 'assert';

const services = createSafeDsServices(NodeFileSystem).SafeDs;

describe('grammar', () => {
    it.each(createGrammarTests())('$testName', async (test) => {
        if (test.error) {
            throw test.error;
        }

        const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(URI.file(test.absolutePath));
        await services.shared.workspace.DocumentBuilder.build([document], { validationChecks: 'all' });

        const diagnostics = document.diagnostics;
        if (!diagnostics) {
            throw new Error('No diagnostics found');
        }

        const grammarErrors = diagnostics.filter(
            (d) => d.severity === 1 && (d.code === 'lexing-error' || d.code === 'parsing-error'),
        );

        if (test.expectedResults === 'syntax_error') {
            if (grammarErrors.length === 0) {
                throw new AssertionError({
                    message: 'Expected syntax errors but found none.',
                    actual: grammarErrors,
                    expected: [],
                });
            }
        }

        if (test.expectedResults === 'no_syntax_error') {
            if (grammarErrors.length > 0) {
                throw new AssertionError({
                    message: 'Expected no syntax errors but found some.',
                    actual: grammarErrors,
                    expected: [],
                });
            }
        }
    });
});

const createGrammarTests = (): GrammarTest[] => {
    return listTestResources('grammar').map((pathRelativeToResources): GrammarTest => {
        const absolutePath = resolvePathRelativeToResources(path.join('grammar', pathRelativeToResources));
        const program = fs.readFileSync(absolutePath).toString();
        const comments = findTestComments(program);

        // Must contain at least one comment
        if (comments.length === 0) {
            return {
                absolutePath,
                expectedResults: 'invalid',
                testName: `INVALID TEST FILE [${pathRelativeToResources}]`,
                error: new NoCommentsError(),
            };
        }

        // Must contain no more than one comment
        if (comments.length > 1) {
            return {
                absolutePath,
                expectedResults: 'invalid',
                testName: `INVALID TEST FILE [${pathRelativeToResources}]`,
                error: new MultipleCommentsError(comments),
            };
        }

        const comment = comments[0];

        // Must contain a valid comment
        if (comment !== 'syntax_error' && comment !== 'no_syntax_error') {
            return {
                absolutePath,
                expectedResults: 'invalid',
                testName: `INVALID TEST FILE [${pathRelativeToResources}]`,
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
            absolutePath,
            expectedResults: comment,
            testName,
        };
    });
};

interface GrammarTest {
    absolutePath: string;
    expectedResults: 'syntax_error' | 'no_syntax_error' | 'invalid';
    testName: string;
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
