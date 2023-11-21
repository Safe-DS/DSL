import { NodeFileSystem } from 'langium/node';
import { parseHelper } from 'langium/test';
import { describe, expect, it } from 'vitest';
import { type CallHierarchyItem } from 'vscode-languageserver';
import { createSafeDsServicesWithBuiltins } from '../../../src/language/index.js';
import { findTestRanges } from '../../helpers/testRanges.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;
const callHierarchyProvider = services.lsp.CallHierarchyProvider!;
const parse = parseHelper(services);

describe('SafeDsCallHierarchyProvider', async () => {
    describe('incomingCalls', () => {
        const testCases: IncomingCallTest[] = [
            {
                testName: 'unused',
                code: `class »«C`,
                expectedIncomingCalls: undefined,
            },
            {
                testName: 'single caller, single call',
                code: `
                    class »«C()
                    class D()

                    pipeline myPipeline {
                        C();
                        D();
                    }
                `,
                expectedIncomingCalls: [
                    {
                        fromName: 'myPipeline',
                        fromRangesLength: 1,
                    },
                ],
            },
            {
                testName: 'single caller, multiple calls',
                code: `
                    class »«C()
                    class D()

                    pipeline myPipeline {
                        C();
                        () -> C();
                        () { C() };
                        D();
                    }
                `,
                expectedIncomingCalls: [
                    {
                        fromName: 'myPipeline',
                        fromRangesLength: 3,
                    },
                ],
            },
            {
                testName: 'multiple callers',
                code: `
                    class »«C()
                    class D()

                    pipeline myPipeline {
                        C();
                        C();
                        D();
                    }

                   segment mySegment(myParam: C = C()) {
                       C();
                       C();
                       D();
                   }
                `,
                expectedIncomingCalls: [
                    {
                        fromName: 'myPipeline',
                        fromRangesLength: 2,
                    },
                    {
                        fromName: 'mySegment',
                        fromRangesLength: 3,
                    },
                ],
            },
            {
                testName: 'only referenced',
                code: `
                    class »«C()

                    pipeline p {
                        C;
                    }
                `,
                expectedIncomingCalls: undefined,
            },
        ];

        it.each(testCases)('should list all incoming calls ($testName)', async ({ code, expectedIncomingCalls }) => {
            const result = await getActualSimpleIncomingCalls(code);
            expect(result).toStrictEqual(expectedIncomingCalls);
        });
    });

    describe('outgoingCalls', () => {
        const testCases: OutgoingCallTest[] = [
            {
                testName: 'no calls',
                code: `pipeline »«p {}`,
                expectedOutgoingCalls: undefined,
            },
            {
                testName: 'single callee, single call',
                code: `
                    fun f()

                    pipeline »«p {
                        f();
                    }
                `,
                expectedOutgoingCalls: [
                    {
                        toName: 'f',
                        fromRangesLength: 1,
                    },
                ],
            },
            {
                testName: 'single callee, multiple calls',
                code: `
                    fun f()

                    pipeline »«p {
                        f();
                        () -> f();
                        () { f() };
                    }
                `,
                expectedOutgoingCalls: [
                    {
                        toName: 'f',
                        fromRangesLength: 3,
                    },
                ],
            },
            {
                testName: 'multiple callees',
                code: `
                    fun f()
                    fun g()

                    pipeline »«p {
                        f();
                        f();
                        g();
                    }
                `,
                expectedOutgoingCalls: [
                    {
                        toName: 'f',
                        fromRangesLength: 2,
                    },
                    {
                        toName: 'g',
                        fromRangesLength: 1,
                    },
                ],
            },
            {
                testName: 'only references',
                code: `
                    fun f()

                    pipeline »«p {
                        f;
                    }
                `,
                expectedOutgoingCalls: undefined,
            },
        ];

        it.each(testCases)('should list all outgoing calls ($testName)', async ({ code, expectedOutgoingCalls }) => {
            const result = await getActualSimpleOutgoingCalls(code);
            expect(result).toStrictEqual(expectedOutgoingCalls);
        });
    });
});

const getActualSimpleIncomingCalls = async (code: string): Promise<SimpleIncomingCall[] | undefined> => {
    return callHierarchyProvider
        .incomingCalls({
            item: await getUniqueCallHierarchyItem(code),
        })
        ?.map((call) => ({
            fromName: call.from.name,
            fromRangesLength: call.fromRanges.length,
        }));
};

const getActualSimpleOutgoingCalls = async (code: string): Promise<SimpleOutgoingCall[] | undefined> => {
    return callHierarchyProvider
        .outgoingCalls({
            item: await getUniqueCallHierarchyItem(code),
        })
        ?.map((call) => ({
            toName: call.to.name,
            fromRangesLength: call.fromRanges.length,
        }));
};

const getUniqueCallHierarchyItem = async (code: string): Promise<CallHierarchyItem> => {
    const document = await parse(code);

    const testRangesResult = findTestRanges(code, document.uri);
    if (testRangesResult.isErr) {
        throw new Error(testRangesResult.error.message);
    } else if (testRangesResult.value.length !== 1) {
        throw new Error(`Expected exactly one test range, but got ${testRangesResult.value.length}.`);
    }
    const testRangeStart = testRangesResult.value[0]!.start;

    const items =
        callHierarchyProvider.prepareCallHierarchy(document, {
            textDocument: {
                uri: document.textDocument.uri,
            },
            position: {
                line: testRangeStart.line,
                // Since the test range cannot be placed inside the identifier, we place it in front of the identifier.
                // Then we need to move the cursor one character to the right to be inside the identifier.
                character: testRangeStart.character + 1,
            },
        }) ?? [];

    if (items.length !== 1) {
        throw new Error(`Expected exactly one call hierarchy item, but got ${items.length}.`);
    }

    return items[0]!;
};

/**
 * A test case for {@link SafeDsCallHierarchyProvider.incomingCalls}.
 */
interface IncomingCallTest {
    /**
     * A short description of the test case.
     */
    testName: string;

    /**
     * The code to parse.
     */
    code: string;

    /**
     * The expected incoming calls.
     */
    expectedIncomingCalls: SimpleIncomingCall[] | undefined;
}

/**
 * A simplified variant of {@link CallHierarchyIncomingCall}.
 */
interface SimpleIncomingCall {
    /**
     * The name of the caller.
     */
    fromName: string;

    /**
     * The number of calls in the caller.
     */
    fromRangesLength: number;
}

/**
 * A test case for {@link SafeDsCallHierarchyProvider.outgoingCalls}.
 */
interface OutgoingCallTest {
    /**
     * A short description of the test case.
     */
    testName: string;

    /**
     * The code to parse.
     */
    code: string;

    /**
     * The expected outgoing calls.
     */
    expectedOutgoingCalls: SimpleOutgoingCall[] | undefined;
}

/**
 * A simplified variant of {@link CallHierarchyOutgoingCall}.
 */
interface SimpleOutgoingCall {
    /**
     * The name of the callee.
     */
    toName: string;

    /**
     * The number of calls in the callee.
     */
    fromRangesLength: number;
}
