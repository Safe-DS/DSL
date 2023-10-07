import path from 'path';
import { globSync } from 'glob';
import { SAFE_DS_FILE_EXTENSIONS } from '../../src/language/helpers/fileExtensions.js';
import { group } from 'radash';
import { URI } from 'langium';

const resourcesPath = path.join(__dirname, '..', 'resources');

/**
 * A path relative to `tests/resources/`.
 */
export type ResourceName = string;

/**
 * A path relative to `tests/resources/` or a subdirectory thereof.
 */
export type ShortenedResourceName = string;

/**
 * Returns the URI that corresponds to the resource with the given name.
 *
 * @param resourceName The resource name.
 * @return The corresponding URI.
 */
export const resourceNameToUri = (resourceName: ResourceName): URI => {
    return URI.file(path.join(resourcesPath, resourceName));
};

/**
 * Returns the resource name that corresponds to the given URI. If `rootResourceName` is given, the result is relative
 * to `tests/resources/<rootResourceName>`. Otherwise, the result is relative to `tests/resources/`.
 *
 * @param uri The URI.
 * @param rootResourceName The corresponding root resource name.
 */
export const uriToShortenedResourceName = (uri: URI, rootResourceName?: ResourceName): ShortenedResourceName => {
    const rootPath = rootResourceName ? path.join(resourcesPath, rootResourceName) : resourcesPath;
    return path.relative(rootPath, uri.fsPath);
};

/**
 * Lists all Safe-DS files in the given root directory that are not skipped.
 *
 * @param rootResourceName The resource name of the root directory.
 * @return URIs of the discovered Safe-DS files.
 */
export const listSafeDsFiles = (rootResourceName: ResourceName): URI[] => {
    const pattern = `**/*.{${SAFE_DS_FILE_EXTENSIONS.join(',')}}`;
    const cwd = resourceNameToUri(rootResourceName).fsPath;

    return globSync(pattern, { cwd, nodir: true })
        .filter(isNotSkipped)
        .map((it) => URI.file(path.join(cwd, it)));
};

/**
 * Lists all Python files in the given root directory.
 *
 * @param rootResourceName The resource name of the root directory.
 * @return URIs of the discovered Python files.
 */
export const listPythonFiles = (rootResourceName: ResourceName): URI[] => {
    const pattern = `**/*.py`;
    const cwd = resourceNameToUri(rootResourceName).fsPath;

    return globSync(pattern, { cwd, nodir: true }).map((it) => URI.file(path.join(cwd, it)));
};

/**
 * Lists all Safe-DS files in the given root directory that are not skipped. The result is grouped by the parent
 * directory.
 *
 * @param rootResourceName The resource name of the root directory.
 * @return URIs of the discovered Safe-DS files grouped by the parent directory.
 */
export const listSafeDsFilesGroupedByParentDirectory = (rootResourceName: ResourceName): [URI, URI[]][] => {
    const uris = listSafeDsFiles(rootResourceName);
    const groupedByParentDirectory = group(uris, (p) => path.dirname(p.fsPath)) as Record<string, URI[]>;

    const result: [URI, URI[]][] = [];
    for (const [parentDirectory, urisInParentDirectory] of Object.entries(groupedByParentDirectory)) {
        result.push([URI.file(parentDirectory), urisInParentDirectory]);
    }

    return result;
};

const isNotSkipped = (pathRelativeToResources: string) => {
    const segments = pathRelativeToResources.split(path.sep);
    return !segments.some((segment) => segment.startsWith('skip'));
};
