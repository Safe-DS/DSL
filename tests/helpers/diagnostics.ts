import { validationHelper } from 'langium/test';
import { LangiumServices } from 'langium';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-types';

/**
 * Get syntax errors from a code snippet.
 *
 * @param services The language services.
 * @param code The code snippet to check.
 * @returns The syntax errors.
 */
export const getSyntaxErrors = async (services: LangiumServices, code: string): Promise<Diagnostic[]> => {
    const validationResult = await validationHelper(services)(code);
    return validationResult.diagnostics.filter(
        (d) =>
            d.severity === DiagnosticSeverity.Error &&
            (d.data?.code === 'lexing-error' || d.data?.code === 'parsing-error'),
    );
};

/**
 * The code contains syntax errors.
 */
export class SyntaxErrorsInCodeError extends Error {
    constructor(readonly syntaxErrors: Diagnostic[]) {
        const syntaxErrorsAsString = syntaxErrors.map((e) => `- ${e.message}`).join(`\n`);

        super(`Code has syntax errors:\n${syntaxErrorsAsString}`);
    }
}
