import { parseHelper } from 'langium/test';
import { LangiumServices, URI } from 'langium';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { TestDescriptionError } from './testDescription.js';

let nextId = 0;

/**
 * Get syntax errors from a code snippet.
 *
 * @param services The language services.
 * @param code The code snippet to check.
 * @returns The syntax errors.
 */
export const getSyntaxErrors = async (services: LangiumServices, code: string): Promise<Diagnostic[]> => {
    const diagnostics = await getErrors(services, code);
    return diagnostics.filter((d) => d.data?.code === 'lexing-error' || d.data?.code === 'parsing-error');
};

/**
 * Get linking errors from a code snippet.
 *
 * @param services The language services.
 * @param code The code snippet to check.
 * @returns The errors.
 */
export const getLinkingErrors = async (services: LangiumServices, code: string): Promise<Diagnostic[]> => {
    const diagnostics = await getErrors(services, code);
    return diagnostics.filter((d) => d.data?.code === 'linking-error');
};

/**
 * Get all errors from a code snippet.
 *
 * @param services The language services.
 * @param code The code snippet to check.
 * @returns The errors.
 */
export const getErrors = async (services: LangiumServices, code: string): Promise<Diagnostic[]> => {
    const diagnostics = await getDiagnostics(services, code);
    return diagnostics.filter((d) => d.severity === DiagnosticSeverity.Error);
};

/**
 * Get all errors from a loaded document.
 *
 * @param services The language services.
 * @param uri The URI of the document to check.
 * @returns The errors.
 */
export const getErrorsAtURI = (services: LangiumServices, uri: URI): Diagnostic[] => {
    const diagnostics = getDiagnosticsAtURI(services, uri);
    return diagnostics.filter((d) => d.severity === DiagnosticSeverity.Error);
};

/**
 * Get all diagnostics from a code snippet.
 *
 * @param services The language services.
 * @param code The code snippet to check.
 * @returns The diagnostics.
 */
const getDiagnostics = async (services: LangiumServices, code: string): Promise<Diagnostic[]> => {
    const parse = parseHelper(services);
    const document = await parse(code, {
        documentUri: `file:///$autogen$${nextId++}.sdstest`,
        validation: true,
    });
    return document.diagnostics ?? [];
};

/**
 * Get all diagnostics from a loaded document.
 *
 * @param services The language services.
 * @param uri The URI of the document to check.
 * @returns The diagnostics.
 */
const getDiagnosticsAtURI = (services: LangiumServices, uri: URI): Diagnostic[] => {
    const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(uri);
    return document.diagnostics ?? [];
};

/**
 * The code contains syntax errors.
 */
export class SyntaxErrorsInCodeError extends TestDescriptionError {
    constructor(
        readonly syntaxErrors: Diagnostic[],
        uri: URI,
    ) {
        const syntaxErrorsAsString = syntaxErrors.map((e) => `    - ${e.message}`).join(`\n`);

        super(`Code has syntax errors:\n${syntaxErrorsAsString}`, uri);
    }
}

/**
 * The code contains syntax errors.
 */
export class ErrorsInCodeError extends TestDescriptionError {
    constructor(
        readonly errors: Diagnostic[],
        uri: URI,
    ) {
        const syntaxErrorsAsString = errors.map((e) => `    - ${e.message}`).join(`\n`);

        super(`Code has errors:\n${syntaxErrorsAsString}`, uri);
    }
}
