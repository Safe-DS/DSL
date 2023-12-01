import { describe, expect, it } from 'vitest';
import { NodeFileSystem } from 'langium/node';
import { createSafeDsServicesWithBuiltins } from '../../../src/language/index.js';
import { isSdsCall, isSdsCallable, isSdsExpression, isSdsParameter } from '../../../src/language/generated/ast.js';
import { getNodeOfType } from '../../helpers/nodeFinder.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const purityComputer = services.purity.PurityComputer;

describe('SafeDsPurityComputer', async () => {
    describe('isPureCallable', () => {
        it.each([
            {
                testName: 'pure function',
                code: `
                    package test

                    @Pure
                    fun f()
                `,
                expected: true,
            },
            {
                testName: 'impure function with reasons',
                code: `
                    package test

                    @Impure([])
                    fun f()
                `,
                expected: true,
            },
            {
                testName: 'impure function with reasons',
                code: `
                    package test

                    @Impure([ImpurityReason.Other])
                    fun f()
                `,
                expected: false,
            },
            {
                testName: 'endless recursion',
                code: `
                    package test

                    segment a() {
                        a();
                    }
                `,
                expected: false,
            },
            {
                testName: 'unknown callable',
                code: `
                    package test

                    segment a() {
                        unresolved();
                    }
                `,
                expected: false,
            },
            {
                testName: 'potentially impure parameter call',
                code: `
                    package test

                    segment mySegment(param: () -> ()) {
                        param();
                    }
                `,
                expected: false,
            },
            {
                testName: 'pure parameter call',
                code: `
                    package test

                    class MyClass(param: () -> (result: Int), value: Int = param())
                `,
                expected: true,
            },
        ])('should return whether a callable is pure ($testName)', async ({ code, expected }) => {
            const callable = await getNodeOfType(services, code, isSdsCallable);
            expect(purityComputer.isPureCallable(callable)).toBe(expected);
        });
    });

    describe('isPureExpression', () => {
        it.each([
            {
                testName: 'call of pure function',
                code: `
                    package test

                    pipeline myPipeline {
                        f();
                    }

                    @Pure
                    fun f()
                `,
                expected: true,
            },
            {
                testName: 'call of impure function without reasons',
                code: `
                    package test

                    pipeline myPipeline {
                        f();
                    }

                    @Impure([])
                    fun f()
                `,
                expected: true,
            },
            {
                testName: 'call of impure function with reasons',
                code: `
                    package test

                    pipeline myPipeline {
                        f();
                    }

                    @Impure([ImpurityReason.Other])
                    fun f()
                `,
                expected: false,
            },
            {
                testName: 'lambda',
                code: `
                    package test

                    pipeline myPipeline {
                        () -> f();
                    }

                    @Impure([ImpurityReason.Other])
                    fun f()
                `,
                expected: true,
            },
            {
                testName: 'endless recursion',
                code: `
                    package test

                    segment a() {
                        a();
                    }
                `,
                expected: false,
            },
            {
                testName: 'unknown callable',
                code: `
                    package test

                    segment a() {
                        unresolved();
                    }
                `,
                expected: false,
            },
            {
                testName: 'potentially impure parameter call',
                code: `
                    package test

                    segment mySegment(param: () -> ()) {
                        param();
                    }
                `,
                expected: false,
            },
            {
                testName: 'pure parameter call',
                code: `
                    package test

                    class MyClass(param: () -> (result: Int), value: Int = param())
                `,
                expected: true,
            },
        ])('should return whether an expression is pure ($testName)', async ({ code, expected }) => {
            const expression = await getNodeOfType(services, code, isSdsExpression);
            expect(purityComputer.isPureExpression(expression)).toBe(expected);
        });
    });

    describe('isPureExpression', () => {
        it.each([
            {
                testName: 'annotation parameter',
                code: `
                    package test

                    annotation MyAnnotation(f: () -> ())
                `,
                expected: true,
            },
            {
                testName: 'class parameter',
                code: `
                    package test

                    class MyClass(f: () -> ())
                `,
                expected: true,
            },
            {
                testName: 'enum variant parameter',
                code: `
                    package test

                    enum MyEnum {
                        MyEnumVariant(f: () -> ())
                    }
                `,
                expected: true,
            },
            {
                testName: 'pure function parameter',
                code: `
                    package test

                    @Pure
                    fun myFunction(f: () -> ())
                `,
                expected: true,
            },
            {
                testName: 'impure function parameter',
                code: `
                    package test

                    @Impure([ImpurityReason.PotentiallyImpureParameterCall("f")])
                    fun myFunction(f: () -> ())
                `,
                expected: false,
            },
            {
                testName: 'callable type parameter',
                code: `
                    package test

                    segment mySegment() -> (result: (f: () -> ()) -> ())
                `,
                expected: false,
            },
            {
                testName: 'segment parameter',
                code: `
                    package test

                    segment mySegment(f: () -> ())
                `,
                expected: false,
            },
            {
                testName: 'block lambda parameter',
                code: `
                    package test

                    pipeline myPipeline {
                        (f: () -> ()) {};
                    }
                `,
                expected: false,
            },
            {
                testName: 'expression lambda parameter',
                code: `
                    package test

                    pipeline myPipeline {
                        (f: () -> ()) -> 1;
                    }
                `,
                expected: false,
            },
        ])('should return whether a parameter is pure ($testName)', async ({ code, expected }) => {
            const parameter = await getNodeOfType(services, code, isSdsParameter);
            expect(purityComputer.isPureParameter(parameter)).toBe(expected);
        });
    });

    describe('callableHasSideEffects', () => {
        it.each([
            {
                testName: 'pure function',
                code: `
                    package test

                    @Pure
                    fun f()
                `,
                expected: false,
            },
            {
                testName: 'impure function without reasons',
                code: `
                    package test

                    @Impure([])
                    fun f()
                `,
                expected: false,
            },
            {
                testName: 'impure function with reasons but no side effects',
                code: `
                    package test

                    @Impure([ImpurityReason.FileReadFromConstantPath("file.txt")])
                    fun f()
                `,
                expected: false,
            },
            {
                testName: 'impure function with reasons and side effects',
                code: `
                    package test

                    @Impure([ImpurityReason.Other])
                    fun f()
                `,
                expected: true,
            },
            {
                testName: 'endless recursion',
                code: `
                    package test

                    segment a() {
                        a();
                    }
                `,
                expected: true,
            },
            {
                testName: 'unknown callable',
                code: `
                    package test

                    segment a() {
                        unresolved();
                    }
                `,
                expected: true,
            },
            {
                testName: 'potentially impure parameter call',
                code: `
                    package test

                    segment mySegment(param: () -> ()) {
                        param();
                    }
                `,
                expected: true,
            },
            {
                testName: 'pure parameter call',
                code: `
                    package test

                    class MyClass(param: () -> (result: Int), value: Int = param())
                `,
                expected: false,
            },
        ])('should return whether a callable has side effects ($testName)', async ({ code, expected }) => {
            const callable = await getNodeOfType(services, code, isSdsCallable);
            expect(purityComputer.callableHasSideEffects(callable)).toBe(expected);
        });
    });

    describe('expressionHasSideEffects', () => {
        it.each([
            {
                testName: 'call of pure function',
                code: `
                    package test

                    pipeline myPipeline {
                        f();
                    }

                    @Pure
                    fun f()
                `,
                expected: false,
            },
            {
                testName: 'call of impure function without reasons',
                code: `
                    package test

                    pipeline myPipeline {
                        f();
                    }

                    @Impure([])
                    fun f()
                `,
                expected: false,
            },
            {
                testName: 'call of impure function with reasons but no side effects',
                code: `
                    package test

                    pipeline myPipeline {
                        f();
                    }

                    @Impure([ImpurityReason.FileReadFromConstantPath("file.txt")])
                    fun f()
                `,
                expected: false,
            },
            {
                testName: 'call of impure function with reasons and side effects',
                code: `
                    package test

                    pipeline myPipeline {
                        f();
                    }

                    @Impure([ImpurityReason.Other])
                    fun f()
                `,
                expected: true,
            },
            {
                testName: 'lambda',
                code: `
                    package test

                    pipeline myPipeline {
                        () -> f();
                    }

                    @Impure([ImpurityReason.Other])
                    fun f()
                `,
                expected: false,
            },
            {
                testName: 'endless recursion',
                code: `
                    package test

                    segment a() {
                        a();
                    }
                `,
                expected: true,
            },
            {
                testName: 'unknown callable',
                code: `
                    package test

                    segment a() {
                        unresolved();
                    }
                `,
                expected: true,
            },
            {
                testName: 'potentially impure parameter call',
                code: `
                    package test

                    segment mySegment(param: () -> ()) {
                        param();
                    }
                `,
                expected: true,
            },
            {
                testName: 'pure parameter call',
                code: `
                    package test

                    class MyClass(param: () -> (result: Int), value: Int = param())
                `,
                expected: false,
            },
        ])('should return whether an expression has side effects ($testName)', async ({ code, expected }) => {
            const expression = await getNodeOfType(services, code, isSdsExpression);
            expect(purityComputer.expressionHasSideEffects(expression)).toBe(expected);
        });
    });

    describe('getImpurityReasonsForCallable', () => {
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
            {
                testName: 'endless recursion',
                code: `
                    package test

                    segment a() {
                        a();
                    }
                `,
                expected: ['Endless recursion'],
            },
            {
                testName: 'unknown callable',
                code: `
                    package test

                    segment a() {
                        unresolved();
                    }
                `,
                expected: ['Unknown callable call'],
            },
            {
                testName: 'potentially impure parameter call',
                code: `
                    package test

                    segment mySegment(param: () -> ()) {
                        param();
                    }
                `,
                expected: ['Potentially impure call of test.mySegment.param'],
            },
            {
                testName: 'pure parameter call',
                code: `
                    package test

                    class MyClass(param: () -> (result: Int), value: Int = param())
                `,
                expected: [],
            },
        ])('should return the impurity reasons of a callable ($testName)', async ({ code, expected }) => {
            const callable = await getNodeOfType(services, code, isSdsCallable);
            const actual = purityComputer.getImpurityReasonsForCallable(callable).map((reason) => reason.toString());
            expect(actual).toStrictEqual(expected);
        });
    });

    describe('getImpurityReasonsForExpression', () => {
        it.each([
            {
                testName: 'call of pure function',
                code: `
                    package test

                    pipeline myPipeline {
                        f();
                    }

                    @Pure
                    fun f()
                `,
                expected: [],
            },
            {
                testName: 'call of impure function without reasons',
                code: `
                    package test

                    pipeline myPipeline {
                        f();
                    }

                    @Impure([])
                    fun f()
                `,
                expected: [],
            },
            {
                testName: 'call of impure function with reasons but no side effects',
                code: `
                    package test

                    pipeline myPipeline {
                        f();
                    }

                    @Impure([ImpurityReason.FileReadFromConstantPath("file.txt")])
                    fun f()
                `,
                expected: ['File read from "file.txt"'],
            },
            {
                testName: 'call of impure function with reasons and side effects',
                code: `
                    package test

                    pipeline myPipeline {
                        f();
                    }

                    @Impure([ImpurityReason.Other])
                    fun f()
                `,
                expected: ['Other'],
            },
            {
                testName: 'lambda',
                code: `
                    package test

                    pipeline myPipeline {
                        () -> f();
                    }

                    @Impure([ImpurityReason.Other])
                    fun f()
                `,
                expected: [],
            },
            {
                testName: 'endless recursion',
                code: `
                    package test

                    segment a() {
                        a();
                    }
                `,
                expected: ['Endless recursion'],
            },
            {
                testName: 'unknown callable',
                code: `
                    package test

                    segment a() {
                        unresolved();
                    }
                `,
                expected: ['Unknown callable call'],
            },
            {
                testName: 'potentially impure parameter call',
                code: `
                    package test

                    segment mySegment(param: () -> ()) {
                        param();
                    }
                `,
                expected: ['Potentially impure call of test.mySegment.param'],
            },
            {
                testName: 'pure parameter call',
                code: `
                    package test

                    class MyClass(param: () -> (result: Int), value: Int = param())
                `,
                expected: [],
            },
        ])('should return the impurity reasons of an expression ($testName)', async ({ code, expected }) => {
            const expression = await getNodeOfType(services, code, isSdsExpression);
            const actual = purityComputer
                .getImpurityReasonsForExpression(expression)
                .map((reason) => reason.toString());
            expect(actual).toStrictEqual(expected);
        });

        /*
         * This code caused a stack overflow error in a prior implementation of the purity computer:
         * 1. "f()" calls the parameter "f".
         * 2. For called parameters, we check whether they must be pure. Otherwise, we add an impurity reason.
         * 3. This requires the computation of the impurity reasons of the containing callable "myFunction".
         * 4. This requires visiting all calls inside "myFunction".
         * 5. This includes the call of "f()".
         * 6. We compute the impurity reasons of "f()" and are back at the start.
         */
        it('should return the impurity reasons of a parameter call in a function', async () => {
            const call = await getNodeOfType(
                services,
                `
                package test

                @Pure fun default() -> result: Any

                @Pure fun myFunction(
                    f: () -> (result: Any) = default,
                    g: Any = f()
                )
            `,
                isSdsCall,
            );

            expect(() => purityComputer.getImpurityReasonsForExpression(call)).not.toThrow();
        });
    });
});
