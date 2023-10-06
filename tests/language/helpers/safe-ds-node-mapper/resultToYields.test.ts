import { afterEach, describe, expect, it } from 'vitest';
import { createSafeDsServices } from '../../../../src/language/safe-ds-module.js';
import { clearDocuments } from 'langium/test';
import { EmptyFileSystem } from 'langium';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';
import { isSdsResult } from '../../../../src/language/generated/ast.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const nodeMapper = services.helpers.NodeMapper;

describe('SafeDsNodeMapper', () => {
    afterEach(async () => {
        await clearDocuments(services);
    });

    describe('resultToYields', () => {
        it('should return an empty list if passed undefined', async () => {
            expect(nodeMapper.resultToYields(undefined)).toStrictEqual([]);
        });

        it('should return an empty list if result is not in a segment', async () => {
            const code = `fun myFunction() -> r1: Int`;

            const result = await getNodeOfType(services, code, isSdsResult);
            expect(nodeMapper.resultToYields(result)).toStrictEqual([]);
        });

        it('should return all yields that refer to a result', async () => {
            const code = `
                segment mySegment() -> r1: Int {
                    yield r1 = 1;
                    yield r1 = 2;
                }
            `;

            const result = await getNodeOfType(services, code, isSdsResult);
            expect(nodeMapper.resultToYields(result)).toHaveLength(2);
        });

        it('should not return yields that refer to another result', async () => {
            const code = `
                segment mySegment() -> (r1: Int, r2: Int) {
                    yield r1 = 1;
                    yield r2 = 2;
                    yield r2 = 3;
                }
            `;

            const result = await getNodeOfType(services, code, isSdsResult);
            expect(nodeMapper.resultToYields(result)).toHaveLength(1);
        });
    });
});
