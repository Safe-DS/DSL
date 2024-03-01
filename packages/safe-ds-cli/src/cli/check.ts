import { createSafeDsServices } from '@safe-ds/lang';
import { NodeFileSystem } from 'langium/node';
import { extractDocuments } from '../helpers/documents.js';
import { diagnosticToString, getDiagnostics } from '../helpers/diagnostics.js';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import chalk from 'chalk';
import { ExitCode } from './exitCode.js';

export const check = async (fsPaths: string[], options: CheckOptions): Promise<void> => {
    const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;

    let errorCount = 0;

    for (const document of await extractDocuments(services, fsPaths)) {
        for (const diagnostic of getDiagnostics(document)) {
            console.log(diagnosticToString(document.uri, diagnostic, options));

            if (isError(diagnostic, options)) {
                errorCount++;
            }
        }
    }

    if (errorCount > 0) {
        console.error(chalk.red(`Found ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}.`));
        process.exit(ExitCode.FileHasErrors);
    } else {
        console.log(chalk.green(`No errors found.`));
    }
};

/**
 * Command line options for the `check` command.
 */
export interface CheckOptions {
    /**
     * Whether the program should fail on warnings.
     */
    strict: boolean;
}

const isError = (diagnostic: Diagnostic, options: CheckOptions) => {
    return (
        diagnostic.severity === DiagnosticSeverity.Error ||
        (diagnostic.severity === DiagnosticSeverity.Warning && options.strict)
    );
};
