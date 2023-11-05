import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearDocuments, parseHelper } from 'langium/test';
import { createSafeDsServices } from '../../../src/language/index.js';
import { InlayHint, Position } from 'vscode-languageserver';
import { NodeFileSystem } from 'langium/node';
import { findTestChecks } from '../../helpers/testChecks.js';
import { URI } from 'langium';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
const inlayHintProvider = services.lsp.InlayHintProvider!;
const workspaceManager = services.shared.workspace.WorkspaceManager;
const parse = parseHelper(services);

describe('SafeDsInlayHintProvider', async () => {
    beforeEach(async () => {
        // Load the builtin library
        await workspaceManager.initializeWorkspace([]);
    });

    afterEach(async () => {
        await clearDocuments(services);
    });

    const testCases: InlayHintProviderTest[] = [
        {
            testName: 'resolved positional argument',
            code: `
                fun f(p: Int)

                pipeline myPipeline {
                    // $TEST$ before "p = "
                    f(»«1);
                }
            `,
        },
        {
            testName: 'unresolved positional argument',
            code: `
                fun f()

                pipeline myPipeline {
                    f(1);
                }
            `,
        },
        {
            testName: 'named argument',
            code: `
                fun f(p: Int)

                pipeline myPipeline {
                    f(p = 1);
                }
            `,
        },
        {
            testName: 'block lambda result',
            code: `
                pipeline myPipeline {
                    () {
                        // $TEST$ after ": literal<1>"
                        yield r»« = 1;
                    };
                }
            `,
        },
        {
            testName: 'placeholder',
            code: `
                pipeline myPipeline {
                    // $TEST$ after ": literal<1>"
                    val x»« = 1;
                }
            `,
        },
        {
            testName: 'wildcard',
            code: `
                pipeline myPipeline {
                    _ = 1;
                }
            `,
        },
        {
            testName: 'yield',
            code: `
                segment s() -> r: Int {
                    // $TEST$ after ": literal<1>"
                    yield r»« = 1;
                }
            `,
        },
    ];
    it.each(testCases)('should assign the correct inlay hints ($testName)', async ({ code }) => {
        const actualInlayHints = await getActualSimpleInlayHints(code);
        const expectedInlayHints = getExpectedSimpleInlayHints(code);

        expect(actualInlayHints).toStrictEqual(expectedInlayHints);
    });

    it('should set the documentation of parameters as tooltip', async () => {
        const code = `
            /**
             * @param p Lorem ipsum.
             */
            fun f(p: Int)

            pipeline myPipeline {
                f(1);
            }
        `;
        const actualInlayHints = await getActualInlayHints(code);
        const firstInlayHint = actualInlayHints?.[0];

        expect(firstInlayHint?.tooltip).toStrictEqual({ kind: 'markdown', value: 'Lorem ipsum.' });
    });

    it.each([
        {
            testName: 'class',
            code: `
                /**
                 * Lorem ipsum.
                 */
                class C()

                pipeline myPipeline {
                    val a = C();
                }
            `,
        },
        {
            testName: 'enum',
            code: `
                /**
                 * Lorem ipsum.
                 */
                enum E

                fun f() -> e: E

                pipeline myPipeline {
                    val a = f();
                }
            `,
        },
        {
            testName: 'enum variant',
            code: `
                enum E {
                    /**
                     * Lorem ipsum.
                     */
                    V
                }

                pipeline myPipeline {
                    val a = E.V;
                }
            `,
        },
    ])('should set the documentation of named types as tooltip', async ({ code }) => {
        const actualInlayHints = await getActualInlayHints(code);
        const firstInlayHint = actualInlayHints?.[0];

        expect(firstInlayHint?.tooltip).toStrictEqual({ kind: 'markdown', value: 'Lorem ipsum.' });
    });
});

const getActualInlayHints = async (code: string): Promise<InlayHint[] | undefined> => {
    const document = await parse(code);
    return inlayHintProvider.getInlayHints(document, {
        range: document.parseResult.value.$cstNode!.range,
        textDocument: { uri: document.textDocument.uri },
    });
};

const getActualSimpleInlayHints = async (code: string): Promise<SimpleInlayHint[] | undefined> => {
    const document = await parse(code);
    const inlayHints = await inlayHintProvider.getInlayHints(document, {
        range: document.parseResult.value.$cstNode!.range,
        textDocument: { uri: document.textDocument.uri },
    });

    return inlayHints?.map((hint) => {
        if (typeof hint.label === 'string') {
            return {
                label: hint.label,
                position: hint.position,
            };
        } else {
            return {
                label: hint.label.join(''),
                position: hint.position,
            };
        }
    });
};

const getExpectedSimpleInlayHints = (code: string): SimpleInlayHint[] => {
    const testChecks = findTestChecks(code, URI.file('file:///test.sdstest'), { failIfFewerRangesThanComments: true });
    if (testChecks.isErr) {
        throw new Error(testChecks.error.message);
    }

    return testChecks.value.map((check) => {
        const range = check.location!.range;

        const afterMatch = /after "(?<label>[^"]*)"/gu.exec(check.comment);
        if (afterMatch) {
            return {
                label: afterMatch.groups!.label!,
                position: {
                    line: range.start.line,
                    character: range.start.character - 1,
                },
            };
        }

        const beforeMatch = /before "(?<label>[^"]*)"/gu.exec(check.comment);
        if (beforeMatch) {
            return {
                label: beforeMatch.groups!.label!,
                position: {
                    line: range.end.line,
                    character: range.end.character + 1,
                },
            };
        }

        throw new Error('Incorrect test comment format');
    });
};

/**
 * A description of a test case for the inlay hint provider.
 */
interface InlayHintProviderTest {
    /**
     * A short description of the test case.
     */
    testName: string;

    /**
     * The code to parse.
     */
    code: string;
}

/**
 * A simple inlay hint with some information removed.
 */
interface SimpleInlayHint {
    /**
     * The text of the inlay hint.
     */
    label: string;

    /**
     * The position of the inlay hint.
     */
    position: Position;
}
