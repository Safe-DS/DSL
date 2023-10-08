import { afterEach, describe, expect, it } from 'vitest';
import { createSafeDsServices } from '../../../../src/language/safe-ds-module.js';
import { clearDocuments } from 'langium/test';
import { EmptyFileSystem } from 'langium';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';
import { isSdsParameter } from '../../../../src/language/generated/ast.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const nodeMapper = services.helpers.NodeMapper;

describe('SafeDsNodeMapper', () => {
    afterEach(async () => {
        await clearDocuments(services);
    });

    describe('parameterToReferences', () => {
        it('should return an empty list if passed undefined', async () => {
            expect(nodeMapper.parameterToReferences(undefined)).toStrictEqual([]);
        });

        it('should return references in default values', async () => {
            const code = `
                fun myFunction(p1: Int, p2: Int = p1)
            `;

            const parameter = await getNodeOfType(services, code, isSdsParameter);
            expect(nodeMapper.parameterToReferences(parameter)).toHaveLength(1);
        });

        it('should return references directly in body', async () => {
            const code = `
                segment mySegment(p1: Int) {
                    p1;
                    p1;
                };
            `;

            const parameter = await getNodeOfType(services, code, isSdsParameter);
            expect(nodeMapper.parameterToReferences(parameter)).toHaveLength(2);
        });

        it('should return references nested in body', async () => {
            const code = `
                segment mySegment(p1: Int) {
                    () {
                        p1;
                    };
                    () -> p1;
                };
            `;

            const parameter = await getNodeOfType(services, code, isSdsParameter);
            expect(nodeMapper.parameterToReferences(parameter)).toHaveLength(2);
        });

        it('should return references in own parameter list', async () => {
            const code = `
                segment mySegment(p1: Int, p2: Int = p1) {};
            `;

            const parameter = await getNodeOfType(services, code, isSdsParameter);
            expect(nodeMapper.parameterToReferences(parameter)).toHaveLength(1);
        });

        it('should return references in nested parameter list', async () => {
            const code = `
                segment mySegment(p1: Int) {
                    (p2: Int = p1) {};
                    (p2: Int = p1) -> 1;
                };
            `;

            const parameter = await getNodeOfType(services, code, isSdsParameter);
            expect(nodeMapper.parameterToReferences(parameter)).toHaveLength(2);
        });

        it('should not return references to other parameters', async () => {
            const code = `
                segment mySegment(p1: Int, p2: Int) {
                    p1;
                    p2;
                };
            `;

            const parameter = await getNodeOfType(services, code, isSdsParameter);
            expect(nodeMapper.parameterToReferences(parameter)).toHaveLength(1);
        });
    });
});
