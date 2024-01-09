import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { URI } from 'langium';
import { uriToRelativePath } from '../../src/helpers/files.js';

describe('uriToRelativePath', () => {
    it('should return a path that is relative to the current working directory', () => {
        const fileName = 'test.sdstest';
        const uri = URI.file(path.join(process.cwd(), fileName));

        expect(uriToRelativePath(uri)).toBe(fileName);
    });
});
