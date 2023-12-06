import { createSafeDsServicesWithBuiltins } from '@safe-ds/lang';
import { NodeFileSystem } from 'langium/node';
import { extractDocuments } from '../helpers/documents.js';
import { diagnosticToString, getDiagnostics } from '../helpers/diagnostics.js';
import { DiagnosticSeverity } from 'vscode-languageserver';
import chalk from 'chalk';
import { ExitCodes } from './exitCodes.js';

export const check = async (fsPaths: string[], options: CheckOptions): Promise<void> => {
    const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;

    let errorCount = 0;

    for (const document of await extractDocuments(services, fsPaths)) {
        for (const diagnostic of getDiagnostics(document)) {
            console.log(diagnosticToString(document.uri, diagnostic, options));

            if (
                diagnostic.severity === DiagnosticSeverity.Error ||
                (diagnostic.severity === DiagnosticSeverity.Warning && options.strict)
            ) {
                errorCount++;
            }
        }
    }

    if (errorCount > 0) {
        console.error(chalk.red(`Found ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}.`));
        process.exit(ExitCodes.FileHasErrors);
    } else {
        console.log(chalk.green(`No errors found.`));
    }
};

/**
 * Command line options for the `check` command.
 */
interface CheckOptions {
    /**
     * Whether the program should fail on warnings.
     */
    strict: boolean;
}
