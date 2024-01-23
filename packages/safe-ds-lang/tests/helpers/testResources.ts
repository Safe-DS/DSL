import path from 'path';
import { globSync } from 'glob';
import { SAFE_DS_FILE_EXTENSIONS } from '../../src/language/helpers/fileExtensions.js';
import { BuildOptions, LangiumDocument, URI } from 'langium';
import { SafeDsServices } from '../../src/language/index.js';
import { groupBy } from '../../src/helpers/collections.js';
import { fileURLToPath } from 'url';

const TEST_RESOURCES_PATH = fileURLToPath(new URL('../resources', import.meta.url));

/**
 * A path relative to `tests/resources/`.
 */
export type TestResourceName = string;

/**
 * A path relative to `tests/resources/` or a subdirectory thereof.
 */
export type ShortenedTestResourceName = string;

/**
 * Returns the URI that corresponds to the resource with the given name.
 *
 * @param testResourceName The resource name.
 * @return The corresponding URI.
 */
export const testResourceNameToUri = (testResourceName: TestResourceName): URI => {
    return URI.file(path.join(TEST_RESOURCES_PATH, testResourceName));
};

/**
 * Returns the resource name that corresponds to the given URI. If `rootResourceName` is given, the result is relative
 * to `tests/resources/<rootResourceName>`. Otherwise, the result is relative to `tests/resources/`.
 *
 * @param uri The URI.
 * @param rootTestResourceName The corresponding root resource name.
 */
export const uriToShortenedTestResourceName = (
    uri: URI,
    rootTestResourceName?: TestResourceName,
): ShortenedTestResourceName => {
    const rootPath = rootTestResourceName ? path.join(TEST_RESOURCES_PATH, rootTestResourceName) : TEST_RESOURCES_PATH;
    return path.relative(rootPath, uri.fsPath);
};

/**
 * Lists all Safe-DS files in the given root directory that are not skipped.
 *
 * @param rootTestResourceName The resource name of the root directory.
 * @return URIs of the discovered Safe-DS files.
 */
export const listTestSafeDsFiles = (rootTestResourceName: TestResourceName): URI[] => {
    const rootPath = testResourceNameToUri(rootTestResourceName).fsPath;
    return listTestFilesWithExtensions(rootTestResourceName, SAFE_DS_FILE_EXTENSIONS).filter((uri) =>
        isNotSkipped(path.relative(rootPath, uri.fsPath)),
    );
};

/**
 * Lists all files that end in any of the provided extensions in the given root directory.
 *
 * @param rootTestResourceName The resource name of the root directory.
 * @param extensions The array containing file extensions to match
 * @return URIs of the discovered files.
 */
export const listTestFilesWithExtensions = (rootTestResourceName: TestResourceName, extensions: string[]): URI[] => {
    const pattern = extensions.length === 1 ? `**/*.${extensions[0]}` : `**/*.{${extensions.join(',')}}`;
    const cwd = testResourceNameToUri(rootTestResourceName).fsPath;

    return globSync(pattern, { cwd, nodir: true }).map((it) => URI.file(path.join(cwd, it)));
};

/**
 * Lists all Safe-DS files in the given root directory that are not skipped. The result is grouped by the parent
 * directory.
 *
 * @param rootTestResourceName The resource name of the root directory.
 * @return URIs of the discovered Safe-DS files grouped by the parent directory.
 */
export const listTestSafeDsFilesGroupedByParentDirectory = (rootTestResourceName: TestResourceName): [URI, URI[]][] => {
    const uris = listTestSafeDsFiles(rootTestResourceName);
    const groupedByParentDirectory = groupBy(uris, (p) => path.dirname(p.fsPath));

    const result: [URI, URI[]][] = [];
    for (const [parentDirectory, urisInParentDirectory] of groupedByParentDirectory) {
        result.push([URI.file(parentDirectory), urisInParentDirectory]);
    }

    return result;
};

const isNotSkipped = (pathRelativeToResources: string) => {
    const segments = pathRelativeToResources.split(path.sep);
    return !segments.some((segment) => segment.startsWith('skip'));
};

/**
 * Load the documents at the specified URIs into the workspace managed by the given services.
 *
 * @param services The language services.
 * @param uris The URIs of the documents to load.
 * @param options The build options.
 * @returns The loaded documents.
 */
export const loadDocuments = async (
    services: SafeDsServices,
    uris: URI[],
    options: BuildOptions = {},
): Promise<LangiumDocument[]> => {
    const documents = uris.map((uri) => services.shared.workspace.LangiumDocuments.getOrCreateDocument(uri));
    await services.shared.workspace.DocumentBuilder.build(documents, options);
    return documents;
};
