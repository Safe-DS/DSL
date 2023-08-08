import { describe, it } from 'vitest';
import { createSafeDsServices } from '../../src/language-server/safe-ds-module';
import { AssertionError } from 'assert';
import { NodeFileSystem } from 'langium/node';
import { createGrammarTests } from './creator';
import {clearDocuments, validationHelper} from 'langium/test';

const services = createSafeDsServices(NodeFileSystem).SafeDs;

describe('grammar', () => {
    it.each(createGrammarTests())('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Get the actual syntax errors
        const { diagnostics } = await validationHelper(services)(test.program);
        const syntaxErrors = diagnostics.filter(
            (d) => d.severity === 1 && (d.code === 'lexing-error' || d.code === 'parsing-error'),
        );

        // Expected syntax errors
        if (test.expectedResult === 'syntax_error') {
            if (syntaxErrors.length === 0) {
                throw new AssertionError({
                    message: 'Expected syntax errors but found none.',
                    actual: syntaxErrors,
                    expected: [],
                });
            }
        }

        // Expected no syntax errors
        else if (test.expectedResult === 'no_syntax_error') {
            if (syntaxErrors.length > 0) {
                throw new AssertionError({
                    message: 'Expected no syntax errors but found some.',
                    actual: syntaxErrors,
                    expected: [],
                });
            }
        }

        // Clear loaded documents to avoid colliding URIs (https://github.com/langium/langium/issues/1146)
        await clearDocuments(services);
    });
});
