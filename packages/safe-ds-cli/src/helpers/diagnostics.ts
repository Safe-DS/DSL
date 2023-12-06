import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { LangiumDocument, URI } from 'langium';
import chalk from 'chalk';
import { ExitCodes } from '../cli/exitCodes.js';
import { positionToString } from '@safe-ds/lang';
import { uriToRelativePath } from './files.js';

/**
 * Converts the given diagnostic to a string.
 */
export const diagnosticToString = (
    uri: URI,
    diagnostic: Diagnostic,
    options: DiagnosticToStringOptions = {},
): string => {
    const message = `${locationToString(uri, diagnostic)}: [${severityToString(diagnostic)}] ${
        diagnostic.message
    } (${codeToString(diagnostic)})`;
    return colorizeBySeverity(diagnostic, message, options);
};

interface DiagnosticToStringOptions {
    strict?: boolean;
}

const locationToString = (uri: URI, diagnostic: Diagnostic): string => {
    const relativePath = uriToRelativePath(uri);
    const position = positionToString(diagnostic.range.start);
    return `${relativePath}:${position}`;
};

const severityToString = (diagnostic: Diagnostic): string => {
    switch (diagnostic.severity) {
        case DiagnosticSeverity.Error:
            return 'error';
        case DiagnosticSeverity.Warning:
            return 'warning';
        case DiagnosticSeverity.Information:
            return 'info';
        case DiagnosticSeverity.Hint:
            return 'hint';
        default:
            return '';
    }
};

const codeToString = (diagnostic: Diagnostic): string => {
    return String(diagnostic.code ?? diagnostic.data?.code ?? '');
};

const colorizeBySeverity = (diagnostic: Diagnostic, message: string, options: DiagnosticToStringOptions): string => {
    switch (diagnostic.severity) {
        case DiagnosticSeverity.Error:
            return chalk.red(message);
        case DiagnosticSeverity.Warning:
            if (options.strict) {
                return chalk.red(message);
            } else {
                return chalk.yellow(message);
            }
        case DiagnosticSeverity.Information:
            return chalk.blue(message);
        case DiagnosticSeverity.Hint:
            return chalk.gray(message);
        default:
            return message;
    }
};

/**
 * Exits the process if the given document has errors.
 */
export const exitIfDocumentHasErrors = function (document: LangiumDocument): void {
    const errors = getErrors(document);
    if (errors.length > 0) {
        console.error(chalk.red(`The file '${uriToRelativePath(document.uri)}' has errors:`));
        for (const error of errors) {
            console.error(diagnosticToString(document.uri, error));
        }
        process.exit(ExitCodes.FileHasErrors);
    }
};

const getErrors = (document: LangiumDocument): Diagnostic[] => {
    return getDiagnostics(document).filter((it) => it.severity === DiagnosticSeverity.Error);
};

export const getDiagnostics = (document: LangiumDocument): Diagnostic[] => {
    return document.diagnostics ?? [];
};
