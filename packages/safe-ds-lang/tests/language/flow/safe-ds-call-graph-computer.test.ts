import { describe, expect, it } from 'vitest';
import { CallGraph } from '../../../src/language/flow/model.js';
import { EmptyFileSystem, isNamed } from 'langium';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import { isSdsCall } from '../../../src/language/generated/ast.js';
import { createSafeDsServices } from '../../../src/language/index.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const callGraphComputer = services.flow.CallGraphComputer;

describe('SafeDsCallGraphComputer', () => {
    describe('isRecursive', () => {});

    const getCallGraphTests: GetCallGraphTest[] = [
        {
            testName: 'unresolved callable',
            code: `
                pipeline myPipeline {
                    unresolved();
                }
            `,
            expectedCallables: ['undefined'],
        },
        {
            testName: 'annotation call',
            code: `
                pipeline myPipeline {
                    MyAnnotation();
                }

                annotation MyAnnotation()
            `,
            expectedCallables: ['undefined'],
        },
        {
            testName: 'class call',
            code: `
                pipeline myPipeline {
                    MyClass();
                }

                class MyClass()
            `,
            expectedCallables: ['MyClass'],
        },
        {
            testName: 'class call, passed callable',
            code: `
                pipeline myPipeline {
                    MyClass(passed, passed, passed);
                }

                class default()
                class passed()

                class MyClass(
                    f1: () -> () = default(),
                    f2: () -> () = default()
                )
            `,
            expectedCallables: ['MyClass', 'passed', 'passed'],
        },
        {
            testName: 'class call, passed non-callable',
            code: `
                pipeline myPipeline {
                    MyClass(1);
                }

                class default()
                class passed()

                class MyClass(
                    f: () -> () = default()
                )
            `,
            expectedCallables: ['MyClass'],
        },
        {
            testName: 'class call, default callable',
            code: `
                pipeline myPipeline {
                    MyClass();
                }

                class default()
                class passed()

                class MyClass(
                    f: () -> () = default()
                )
            `,
            expectedCallables: ['MyClass', 'default'],
        },
        {
            testName: 'enum variant call',
            code: `
                pipeline myPipeline {
                    MyEnum.Variant();
                }

                enum MyEnum {
                    Variant()
                }
            `,
            expectedCallables: ['Variant'],
        },
        {
            testName: 'enum variant call, passed callable',
            code: `
                pipeline myPipeline {
                    MyEnum.Variant(passed, passed, passed);
                }

                fun default()
                fun passed()

                class MyClass()

                enum MyEnum {
                    Variant(
                        f1: () -> () = default(),
                        f2: () -> () = default()
                    )
                }
            `,
            expectedCallables: ['Variant', 'passed', 'passed'],
        },
        {
            testName: 'enum variant call, passed non-callable',
            code: `
                pipeline myPipeline {
                    MyEnum.Variant(1);
                }

                fun default()
                fun passed()

                class MyClass()

                enum MyEnum {
                    Variant(
                        f: () -> () = default()
                    )
                }
            `,
            expectedCallables: ['Variant'],
        },
        {
            testName: 'enum variant call, default callable',
            code: `
                pipeline myPipeline {
                    MyEnum.Variant();
                }

                fun default()
                fun passed()

                enum MyEnum {
                    Variant(
                        f: () -> () = default()
                    )
                }
            `,
            expectedCallables: ['Variant', 'default'],
        },
        {
            testName: 'function call',
            code: `
                pipeline myPipeline {
                    myFunction();
                }

                fun myFunction()
            `,
            expectedCallables: ['myFunction'],
        },
        {
            testName: 'function call, passed callable',
            code: `
                pipeline myPipeline {
                    myFunction(passed, passed, passed);
                }

                fun default()
                fun passed()

                fun myFunction(
                    f1: () -> () = default(),
                    f2: () -> () = default()
                )
            `,
            expectedCallables: ['myFunction', 'passed', 'passed'],
        },
        {
            testName: 'function call, passed non-callable',
            code: `
                pipeline myPipeline {
                    myFunction(1);
                }

                fun default()
                fun passed()

                fun myFunction(
                    f: () -> () = default()
                )
            `,
            expectedCallables: ['myFunction'],
        },
        {
            testName: 'function call, default callable',
            code: `
                pipeline myPipeline {
                    myFunction();
                }

                fun default()
                fun passed()

                fun myFunction(
                    f: () -> () = default()
                )
            `,
            expectedCallables: ['myFunction', 'default'],
        },
        {
            testName: 'block lambda call',
            code: `
                fun f()

                pipeline myPipeline {
                    val lambda = () {
                        f();
                    };

                    lambda();
                }
            `,
            callIndex: 1,
            expectedCallables: ['(){f();}', 'f'],
        },
        {
            testName: 'block lambda call, passed callable, not called',
            code: `
                fun f()

                pipeline myPipeline {
                    val lambda = (param) {};

                    lambda(f);
                }
            `,
            expectedCallables: ['(param){}'],
        },
        {
            testName: 'block lambda call, passed callable, called',
            code: `
                fun f()

                pipeline myPipeline {
                    val lambda = (param: () -> ()) {
                        param();
                    };

                    lambda(f);
                }
            `,
            callIndex: 1,
            expectedCallables: ['(param){param();}', 'f'],
        },
        // TODO: closure
        // TODO: no parameter types on lambda
        {
            testName: 'expression lambda call',
            code: `
                fun f()

                pipeline myPipeline {
                    val lambda = () -> f();

                    lambda();
                }
            `,
            callIndex: 1,
            expectedCallables: ['()->f()', 'f'],
        },
        // TODO: same as for block lambda
        {
            testName: 'segment call',
            code: `
                fun f()

                segment mySegment() {
                    f();
                }

                pipeline myPipeline {
                    mySegment();
                }
            `,
            callIndex: 1,
            expectedCallables: ['mySegment', 'f'],
        },
        // TODO: same as for block lambda - closure
    ];

    describe.each(getCallGraphTests)('getCallGraph', ({ testName, code, callIndex, expectedCallables }) => {
        it(testName, async () => {
            const call = await getNodeOfType(services, code, isSdsCall, callIndex);
            const callGraph = callGraphComputer.getCallGraph(call, new Map());
            expect(callGraphToStringArray(callGraph)).toStrictEqual(expectedCallables);
        });
    });
});

/**
 * A test case for {@link SafeDsCallGraphComputer.getCallGraph}.
 */
interface GetCallGraphTest {
    /**
     * A short description of the test case.
     */
    testName: string;

    /**
     * The code containing the call to test.
     */
    code: string;

    /**
     * The index of the call to test. If `undefined`, the first call in the code is used.
     */
    callIndex?: number;

    /**
     * The names of the callables that are expected to be called.
     */
    expectedCallables: string[];
}

const callGraphToStringArray = (graph: CallGraph): string[] => {
    return graph
        .streamCalledCallables()
        .map((callable) => {
            if (!callable) {
                return 'undefined';
            } else if (isNamed(callable)) {
                return callable.name;
            } else {
                return callable.$cstNode!.text.replaceAll(/\s*/gu, '');
            }
        })
        .toArray();
};
