import path from 'path';
import { globSync } from 'glob';
import {
    PIPELINE_FILE_EXTENSION,
    STUB_FILE_EXTENSION,
    TEST_FILE_EXTENSION,
} from '../../src/language/constant/fileExtensions.js';

const resourcesPath = path.join(__dirname, '..', 'resources');

/**
 * Resolves the given path relative to `tests/resources/`.
 *
 * @param pathRelativeToResources The path relative to `tests/resources/`.
 * @return The resolved absolute path.
 */
export const resolvePathRelativeToResources = (pathRelativeToResources: string) => {
    return path.join(resourcesPath, pathRelativeToResources);
};

/**
 * Lists all Safe-DS files in the given directory relative to `tests/resources/` except those that have a name starting
 * with 'skip'.
 *
 * @param pathRelativeToResources The root directory relative to `tests/resources/`.
 * @return Paths to the Safe-DS files relative to `pathRelativeToResources`.
 */
export const listTestResources = (pathRelativeToResources: string): string[] => {
    const fileExtensions = [PIPELINE_FILE_EXTENSION, STUB_FILE_EXTENSION, TEST_FILE_EXTENSION];
    const pattern = `**/*.{${fileExtensions.join(',')}}`;
    const cwd = resolvePathRelativeToResources(pathRelativeToResources);

    return globSync(pattern, { cwd, nodir: true }).filter(isNotSkipped);
};

const isNotSkipped = (pathRelativeToResources: string) => {
    const segments = pathRelativeToResources.split(path.sep);
    return !segments.some((segment) => segment.startsWith('skip'));
};
