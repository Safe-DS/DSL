import {validationHelper} from "langium/test";
import {LangiumServices} from "langium";
import {Diagnostic} from "vscode-languageserver-types";

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
        (d) => d.severity === 1 && (d.code === 'lexing-error' || d.code === 'parsing-error'),
    );
}
