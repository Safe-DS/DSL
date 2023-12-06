import chalk from 'chalk';
import { LangiumDocument, LangiumServices, URI } from 'langium';
import fs from 'node:fs';
import path from 'node:path';
import { ExitCodes } from '../cli/exitCodes.js';
import { globSync } from 'glob';

/**
 * Extracts a document from a file name.
 */
export const extractDocuments = async function (
    services: LangiumServices,
    fsPaths: string[],
): Promise<LangiumDocument[]> {
    return [];
    // // Access services
    // const extensions = services.LanguageMetaData.fileExtensions;
    // const langiumDocuments = services.shared.workspace.LangiumDocuments;
    // const documentBuilder = services.shared.workspace.DocumentBuilder;
    //

    //
    // const stat = fs.lstatSync(paths);
    // if (stat.isDirectory()) {
    //     console.error(chalk.red(`Path ${paths} is a directory.`));
    //     process.exit(ExitCodes.NotAFileOrDirectory);
    // } else if (!stat.isFile()) {
    //     console.error(chalk.red(`Path ${paths} is not a file.`));
    //     process.exit(ExitCodes.NotAFileOrDirectory);
    // }
    //

    //
    // // Build document
    // const document = langiumDocuments.getOrCreateDocument(URI.file(path.resolve(paths)));
    // await documentBuilder.build([document], { validation: true });
    // return [document];
};

/**
 * Processes the given paths and returns the corresponding URIs. Files must have a Safe-DS extension. Directories are
 * traversed recursively.
 */
export const processPaths = (services: LangiumServices, fsPaths: string[]): URI[] => {
    // Safe-DS file extensions
    const extensions = services.LanguageMetaData.fileExtensions;
    const pattern = `**/*{${extensions.join(',')}}`;

    // eslint-disable-next-line array-callback-return
    return fsPaths.flatMap((fsPath) => {
        // Path must exist
        if (!fs.existsSync(fsPath)) {
            console.error(chalk.red(`Path '${fsPath}' does not exist.`));
            process.exit(ExitCodes.MissingPath);
        }

        // Path must be a file or directory
        const stat = fs.lstatSync(fsPath);
        if (stat.isFile()) {
            // File must have a Safe-DS extension
            if (!extensions.includes(path.extname(fsPath))) {
                console.error(chalk.red(`File '${fsPath}' does not have a Safe-DS extension.`));
                process.exit(ExitCodes.FileWithoutSafeDsExtension);
            }

            return URI.file(path.resolve(fsPath));
        } else if (stat.isDirectory()) {
            return globSync(pattern, { cwd: path.resolve(fsPath), nodir: true }).map((it) =>
                URI.file(path.resolve(it)),
            );
        } else {
            console.error(chalk.red(`Path '${fsPath}' is neither a file nor a directory.`));
            process.exit(ExitCodes.NotAFileOrDirectory);
        }
    });
};
