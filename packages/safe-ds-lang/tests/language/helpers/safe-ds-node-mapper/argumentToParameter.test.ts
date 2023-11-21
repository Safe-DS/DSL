import { EmptyFileSystem } from 'langium';
import { describe, expect, it } from 'vitest';
import { isSdsAbstractCall, SdsArgument } from '../../../../src/language/generated/ast.js';
import { getArguments } from '../../../../src/language/helpers/nodeProperties.js';
import { createSafeDsServices } from '../../../../src/language/index.js';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const nodeMapper = services.helpers.NodeMapper;

describe('SafeDsNodeMapper', () => {
    describe('argumentToParameter', () => {
        it('should return undefined if passed undefined', () => {
            expect(nodeMapper.argumentToParameter(undefined)?.$type).toBeUndefined();
        });

        describe('named argument', () => {
            it('should return undefined if the parameter is unresolved', async () => {
                const code = `
                    fun f(p: Int) {}

                    pipeline myPipeline {
                        f(unresolved = 1);
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                const parameterNames = getArguments(call).map(parameterNameOrNull);
                expect(parameterNames).toStrictEqual([undefined]);
            });

            it('should return the resolved parameter', async () => {
                const code = `
                    fun f(p1: Int, p2: Int, p3: Int) {}

                    pipeline myPipeline {
                        f(p2 = 1, p3 = 1, p1 = 1);
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                const parameterNames = getArguments(call).map(parameterNameOrNull);
                expect(parameterNames).toStrictEqual(['p2', 'p3', 'p1']);
            });
        });

        describe('positional argument', () => {
            it('should return the parameter at the same index if all prior arguments are positional', async () => {
                const code = `
                    fun f(p1: Int = 0, p2: Int, p3: Int) {}

                    pipeline myPipeline {
                        f(1, 2, 3);
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                const parameterNames = getArguments(call).map(parameterNameOrNull);
                expect(parameterNames).toStrictEqual(['p1', 'p2', 'p3']);
            });

            it('should return undefined if a prior argument is named', async () => {
                const code = `
                    fun f(p1: Int = 0, p2: Int, p3: Int) {}

                    pipeline myPipeline {
                        f(p2 = 1, 2, 3);
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                const parameterNames = getArguments(call).map(parameterNameOrNull);
                expect(parameterNames).toStrictEqual(['p2', undefined, undefined]);
            });

            it('should return undefined if argument is out of bounds', async () => {
                const code = `
                    fun f(p1: Int, p2: Int) {}

                    pipeline myPipeline {
                        f(1, 2, 3);
                    }
                `;

                const call = await getNodeOfType(services, code, isSdsAbstractCall);
                const parameterNames = getArguments(call).map(parameterNameOrNull);
                expect(parameterNames).toStrictEqual(['p1', 'p2', undefined]);
            });
        });

        const parameterNameOrNull = (node: SdsArgument): string | undefined => {
            const parameter = nodeMapper.argumentToParameter(node);
            return parameter?.name ?? undefined;
        };
    });
});
