import { describe, expect, it } from 'vitest';
import { listBuiltinsFiles } from '../../../src/language/builtins/workspaceManager.js';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { getLinkingErrors } from '../../helpers/diagnostics.js';
import { NodeFileSystem } from 'langium/node';

const services = createSafeDsServices(NodeFileSystem).SafeDs;

describe('SafeDsWorkspaceManager', () => {
    describe('loadAdditionalDocuments', () => {
        it.each(['Any', 'Boolean', 'Float', 'Int', 'Nothing', 'Number', 'String'])(
            'should be possible to refer to %s',
            async (type) => {
                const diagnostics = await getLinkingErrors(services, `
package test

class C {
    attr a: ${type}
}
                `);
                expect(diagnostics).toHaveLength(0);
            },
        );
    });
});

describe('listBuiltinsFiles', () => {
    it('should not return an empty list', () => {
        expect(listBuiltinsFiles().length).toBeGreaterThan(0);
    });
});
