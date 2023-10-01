import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { getLinkingErrors } from '../../helpers/diagnostics.js';
import { NodeFileSystem } from 'langium/node';
import { clearDocuments } from 'langium/test';

const services = createSafeDsServices(NodeFileSystem).SafeDs;

describe('SafeDsWorkspaceManager', () => {
    beforeAll(async () => {
        await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
    });

    afterAll(async () => {
        await clearDocuments(services);
    });

    describe('loadAdditionalDocuments', () => {
        it.each(['Any', 'Boolean', 'Float', 'Int', 'Nothing', 'Number', 'String'])(
            'should be possible to refer to %s',
            async (type) => {
                const diagnostics = await getLinkingErrors(
                    services,
                    `
package test

class C {
    attr a: ${type}
}
                `,
                );
                expect(diagnostics).toHaveLength(0);
            },
        );
    });
});
