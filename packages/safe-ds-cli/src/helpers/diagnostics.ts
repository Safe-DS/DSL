import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { LangiumDocument } from 'langium';
import chalk from 'chalk';
import { ExitCodes } from '../cli/exitCodes.js';
import path from 'node:path';
import { positionToString } from '@safe-ds/lang';

export const diagnosticToString = (document: LangiumDocument, diagnostic: Diagnostic): string => {
    const message = `${locationToString(document, diagnostic)}: ${diagnostic.message} (${codeToString(diagnostic)})`;

    switch (diagnostic.severity) {
        case DiagnosticSeverity.Error:
            return chalk.red(message);
        case DiagnosticSeverity.Warning:
            return chalk.yellow(message);
        case DiagnosticSeverity.Information:
            return chalk.blue(message);
        case DiagnosticSeverity.Hint:
            return chalk.gray(message);
        default:
            return message;
    }
};

const locationToString = (document: LangiumDocument, diagnostic: Diagnostic): string => {
    const relativePath = path.relative(process.cwd(), document.uri.fsPath);
    const position = positionToString(diagnostic.range.start);
    return `${relativePath}:${position})`;
};

const codeToString = (diagnostic: Diagnostic): string => {
    return String(diagnostic.code ?? diagnostic.data?.code ?? '');
};

export const exitOnDiagnosticError = function (document: LangiumDocument): void {
    const diagnostics = document.diagnostics ?? [];
    const errors = diagnostics.filter((it) => it.severity === DiagnosticSeverity.Error);
    if (errors.length > 0) {
        console.error(chalk.red(`The document ${document.uri} has errors:`));
        for (const validationError of errors) {
            console.error(
                chalk.red(
                    `line ${validationError.range.start.line + 1}: ${
                        validationError.message
                    } [${document.textDocument.getText(validationError.range)}]`,
                ),
            );
        }
        process.exit(ExitCodes.FileWithErrors);
    }
};
