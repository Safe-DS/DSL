import { describe, expect, it } from 'vitest';
import {
    listPythonFiles,
    listSafeDsFiles,
    listTestsResourcesGroupedByParentDirectory_PathBased,
    resourceNameToUri,
} from './testResources.js';

describe('listSafeDsFiles', () => {
    it('should yield all Safe-DS files in a resource directory that are not skipped', () => {
        const rootResourceName = 'helpers/listSafeDsFiles';

        const actual = listSafeDsFiles(rootResourceName)
            .map((uri) => uri.fsPath)
            .sort();

        const expected = [
            'pipeline file.sdspipe',
            'stub file.sdsstub',
            'test file.sdstest',
            'nested/pipeline file.sdspipe',
            'nested/stub file.sdsstub',
            'nested/test file.sdstest',
        ]
            .map((resourceName) => resourceNameToUri(`${rootResourceName}/${resourceName}`).fsPath)
            .sort();

        expect(actual).toStrictEqual(expected);
    });
});

describe('listPythonFiles', () => {
    it('should yield all Python files in a resource directory', () => {
        const rootResourceName = 'helpers/listPythonFiles';

        const actual = listPythonFiles(rootResourceName)
            .map((uri) => uri.fsPath)
            .sort();

        const expected = ['python file.py', 'nested/python file.py']
            .map((resourceName) => resourceNameToUri(`${rootResourceName}/${resourceName}`).fsPath)
            .sort();

        expect(actual).toStrictEqual(expected);
    });
});

describe('listTestResourcesGroupedByParentDirectory', () => {
    it('should yield all Safe-DS files in a directory that are not skipped and group them by parent directory', () => {
        const result = listTestsResourcesGroupedByParentDirectory_PathBased('helpers/listTestResources');

        const keys = Object.keys(result);
        expect(normalizePaths(keys)).toStrictEqual(normalizePaths(['.', 'nested']));

        const directlyInRoot = result['.'];
        expect(normalizePaths(directlyInRoot)).toStrictEqual(
            normalizePaths(['pipeline file.sdspipe', 'stub file.sdsstub', 'test file.sdstest']),
        );

        const inNested = result.nested;
        expect(normalizePaths(inNested)).toStrictEqual(
            normalizePaths(['nested/pipeline file.sdspipe', 'nested/stub file.sdsstub', 'nested/test file.sdstest']),
        );
    });
});

/**
 * Normalizes the given paths by replacing backslashes with slashes and sorting them.
 *
 * @param paths The paths to normalize.
 * @return The normalized paths.
 */
const normalizePaths = (paths: string[]): string[] => {
    return paths.sort();
};

/**
 * Normalizes the given path by replacing backslashes with slashes.
 *
 * @param path The path to normalize.
 * @return The normalized path.
 */
const normalizePath = (path: string): string => {
    return path.replace(/\\/gu, '/');
};
