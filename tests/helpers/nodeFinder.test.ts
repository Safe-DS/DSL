import { afterEach, describe, expect, it } from 'vitest';
import { getNodeOfType, getNodeByLocation } from './nodeFinder.js';
import { createSafeDsServices } from '../../src/language/safe-ds-module.js';
import { EmptyFileSystem } from 'langium';
import { AssertionError } from 'assert';
import { clearDocuments, parseHelper } from 'langium/test';
import { isSdsClass, isSdsDeclaration, isSdsEnum } from '../../src/language/generated/ast.js';

describe('getNodeByLocation', () => {
    const services = createSafeDsServices(EmptyFileSystem).SafeDs;

    afterEach(async () => {
        await clearDocuments(services);
    });

    it('should throw if no document is found', () => {
        expect(() => {
            getNodeByLocation(services, {
                uri: 'file:///test.sdstest',
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            });
        }).toThrowErrorMatchingSnapshot();
    });

    it('should throw if no node is found', async () => {
        const document = await parseHelper(services)(`class C`);

        expect(() => {
            getNodeByLocation(services, {
                uri: document.uri.toString(),
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
            });
        }).toThrow(AssertionError);
    });

    it('should return the node that fills the range completely', async () => {
        const document = await parseHelper(services)(`class C`);

        expect(
            getNodeByLocation(services, {
                uri: document.uri.toString(),
                range: { start: { line: 0, character: 0 }, end: { line: 0, character: 7 } },
            }),
        ).to.satisfy(isSdsClass);
    });

    it('should return the node whose name fills the range completely', async () => {
        const document = await parseHelper(services)(`class C`);

        expect(
            getNodeByLocation(services, {
                uri: document.uri.toString(),
                range: { start: { line: 0, character: 6 }, end: { line: 0, character: 7 } },
            }),
        ).to.satisfy(isSdsClass);
    });
});

describe('getNodeOfType', () => {
    const services = createSafeDsServices(EmptyFileSystem).SafeDs;

    afterEach(async () => {
        await clearDocuments(services);
    });

    it('should throw if no node is found', async () => {
        const code = '';
        expect(async () => {
            await getNodeOfType(services, code, isSdsClass);
        }).rejects.toThrowErrorMatchingSnapshot();
    });

    it('should throw if not enough nodes are found', async () => {
        const code = `class C`;
        expect(async () => {
            await getNodeOfType(services, code, isSdsClass, 1);
        }).rejects.toThrowErrorMatchingSnapshot();
    });

    it('should return the first matching node if no index is set', async () => {
        const code = 'class C';
        const node = await getNodeOfType(services, code, isSdsClass);
        expect(node).to.satisfy(isSdsClass);
    });

    it('should return the nth matching node if an index is set', async () => {
        const code = `
            class C
            enum D
        `;
        const node = await getNodeOfType(services, code, isSdsDeclaration, 1);
        expect(node).to.satisfy(isSdsEnum);
    });
});
