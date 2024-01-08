import { LangiumDocument, LangiumServices, stream, URI } from 'langium';
import fs from 'node:fs';
import path from 'node:path';
import { ExitCode } from '../cli/exitCode.js';
import { globSync } from 'glob';
import { Result } from 'true-myth';
import chalk from 'chalk';

/**
 * Extracts a document from a file name.
 */
export const extractDocuments = async function (
    services: LangiumServices,
    fsPaths: string[],
): Promise<LangiumDocument[]> {
    // Access services
    const langiumDocuments = services.shared.workspace.LangiumDocuments;
    const documentBuilder = services.shared.workspace.DocumentBuilder;

    // Build documents
    const uris = processPaths(services, fsPaths);
    if (uris.isErr) {
        console.error(chalk.red(uris.error.message));
        process.exit(uris.error.code);
    }

    const documents = uris.value.map((uri) => langiumDocuments.getOrCreateDocument(uri));
    await documentBuilder.build(documents, { validation: true });
    return documents;
};

/**
 * Processes the given paths and returns the corresponding URIs. Files must have a Safe-DS extension. Directories are
 * traversed recursively.
 *
 * @returns The URIs of the matched files.
 */
export const processPaths = (services: LangiumServices, fsPaths: string[]): Result<URI[], ProcessPathsError> => {
    // Safe-DS file extensions
    const extensions = services.LanguageMetaData.fileExtensions;
    const pattern = `**/*{${extensions.join(',')}}`;

    const absolutePaths: string[] = [];

    for (const fsPath of fsPaths) {
        // Path must exist
        if (!fs.existsSync(fsPath)) {
            return Result.err({
                message: `Path '${fsPath}' does not exist.`,
                code: ExitCode.MissingPath,
            });
        }

        // Path must be a file or directory
        const stat = fs.lstatSync(fsPath);
        if (stat.isFile()) {
            // File must have a Safe-DS extension
            if (!extensions.includes(path.extname(fsPath))) {
                return Result.err({
                    message: `File '${fsPath}' does not have a Safe-DS extension.`,
                    code: ExitCode.FileWithoutSafeDsExtension,
                });
            }

            absolutePaths.push(path.resolve(fsPath));
        } else if (stat.isDirectory()) {
            const cwd = path.resolve(fsPath);
            const uris = globSync(pattern, { cwd, nodir: true }).map((it) => path.resolve(cwd, it));
            absolutePaths.push(...uris);
        } else {
            return Result.err({
                message: `Path '${fsPath}' is neither a file nor a directory.`,
                code: ExitCode.NotAFileOrDirectory,
            });
        }
    }

    // Remove duplicates and sort. Has to be done before creating URI objects.
    const result = stream(absolutePaths)
        .distinct()
        .toArray()
        .sort()
        .map((it) => URI.file(it));
    return Result.ok(result);
};

/**
 * An error that occurred while processing paths.
 */
export interface ProcessPathsError {
    /**
     * The message of the error.
     */
    message: string;

    /**
     * The exit code that should be used when terminating the process.
     */
    code: ExitCode;
}
