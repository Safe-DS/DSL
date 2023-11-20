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
        ])('should return whether a callable has side effects (%#)', async ({ code, expected }) => {
            const callable = await getNodeOfType(services, code, isSdsCallable);
            expect(purityComputer.hasSideEffects(callable)).toBe(expected);
        });
    });

    describe('getImpurityReasons', () => {
        it.each([
            {
                testName: 'pure function',
                code: `
                    package test

                    @Pure
                    fun f()
                `,
                expected: [],
            },
            {
                testName: 'impure function without reasons',
                code: `
                    package test

                    @Impure([])
                    fun f()
                `,
                expected: [],
            },
            {
                testName: 'impure function with reasons (all valid)',
                code: `
                    package test

                    @Impure([
                        ImpurityReason.FileReadFromConstantPath("file.txt"),
                        ImpurityReason.FileReadFromParameterizedPath("p"),
                        ImpurityReason.FileWriteToConstantPath("file.txt"),
                        ImpurityReason.FileWriteToParameterizedPath("p"),
                        ImpurityReason.PotentiallyImpureParameterCall("g"),
                        ImpurityReason.Other
                    ])
                    fun f(g: () -> (), p: String)
                `,
                expected: [
                    'File read from "file.txt"',
                    'File read from test.f.p',
                    'File write to "file.txt"',
                    'File write to test.f.p',
                    'Potentially impure call of test.f.g',
                    'Other',
                ],
            },
            {
                testName: 'impure function with reasons (all invalid)',
                code: `
                    package test

                    @Impure([
                        ImpurityReason.FileReadFromConstantPath(1),
                        ImpurityReason.FileReadFromParameterizedPath(1),
                        ImpurityReason.FileReadFromParameterizedPath("p"),
                        ImpurityReason.FileWriteToConstantPath(1),
                        ImpurityReason.FileWriteToParameterizedPath(1),
                        ImpurityReason.FileWriteToParameterizedPath("p"),
                        ImpurityReason.PotentiallyImpureParameterCall(1),
                        ImpurityReason.PotentiallyImpureParameterCall("g"),
                    ])
                    fun f()
                `,
                expected: [
                    'File read from ?',
                    'File read from ?',
                    'File read from ?',
                    'File write to ?',
                    'File write to ?',
                    'File write to ?',
                    'Potentially impure call of ?',
                    'Potentially impure call of ?',
                ],
            },
            {
                testName: 'propagated',
                code: `
                    package test

                    segment mySegment() {
                        f();
                        g();
                    }

                    @Impure([ImpurityReason.Other])
                    fun f()

                    @Impure([ImpurityReason.FileReadFromConstantPath("file.txt")])
                    fun g()
                `,
                expected: ['Other', 'File read from "file.txt"'],
            },
        ])('should return the impurity reasons of a callable ($testName)', async ({ code, expected }) => {
            const callable = await getNodeOfType(services, code, isSdsCallable);
            const actual = purityComputer.getImpurityReasons(callable).map((reason) => reason.toString());
            expect(actual).toStrictEqual(expected);
        });
    });
});
