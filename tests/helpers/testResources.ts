import path from 'path';
import { globSync } from 'glob';
import { SAFE_DS_FILE_EXTENSIONS } from '../../src/language/helpers/fileExtensions';
import { group } from 'radash';

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
 * Lists all Safe-DS files in the given directory relative to `tests/resources/` that are not skipped.
 *
 * @param pathRelativeToResources The root directory relative to `tests/resources/`.
 * @return Paths to the Safe-DS files relative to `pathRelativeToResources`.
 */
export const listSafeDSResources = (pathRelativeToResources: string): string[] => {
    const pattern = `**/*.{${SAFE_DS_FILE_EXTENSIONS.join(',')}}`;
    const cwd = resolvePathRelativeToResources(pathRelativeToResources);

    return globSync(pattern, { cwd, nodir: true }).filter(isNotSkipped);
};

/**
 * Lists all Python files in the given directory relative to `tests/resources/`.
 *
 * @param pathRelativeToResources The root directory relative to `tests/resources/`.
 * @return Paths to the Python files relative to `pathRelativeToResources`.
 */
export const listPythonResources = (pathRelativeToResources: string): string[] => {
    const pattern = `**/*.py`;
    const cwd = resolvePathRelativeToResources(pathRelativeToResources);

    return globSync(pattern, { cwd, nodir: true });
};

/**
 * Lists all Safe-DS files in the given directory relative to `tests/resources/` that are not skipped. The result is
 * grouped by the parent directory.
 *
 * @param pathRelativeToResources The root directory relative to `tests/resources/`.
 * @return Paths to the Safe-DS files relative to `pathRelativeToResources` grouped by the parent directory.
 */
export const listTestsResourcesGroupedByParentDirectory = (
    pathRelativeToResources: string,
): Record<string, string[]> => {
    const paths = listSafeDSResources(pathRelativeToResources);
    return group(paths, (p) => path.dirname(p)) as Record<string, string[]>;
};

const isNotSkipped = (pathRelativeToResources: string) => {
    const segments = pathRelativeToResources.split(path.sep);
    return !segments.some((segment) => segment.startsWith('skip'));
};
