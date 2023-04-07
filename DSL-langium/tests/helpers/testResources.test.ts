import { describe, expect, test } from 'vitest';
import { listTestResources } from './testResources';

describe('listTestResources', () => {
    test('should yield all Safe-DS files in a directory', () => {
        expect(listTestResources('grammar').length > 0).toBe(true);
    });
});
