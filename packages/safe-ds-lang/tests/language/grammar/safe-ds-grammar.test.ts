import { describe, it } from 'vitest';
import { createSafeDsServices } from '../../../src/language/index.js';
import { AssertionError } from 'assert';
import { NodeFileSystem } from 'langium/node';
import { createGrammarTests } from './creator.js';
import { getSyntaxErrors } from '../../helpers/diagnostics.js';

const services = createSafeDsServices(NodeFileSystem).SafeDs;

describe('grammar', () => {
    it.each(createGrammarTests())('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Get the actual syntax errors
        const actualSyntaxErrors = await getSyntaxErrors(services, test.code);

        // Expected syntax errors
        if (test.expectedResult === 'syntax_error') {
            if (actualSyntaxErrors.length === 0) {
                throw new AssertionError({
                    message: `Expected syntax errors in ${test.uri} but found none.`,
                    actual: actualSyntaxErrors,
                    expected: [],
                });
            }
        }

        // Expected no syntax errors
        else if (test.expectedResult === 'no_syntax_error') {
            if (actualSyntaxErrors.length > 0) {
                throw new AssertionError({
                    message: `Expected no syntax errors in ${test.uri} but found some.`,
                    actual: actualSyntaxErrors,
                    expected: [],
                });
            }
        }
    });
});
