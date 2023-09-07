import { describe, it } from 'vitest';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { AssertionError } from 'assert';
import { NodeFileSystem } from 'langium/node';
import { createGrammarTests } from './creator.js';
import { clearDocuments } from 'langium/test';
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
                    message: 'Expected syntax errors but found none.',
                    actual: actualSyntaxErrors,
                    expected: [],
                });
            }
        }

        // Expected no syntax errors
        else if (test.expectedResult === 'no_syntax_error') {
            if (actualSyntaxErrors.length > 0) {
                throw new AssertionError({
                    message: 'Expected no syntax errors but found some.',
                    actual: actualSyntaxErrors,
                    expected: [],
                });
            }
        }

        // Clear loaded documents to avoid colliding URIs (https://github.com/langium/langium/issues/1146)
        await clearDocuments(services);
    });
});
