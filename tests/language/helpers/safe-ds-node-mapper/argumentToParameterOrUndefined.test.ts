import { afterEach, describe, expect, it } from 'vitest';
import { createSafeDsServices } from '../../../../src/language/safe-ds-module.js';
import { clearDocuments } from 'langium/test';
import { EmptyFileSystem } from 'langium';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';
import { isSdsAbstractCall, SdsArgument } from '../../../../src/language/generated/ast.js';
import { argumentsOrEmpty } from '../../../../src/language/helpers/shortcuts.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const nodeMapper = services.helpers.NodeMapper;

describe('SafeDsNodeMapper', () => {
    afterEach(async () => {
        await clearDocuments(services);
    });

    describe('argumentToParameterOrUndefined', () => {
        it('should return undefined if passed undefined', () => {
            expect(nodeMapper.argumentToParameterOrUndefined(undefined)).toBeUndefined();
        });

        describe('named argument', () => {
            it('should return undefined if the parameter is unresolved', async () => {
                const code = `
                    fun f(p: Int) {}

                    pipeline myPipeline {
                        f(unresolved = 1);
                    }
                `;

                const firstCall = await getNodeOfType(services, code, isSdsAbstractCall);
                const parameterNames = argumentsOrEmpty(firstCall).map(parameterNameOrNull);
                expect(parameterNames).toStrictEqual([undefined]);
            });

            it('should return the resolved parameter', async () => {
                const code = `
                    fun f(p1: Int, p2: Int, p3: Int) {}

                    pipeline myPipeline {
                        f(p2 = 1, p3 = 1, p1 = 1);
                    }
                `;

                const firstCall = await getNodeOfType(services, code, isSdsAbstractCall);
                const parameterNames = argumentsOrEmpty(firstCall).map(parameterNameOrNull);
                expect(parameterNames).toStrictEqual(["p2", "p3", "p1"]);
            });
        });

        describe('positional argument', () => {
            it('should return the parameter at the same index if all prior arguments are positional', async () => {
                const code = `
                    fun f(p1: Int = 0, vararg p2: Int, p3: Int) {}

                    pipeline myPipeline {
                        f(1, 2, 3);
                    }
                `;

                const firstCall = await getNodeOfType(services, code, isSdsAbstractCall);
                const parameterNames = argumentsOrEmpty(firstCall).map(parameterNameOrNull);
                expect(parameterNames).toStrictEqual(["p1", "p2", "p3"]);
            });

            it('should return undefined if a prior argument is named', async () => {
                const code = `
                    fun f(p1: Int = 0, vararg p2: Int, p3: Int) {}

                    pipeline myPipeline {
                        f(p2 = 1, 2, 3);
                    }
                `;

                const firstCall = await getNodeOfType(services, code, isSdsAbstractCall);
                const parameterNames = argumentsOrEmpty(firstCall).map(parameterNameOrNull);
                expect(parameterNames).toStrictEqual(["p2", undefined, undefined]);
            });

            it('should return undefined if argument is out of bounds and there is no final variadic parameter', async () => {
                const code = `
                    fun f(vararg p1: Int, p2: Int) {}

                    pipeline myPipeline {
                        f(1, 2, 3);
                    }
                `;

                const firstCall = await getNodeOfType(services, code, isSdsAbstractCall);
                const parameterNames = argumentsOrEmpty(firstCall).map(parameterNameOrNull);
                expect(parameterNames).toStrictEqual(["p1", "p2", undefined]);
            });

            it('should return return the final variadic parameter if argument is out of bounds', async () => {
                const code = `
                    fun f(p1: Int, p2: Int = 0, vararg p3: Int) {}

                    pipeline myPipeline {
                        f(1, 2, 3, 4, 5);
                    }
                `;

                const firstCall = await getNodeOfType(services, code, isSdsAbstractCall);
                const parameterNames = argumentsOrEmpty(firstCall).map(parameterNameOrNull);
                expect(parameterNames).toStrictEqual(["p1", "p2", "p3", "p3", "p3"]);
            });
        });

        const parameterNameOrNull = (node: SdsArgument): string | undefined => {
            const parameter = nodeMapper.argumentToParameterOrUndefined(node);
            return parameter?.name ?? undefined;
        };
    });
});
