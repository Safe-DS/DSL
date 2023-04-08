import { describe, it, expect } from 'vitest';
import { listTestResources } from './testResources';


describe('listTestResources', () => {
    it('should yield all Safe-DS files in a directory that are not skipped', () => {
        const result = listTestResources('helpers/listTestResources').sort();
        const expected = ['pipeline file.sdspipe', 'stub file.sdsstub', 'test file.sdstest'].sort();
        expect(result).toStrictEqual(expected);
    });
});
