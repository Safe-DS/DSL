import { describe, expect, it } from 'vitest';
import { listTestResources } from './testResources';

describe('listTestResources', () => {
    it('should yield all Safe-DS files in a directory', () => {
        expect(listTestResources('grammar').length > 0).toBeTruthy();
    });
});
