import { describe, expect, it } from 'vitest';
import {listBuiltinFiles} from "../../../src/language/builtins/fileFinder.js";

describe('listBuiltinsFiles', () => {
    it('should not return an empty list', () => {
        expect(listBuiltinFiles().length).toBeGreaterThan(0);
    });
});
