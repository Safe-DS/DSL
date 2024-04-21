import { describe, expect, it } from 'vitest';
import { NodeFileSystem } from 'langium/node';
import { URI } from 'langium';
import { createSafeDsServices } from '../../../src/language/index.js';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const runner = services.runtime.Runner;

describe('SafeDsRunner', async () => {
    describe('getMainModuleName', async () => {
        it('sds', async () => {
            const document = services.shared.workspace.LangiumDocumentFactory.fromString('', URI.file('/a-b c.sds'));
            const mainModuleName = runner.getMainModuleName(document);
            expect(mainModuleName).toBe('a_b_c');
        });
        it('sdsdev', async () => {
            const document = services.shared.workspace.LangiumDocumentFactory.fromString('', URI.file('/a-b c.sdsdev'));
            const mainModuleName = runner.getMainModuleName(document);
            expect(mainModuleName).toBe('a_b_c');
        });
        it('other', async () => {
            const document = services.shared.workspace.LangiumDocumentFactory.fromString(
                '',
                URI.file('/a-b c.sdsdev2'),
            );
            const mainModuleName = runner.getMainModuleName(document);
            expect(mainModuleName).toBe('a_b_c_sdsdev2');
        });
    });
    describe('generateCodeForRunner', async () => {
        it('generateCodeForRunner', async () => {
            const document = services.shared.workspace.LangiumDocumentFactory.fromString(
                'package a\n\npipeline mainpipeline {}',
                URI.file('/b.sdsdev'),
            );
            const [programCodeMap] = runner.generateCodeForRunner(document, undefined);
            expect(JSON.stringify(programCodeMap).replaceAll('\\r\\n', '\\n')).toBe(
                '{"a":{"gen_b":"# Pipelines --------------------------------------------------------------------\\n\\ndef mainpipeline():\\n    pass\\n","gen_b_mainpipeline":"from .gen_b import mainpipeline\\n\\nif __name__ == \'__main__\':\\n    mainpipeline()\\n"}}',
            );
        });
    });
});
