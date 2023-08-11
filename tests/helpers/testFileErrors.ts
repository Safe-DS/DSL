import {Diagnostic} from "vscode-languageserver-types";

/**
 * The code contains syntax errors.
 */
export class SyntaxErrorsInCodeError extends Error {
    constructor(readonly syntaxErrors: Diagnostic[]) {
        const syntaxErrorsAsString = syntaxErrors.map((e) => `- ${e.message}`).join(`\n`);

        super(`Code has syntax errors:\n${syntaxErrorsAsString}`);
    }
}
