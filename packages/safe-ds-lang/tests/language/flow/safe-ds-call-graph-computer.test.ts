import { describe, expect, it } from 'vitest';
import { CallGraph } from '../../../src/language/flow/model.js';
import { EmptyFileSystem, isNamed } from 'langium';
import { getNodeOfType } from '../../helpers/nodeFinder.js';
import { isSdsCall } from '../../../src/language/generated/ast.js';
import { createSafeDsServices } from '../../../src/language/index.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const callGraphComputer = services.flow.CallGraphComputer;
// TODO: data driven tests
describe('SafeDsCallGraphComputer', () => {
    describe('isRecursive', () => {});

    const getCallGraphTests: GetCallGraphTest[] = [
        // TODO: can we allow the callable in callable types to be the parameter?
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
