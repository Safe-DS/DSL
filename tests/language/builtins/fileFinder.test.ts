import { describe, expect, it } from 'vitest';
import { listBuiltinsFiles } from '../../../src/language/builtins/fileFinder.js';

describe('listBuiltinsFiles', () => {
    it('should not return an empty list', () => {
        expect(listBuiltinsFiles().length).toBeGreaterThan(0);
    });
});
