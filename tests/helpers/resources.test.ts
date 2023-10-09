import { describe, expect, it } from 'vitest';
import {resourceNameToUri, uriToShortenedResourceName} from '../../src/helpers/resources.js';

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

/**
 * Normalizes the given resource name by replacing backslashes with slashes.
 *
 * @param resourceName The resource name to normalize.
 * @return The normalized resource name.
 */
const normalizeResourceName = (resourceName: string): string => {
    return resourceName.replace(/\\/gu, '/');
};
