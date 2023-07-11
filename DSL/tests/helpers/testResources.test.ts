import { describe, expect, it } from 'vitest';
import { listTestResources } from './testResources';

describe('listTestResources', () => {
    it('should yield all Safe-DS files in a directory that are not skipped', () => {
        const result = listTestResources('helpers/listTestResources')
            .map((path) => path.replace(/\\/gu, '/'))
            .sort();
        const expected = [
            'pipeline file.sdspipe',
            'stub file.sdsstub',
            'test file.sdstest',
            'nested/pipeline file.sdspipe',
            'nested/stub file.sdsstub',
            'nested/test file.sdstest',
        ].sort();
        expect(result).toStrictEqual(expected);
    });
});
