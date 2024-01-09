import path from 'node:path';
import fs from 'node:fs';
import { URI } from 'langium';

/**
 * Creates all parent directories for the given path if they do not exist.
 */
export const makeParentDirectoriesSync = (fsPath: string) => {
    const parentDirectoryPath = path.dirname(fsPath);
    if (!fs.existsSync(parentDirectoryPath)) {
        fs.mkdirSync(parentDirectoryPath, { recursive: true });
    }
};

/**
 * Converts the given URI to a path relative to the current working directory.
 */
export const uriToRelativePath = (uri: URI): string => {
    return path.relative(process.cwd(), uri.fsPath);
};
