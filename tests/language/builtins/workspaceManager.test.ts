import { describe, it, expect } from 'vitest';
import { listBuiltinsFiles } from '../../../src/language/builtins/workspaceManager.js';

describe('listBuiltinFiles', () => {
    it('should not return an empty list', () => {
        expect(listBuiltinsFiles().length).toBeGreaterThan(0);
    });
});
