import path from 'node:path';
import fs from 'node:fs';

/**
 * Creates all parent directories for the given path if they do not exist.
 */
export const makeParentDirectoriesSync = (fsPath: string) => {
    const parentDirectoryPath = path.dirname(fsPath);
    if (!fs.existsSync(parentDirectoryPath)) {
        fs.mkdirSync(parentDirectoryPath, { recursive: true });
    }
};
