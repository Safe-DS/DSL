import { describe, expect, it } from 'vitest';
import { NodeFileSystem } from 'langium/node';
import { createSafeDsServicesWithBuiltins } from '../../../src/language/index.js';
import { isSdsCall, isSdsCallable } from '../../../src/language/generated/ast.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const purityComputer = services.purity.PurityComputer;

describe('SafeDsPurityComputer', async () => {
    describe('isPure', () => {
        it.each([
            {
                code: `
                    package test

                    @Pure
                    fun f()
                `,
                expected: true,
            },
            {
                code: `
                    package test

                    @Impure([ImpurityReason.Other])
                    fun f()
                `,
                expected: false,
            },
        ])('should return whether a callable is pure (%#)', async ({ code, expected }) => {
            const callable = await getNodeOfType(services, code, isSdsCallable);
            expect(purityComputer.isPure(callable)).toBe(expected);
        });

        it.each([
            {
                code: `
                    package test

                    @Pure
                    fun f()

                    pipeline myPipeline {
                        f();
                    }
                `,
                expected: true,
            },
            {
                code: `
                    package test

                    @Impure([ImpurityReason.Other])
                    fun f()

                    pipeline myPipeline {
                        f();
                    }
                `,
                expected: false,
            },
        ])('should return whether a call is pure (%#)', async ({ code, expected }) => {
            const call = await getNodeOfType(services, code, isSdsCall);
            expect(purityComputer.isPure(call)).toBe(expected);
        });
    });

    describe('hasSideEffects', () => {
        it.each([
            {
                code: `
                    package test

                    @Pure
                    fun f()

                    pipeline myPipeline {
                        f();
                    }
                `,
                expected: false,
            },
            {
                code: `
                    package test

                    @Impure([ImpurityReason.FileReadFromConstantPath("file.txt")])
                    fun f()

                    pipeline myPipeline {
                        f();
                    }
                `,
                expected: false,
            },
            {
                code: `
                    package test

                    @Impure([ImpurityReason.Other])
                    fun f()

                    pipeline myPipeline {
                        f();
                    }
                `,
                expected: true,
            },
        ])('should return whether a call has side effects (%#)', async ({ code, expected }) => {
            const call = await getNodeOfType(services, code, isSdsCall);
            expect(purityComputer.hasSideEffects(call)).toBe(expected);
        });

        it.each([
            {
                code: `
                    package test

                    @Pure
                    fun f()
                `,
                expected: false,
            },
            {
                code: `
                    package test

                    @Impure([ImpurityReason.FileReadFromConstantPath("file.txt")])
                    fun f()
                `,
                expected: false,
            },
            {
                code: `
                    package test

                    @Impure([ImpurityReason.Other])
                    fun f()
                `,
                expected: true,
            },
        ])('should return whether a call has side effects (%#)', async ({ code, expected }) => {
            const callable = await getNodeOfType(services, code, isSdsCallable);
            expect(purityComputer.hasSideEffects(callable)).toBe(expected);
        });
    });

    describe('getImpurityReasons', () => {});
});
