import { describe, expect, it } from 'vitest';
import { NodeFileSystem } from 'langium/node';
import net from 'net';
import { URI } from 'langium';
import { createSafeDsServices } from '../../../src/language/index.js';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const runner = services.runtime.Runner;

describe('SafeDsRunner', async () => {
    describe('findFirstFreePort', async () => {
        it('occupied', async () => {
            const server = net.createServer();
            server.on('error', (err: any) => {
                throw err;
            });
            const portNumber = 46821;
            await new Promise<void>((resolve, _reject) => {
                server.listen(portNumber, '127.0.0.1', () => {
                    resolve();
                });
            });
            const foundPort = await runner.findFirstFreePort(portNumber);
            server.close();
            expect(foundPort).toStrictEqual(portNumber + 1);
        });
        it('available', async () => {
            const portNumber = 46825;
            const foundPort = await runner.findFirstFreePort(portNumber);
            expect(foundPort).toStrictEqual(portNumber);
        });
    });
    describe('getMainModuleName', async () => {
        it('sdspipe', async () => {
            const document = services.shared.workspace.LangiumDocumentFactory.fromString(
                '',
                URI.file('/a-b c.sdspipe'),
            );
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
