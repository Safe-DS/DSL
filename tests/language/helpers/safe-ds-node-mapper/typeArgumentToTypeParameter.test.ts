import { afterEach, describe, expect, it } from 'vitest';
import { createSafeDsServices } from '../../../../src/language/safe-ds-module.js';
import { clearDocuments } from 'langium/test';
import { EmptyFileSystem } from 'langium';
import { getNodeOfType } from '../../../helpers/nodeFinder.js';
import { isSdsNamedType, isSdsUnionType, SdsTypeArgument } from '../../../../src/language/generated/ast.js';
import { typeArgumentsOrEmpty } from '../../../../src/language/helpers/nodeProperties.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const nodeMapper = services.helpers.NodeMapper;

describe('SafeDsNodeMapper', () => {
    afterEach(async () => {
        await clearDocuments(services);
    });

    describe('typeArgumentToTypeParameter', () => {
        it('should return undefined if passed undefined', () => {
            expect(nodeMapper.typeArgumentToTypeParameter(undefined)?.$type).toBeUndefined();
        });

        describe('named type argument', () => {
            it('should return undefined if the named type is unresolved', async () => {
                const code = `
                    class C<T>

                    segment mySegment(p: Unresolved<T = C>) {}
                `;

                const namedType = await getNodeOfType(services, code, isSdsNamedType);
                const parameterNames = typeArgumentsOrEmpty(namedType.typeArgumentList).map(typeParameterNameOrNull);
                expect(parameterNames).toStrictEqual([undefined]);
            });

            it('should return undefined if the type parameter is unresolved', async () => {
                const code = `
                    class C<T>

                    segment mySegment(p: C<Unresolved = C>) {}
                `;

                const namedType = await getNodeOfType(services, code, isSdsNamedType);
                const parameterNames = typeArgumentsOrEmpty(namedType.typeArgumentList).map(typeParameterNameOrNull);
                expect(parameterNames).toStrictEqual([undefined]);
            });

            it('should return the resolved type parameter', async () => {
                const code = `
                    class C<T1, T2, T3>

                    segment mySegment(p: C<T2 = C, T3 = C, T1 = C>) {}
                `;

                const namedType = await getNodeOfType(services, code, isSdsNamedType);
                const parameterNames = typeArgumentsOrEmpty(namedType.typeArgumentList).map(typeParameterNameOrNull);
                expect(parameterNames).toStrictEqual(['T2', 'T3', 'T1']);
            });
        });

        describe('positional argument', () => {
            it('should return undefined if the named type is unresolved', async () => {
                const code = `
                    class C<T>

                    segment mySegment(p: Unresolved<C>) {}
                `;

                const namedType = await getNodeOfType(services, code, isSdsNamedType);
                const parameterNames = typeArgumentsOrEmpty(namedType.typeArgumentList).map(typeParameterNameOrNull);
                expect(parameterNames).toStrictEqual([undefined]);
            });

            it('should return the type parameter at the same index if all prior type arguments are positional', async () => {
                const code = `
                    enum E {
                        V<T1, T2, T3>
                    }

                    segment mySegment(p: E.V<C, C, C>) {}
                `;

                const namedType = await getNodeOfType(services, code, isSdsNamedType, 1);
                const parameterNames = typeArgumentsOrEmpty(namedType.typeArgumentList).map(typeParameterNameOrNull);
                expect(parameterNames).toStrictEqual(['T1', 'T2', 'T3']);
            });

            it('should return undefined if a prior type argument is named', async () => {
                const code = `
                    class C<T1, T2, T3>

                    segment mySegment(p: C<T2 = C, C, C>) {}
                `;

                const namedType = await getNodeOfType(services, code, isSdsNamedType);
                const parameterNames = typeArgumentsOrEmpty(namedType.typeArgumentList).map(typeParameterNameOrNull);
                expect(parameterNames).toStrictEqual(['T2', undefined, undefined]);
            });

            it('should return undefined if type argument is out of bounds', async () => {
                const code = `
                    class C<T1, T2>

                    segment mySegment(p: C<C, C, C>) {}
                `;

                const namedType = await getNodeOfType(services, code, isSdsNamedType);
                const parameterNames = typeArgumentsOrEmpty(namedType.typeArgumentList).map(typeParameterNameOrNull);
                expect(parameterNames).toStrictEqual(['T1', 'T2', undefined]);
            });

            it('should return undefined for type arguments of union type', async () => {
                const code = `
                    class C

                    segment mySegment(p: union<C, C>) {}
                `;

                const unionType = await getNodeOfType(services, code, isSdsUnionType);
                const parameterNames = typeArgumentsOrEmpty(unionType.typeArgumentList).map(typeParameterNameOrNull);
                expect(parameterNames).toStrictEqual([undefined, undefined]);
            });

            it('should return undefined for type arguments of union type inside a named type', async () => {
                const code = `
                    class C<T>

                    segment mySegment(p: C<union<C, C>>) {}
                `;

                const unionType = await getNodeOfType(services, code, isSdsUnionType);
                const parameterNames = typeArgumentsOrEmpty(unionType.typeArgumentList).map(typeParameterNameOrNull);
                expect(parameterNames).toStrictEqual([undefined, undefined]);
            });
        });

        const typeParameterNameOrNull = (node: SdsTypeArgument): string | undefined => {
            const typeParameter = nodeMapper.typeArgumentToTypeParameter(node);
            return typeParameter?.name ?? undefined;
        };
    });
});
