import { describe, expect, it } from 'vitest';
import {
    listPythonFiles,
    listSafeDsFiles,
    listSafeDsFilesGroupedByParentDirectory,
    ResourceName,
    resourceNameToUri,
    ShortenedResourceName,
    uriToShortenedResourceName,
} from './testResources.js';
import { URI } from 'langium';

describe('uriToShortenedResourceName', () => {
    it('should return the corresponding resource name if no root resource name is given', () => {
        const resourceName = 'helpers/listSafeDsFiles';
        const actual = uriToShortenedResourceName(resourceNameToUri(resourceName));
        expect(normalizeResourceName(actual)).toBe(normalizeResourceName(resourceName));
    });

    it('should return a shortened resource name if a root resource name is given', () => {
        const resourceName = 'helpers/nested/listSafeDsFiles';
        const actual = uriToShortenedResourceName(resourceNameToUri(resourceName), 'helpers/nested');
        expect(actual).toBe('listSafeDsFiles');
    });
});

describe('listSafeDsFiles', () => {
    it('should return all Safe-DS files in a resource directory that are not skipped', () => {
        const rootResourceName = 'helpers/listSafeDsFiles';
        const actual = listSafeDsFiles(rootResourceName);
        const expected = [
            'pipeline file.sdspipe',
            'stub file.sdsstub',
            'test file.sdstest',
            'nested/pipeline file.sdspipe',
            'nested/stub file.sdsstub',
            'nested/test file.sdstest',
        ];

        expectFileListsToMatch(rootResourceName, actual, expected);
    });
});

describe('listPythonFiles', () => {
    it('should return all Python files in a resource directory', () => {
        const rootResourceName = 'helpers/listPythonFiles';
        const actual = listPythonFiles(rootResourceName);
        const expected = ['python file.py', 'nested/python file.py'];

        expectFileListsToMatch(rootResourceName, actual, expected);
    });
});

describe('listSafeDsFilesGroupedByParentDirectory', () => {
    it('should return all Safe-DS files in a directory that are not skipped and group them by parent directory', () => {
        const rootResourceName = 'helpers/listSafeDsFiles';
        const result = listSafeDsFilesGroupedByParentDirectory(rootResourceName);

        // Compare the keys, i.e. the parent directories
        const actualKeys = [...result.keys()];
        const expectedKeys = ['', 'nested'];
        expectFileListsToMatch(rootResourceName, actualKeys, expectedKeys);

        // Compare the values, i.e. the files, in the root directory
        const actualValuesDirectlyInRoot = [...result.entries()].find(
            ([key]) => uriToShortenedResourceName(key, rootResourceName) === '',
        )!;
        const expectedValuesDirectlyInRoot = ['pipeline file.sdspipe', 'stub file.sdsstub', 'test file.sdstest'];
        expectFileListsToMatch(rootResourceName, actualValuesDirectlyInRoot[1], expectedValuesDirectlyInRoot);

        // Compare the values, i.e. the files, in the nested directory
        const actualValuesInNested = [...result.entries()].find(
            ([key]) => uriToShortenedResourceName(key, rootResourceName) === 'nested',
        )!;
        const expectedValuesInNested = [
            'nested/pipeline file.sdspipe',
            'nested/stub file.sdsstub',
            'nested/test file.sdstest',
        ];
        expectFileListsToMatch(rootResourceName, actualValuesInNested[1], expectedValuesInNested);
    });
});

/**
 * Asserts that the actual uris and the expected shortened resource names point to the same files.
 *
 * @param rootResourceName The root resource name.
 * @param actualUris The actual URIs computed by some function under test.
 * @param expectedShortenedResourceNames The expected shortened resource names.
 */
const expectFileListsToMatch = (
    rootResourceName: ResourceName,
    actualUris: URI[],
    expectedShortenedResourceNames: ShortenedResourceName[],
): void => {
    const actualShortenedResourceNames = actualUris.map((uri) => uriToShortenedResourceName(uri, rootResourceName));
    expect(normalizeResourceNames(actualShortenedResourceNames)).toStrictEqual(
        normalizeResourceNames(expectedShortenedResourceNames),
    );
};

/**
 * Normalizes the given resource names by replacing backslashes with slashes and sorting them.
 *
 * @param resourceNames The resource names to normalize.
 * @return The normalized resource names.
 */
const normalizeResourceNames = (resourceNames: string[]): string[] => {
    return resourceNames.map(normalizeResourceName).sort();
};

/**
 * Normalizes the given resource name by replacing backslashes with slashes.
 *
 * @param resourceName The resource name to normalize.
 * @return The normalized resource name.
 */
const normalizeResourceName = (resourceName: string): string => {
    return resourceName.replace(/\\/gu, '/');
};
