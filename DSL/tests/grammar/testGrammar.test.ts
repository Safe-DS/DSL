import { describe, it } from 'vitest';
import { createSafeDsServices } from '../../src/language-server/safe-ds-module';
import { URI } from 'vscode-uri';
import { AssertionError } from 'assert';
import { NodeFileSystem } from 'langium/node';
import { createGrammarTests } from './creator';

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

        const syntaxErrors = diagnostics.filter(
            (d) => d.severity === 1 && (d.code === 'lexing-error' || d.code === 'parsing-error'),
        );

        if (test.expectedResult === 'syntax_error') {
            if (syntaxErrors.length === 0) {
                throw new AssertionError({
                    message: 'Expected syntax errors but found none.',
                    actual: syntaxErrors,
                    expected: [],
                });
            }
        }

        if (test.expectedResult === 'no_syntax_error') {
            if (syntaxErrors.length > 0) {
                throw new AssertionError({
                    message: 'Expected no syntax errors but found some.',
                    actual: syntaxErrors,
                    expected: [],
                });
            }
        }
    });
});
