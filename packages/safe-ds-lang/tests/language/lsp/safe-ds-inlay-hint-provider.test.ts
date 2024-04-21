import { describe, expect, it } from 'vitest';
import { parseHelper } from 'langium/test';
import { InlayHint, Position } from 'vscode-languageserver';
import { NodeFileSystem } from 'langium/node';
import { findTestChecks } from '../../helpers/testChecks.js';
import { DeepPartial, URI } from 'langium';
import { createSafeDsServices, SafeDsLanguageMetaData } from '../../../src/language/index.js';
import { SafeDsInlayHintsSettings } from '../../../src/language/workspace/safe-ds-settings-provider.js';
import { expandToString } from 'langium/generate';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const configurationProvider = services.shared.workspace.ConfigurationProvider!;
const inlayHintProvider = services.lsp.InlayHintProvider!;
const parse = parseHelper(services);

describe('SafeDsInlayHintProvider', async () => {
    describe('assignee types', () => {
        const testCases: InlayHintProviderTest[] = [
            {
                testName: 'block lambda result',
                code: `
                    pipeline myPipeline {
                        () {
                            // $TEST$ after ": literal<…>"
                            yield r»« = 1;
                        };
                    }
                `,
            },
            {
                testName: 'placeholder',
                code: `
                    class MyClass<T>

                    segment mySegment(p: MyClass<Int>) {
                        // $TEST$ after ": MyClass<…>"
                        val x»« = p;
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
                        // $TEST$ after ": literal<…>"
                        yield r»« = 1;
                    }
                `,
            },
            {
                testName: 'disabled inlay hints',
                code: `
                    pipeline myPipeline {
                        val x = 1;
                    }
                `,
                settings: {
                    assigneeTypes: { enabled: false },
                },
            },
            {
                testName: 'expand class types',
                code: `
                    class MyClass<T>

                    segment mySegment(p: MyClass<Int>) {
                        // $TEST$ after ": MyClass<Int>"
                        val x»« = p;
                    }
                `,
                settings: {
                    collapseClassTypes: false,
                },
            },
            {
                testName: 'expand literal types',
                code: `
                    pipeline myPipeline {
                        // $TEST$ after ": literal<1>"
                        val x»« = 1;
                    }
                `,
                settings: {
                    collapseLiteralTypes: false,
                },
            },
        ];
        it.each(testCases)('should assign the correct inlay hints ($testName)', async ({ code, settings }) => {
            updateSettings(settings);

            const actualInlayHints = await getActualSimpleInlayHints(code);
            const expectedInlayHints = getExpectedSimpleInlayHints(code);
            expect(actualInlayHints).toStrictEqual(expectedInlayHints);

            resetSettings();
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
                expectedTooltip: 'Lorem ipsum.',
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
                expectedTooltip: 'Lorem ipsum.',
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
                expectedTooltip: 'Lorem ipsum.',
            },
            {
                testName: 'collapsed class type',
                code: `
                    /**
                     * Lorem ipsum.
                     */
                    class C<T>(p: T)

                    pipeline myPipeline {
                        val a = C(1);
                    }
                `,
                expectedTooltip: expandToString`
                    \`\`\`safe-ds-dev
                    C<literal<1>>
                    \`\`\`
                    Lorem ipsum.
                `,
            },
            {
                testName: 'collapsed literal type',
                code: `
                    pipeline myPipeline {
                        val a = 1;
                    }
                `,
                expectedTooltip: expandToString`
                    \`\`\`safe-ds-dev
                    literal<1>
                    \`\`\`
                `,
            },
        ])('should set the tooltip ($testName)', async ({ code, expectedTooltip }) => {
            const actualInlayHints = await getActualInlayHints(code);
            const firstInlayHint = actualInlayHints?.[0];

            expect(firstInlayHint?.tooltip).toStrictEqual({ kind: 'markdown', value: expectedTooltip });
        });
    });

    describe('lambda parameter types', () => {
        const testCases: InlayHintProviderTest[] = [
            {
                testName: 'standalone block lambda without manifest types',
                code: `
                    pipeline myPipeline {
                        (p) {};
                    }
                `,
            },
            {
                testName: 'standalone block lambda with manifest types',
                code: `
                    pipeline myPipeline {
                        (p: Int) {};
                    }
                `,
            },
            {
                testName: 'standalone expression lambda without manifest types',
                code: `
                    pipeline myPipeline {
                        (p) -> 1;
                    }
                `,
            },
            {
                testName: 'standalone expression lambda with manifest types',
                code: `
                    pipeline myPipeline {
                        (p: Int) -> 1;
                    }
                `,
            },
            {
                testName: 'assigned block lambda without manifest types',
                code: `
                    fun f(callback: (p: literal<1>) -> ())

                    pipeline myPipeline {
                        // $TEST$ after ": literal<…>"
                        f(callback = (p»«) {});
                    }
                `,
            },
            {
                testName: 'assigned block lambda with manifest types',
                code: `
                    fun f(callback: (p: Int) -> ())

                    pipeline myPipeline {
                        f(callback = (p: Int) {});
                    }
                `,
            },
            {
                testName: 'assigned expression lambda without manifest types',
                code: `
                    class MyClass<T>

                    fun f(callback: (p: MyClass<Int>) -> (r: Int))

                    pipeline myPipeline {
                        // $TEST$ after ": MyClass<…>"
                        f(callback = (p»«) -> 1);
                    }
                `,
            },
            {
                testName: 'assigned expression lambda with manifest types',
                code: `
                    fun f(callback: (p: Int) -> (r: Int))

                    pipeline myPipeline {
                        f(callback = (p: Int) -> 1);
                    }
                `,
            },
            {
                testName: 'disabled inlay hints',
                code: `
                    fun f(callback: (p: Int) -> ())

                    pipeline myPipeline {
                        f(callback = (p) {});
                    }
                `,
                settings: {
                    lambdaParameterTypes: {
                        enabled: false,
                    },
                },
            },
            {
                testName: 'assigned block lambda without manifest types',
                code: `
                    fun f(callback: (p: literal<1>) -> ())

                    pipeline myPipeline {
                        // $TEST$ after ": literal<…>"
                        f(callback = (p»«) {});
                    }
                `,
            },
            {
                testName: 'expand class types',
                code: `
                    class MyClass<T>

                    fun f(callback: (p: MyClass<Int>) -> (r: Int))

                    pipeline myPipeline {
                        // $TEST$ after ": MyClass<Int>"
                        f(callback = (p»«) -> 1);
                    }
                `,
                settings: {
                    collapseClassTypes: false,
                },
            },
            {
                testName: 'expand literal types',
                code: `
                    fun f(callback: (p: literal<1>) -> ())

                    pipeline myPipeline {
                        // $TEST$ after ": literal<1>"
                        f(callback = (p»«) {});
                    }
                `,
                settings: {
                    collapseLiteralTypes: false,
                },
            },
        ];
        it.each(testCases)('should assign the correct inlay hints ($testName)', async ({ code, settings }) => {
            updateSettings(settings);

            const actualInlayHints = await getActualSimpleInlayHints(code);
            const expectedInlayHints = getExpectedSimpleInlayHints(code);
            expect(actualInlayHints).toStrictEqual(expectedInlayHints);

            resetSettings();
        });

        it.each([
            {
                testName: 'class',
                code: `
                    /**
                     * Lorem ipsum.
                     */
                    class C()

                    fun f(callback: (p: C) -> ())

                    pipeline myPipeline {
                        f(callback = (p) {});
                    }
                `,
                expectedTooltip: 'Lorem ipsum.',
            },
            {
                testName: 'enum',
                code: `
                    /**
                     * Lorem ipsum.
                     */
                    enum E

                    fun f(callback: (p: E) -> ())

                    pipeline myPipeline {
                        f(callback = (p) {});
                    }
                `,
                expectedTooltip: 'Lorem ipsum.',
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

                    fun f(callback: (p: E.V) -> ())

                    pipeline myPipeline {
                        f(callback = (p) {});
                    }
                `,
                expectedTooltip: 'Lorem ipsum.',
            },
            {
                testName: 'collapsed class type',
                code: `
                    /**
                     * Lorem ipsum.
                     */
                    class C<T>

                    fun f(callback: (p: C<Any>) -> ())

                    pipeline myPipeline {
                        f(callback = (p) {});
                    }
                `,
                expectedTooltip: expandToString`
                    \`\`\`safe-ds-dev
                    C<Any>
                    \`\`\`
                    Lorem ipsum.
                `,
            },
            {
                testName: 'collapsed literal type',
                code: `
                    fun f(callback: (p: literal<1>) -> ())

                    pipeline myPipeline {
                        f(callback = (p) {});
                    }
                `,
                expectedTooltip: expandToString`
                    \`\`\`safe-ds-dev
                    literal<1>
                    \`\`\`
                `,
            },
        ])('should set the tooltip ($testName)', async ({ code, expectedTooltip }) => {
            const actualInlayHints = await getActualInlayHints(code);
            const firstInlayHint = actualInlayHints?.[0];

            expect(firstInlayHint?.tooltip).toStrictEqual({ kind: 'markdown', value: expectedTooltip });
        });
    });

    describe('parameter names', () => {
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
                settings: {
                    parameterNames: {
                        enabled: 'all',
                    },
                },
            },
            {
                testName: 'unresolved positional argument',
                code: `
                    fun f()

                    pipeline myPipeline {
                        f(1);
                    }
                `,
                settings: {
                    parameterNames: {
                        enabled: 'all',
                    },
                },
            },
            {
                testName: 'named argument',
                code: `
                    fun f(p: Int)

                    pipeline myPipeline {
                        f(p = 1);
                    }
                `,
                settings: {
                    parameterNames: {
                        enabled: 'all',
                    },
                },
            },
            {
                testName: 'reference (all)',
                code: `
                    fun f(p: Int)

                    pipeline myPipeline {
                        // $TEST$ before "p = "
                        f(»«myPipeline);
                    }
                `,
                settings: {
                    parameterNames: {
                        enabled: 'all',
                    },
                },
            },
            {
                testName: 'reference (exceptReferences)',
                code: `
                    fun f(p: Int)

                    pipeline myPipeline {
                        f(myPipeline);
                    }
                `,
                settings: {
                    parameterNames: {
                        enabled: 'exceptReferences',
                    },
                },
            },
            {
                testName: 'other expression (exceptReferences)',
                code: `
                    fun f(p: Int)

                    pipeline myPipeline {
                        // $TEST$ before "p = "
                        f(»«1 + 2);
                    }
                `,
                settings: {
                    parameterNames: {
                        enabled: 'exceptReferences',
                    },
                },
            },
            {
                testName: 'other expression (onlyLiterals)',
                code: `
                    fun f(p: Int)

                    pipeline myPipeline {
                        f(1 + 2);
                    }
                `,
                settings: {
                    parameterNames: {
                        enabled: 'onlyLiterals',
                    },
                },
            },
            {
                testName: 'literals (onlyLiterals)',
                code: `
                    fun f(p: Int)

                    pipeline myPipeline {
                        // $TEST$ before "p = "
                        f(»«1);
                    }
                `,
                settings: {
                    parameterNames: {
                        enabled: 'onlyLiterals',
                    },
                },
            },
            {
                testName: 'literals (none)',
                code: `
                    fun f(p: Int)

                    pipeline myPipeline {
                        f(1);
                    }
                `,
                settings: {
                    parameterNames: {
                        enabled: 'none',
                    },
                },
            },
        ];
        it.each(testCases)('should assign the correct inlay hints ($testName)', async ({ code, settings }) => {
            updateSettings(settings);

            const actualInlayHints = await getActualSimpleInlayHints(code);
            const expectedInlayHints = getExpectedSimpleInlayHints(code);
            expect(actualInlayHints).toStrictEqual(expectedInlayHints);

            resetSettings();
        });

        it('should set the tooltip', async () => {
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
    const testChecks = findTestChecks(code, URI.file('file:///test.sdsdev'), { failIfFewerRangesThanComments: true });
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

const updateSettings = (settings: DeepPartial<SafeDsInlayHintsSettings> = {}) => {
    configurationProvider.updateConfiguration({
        settings: {
            [SafeDsLanguageMetaData.languageId]: {
                inlayHints: settings,
            },
        },
    });
};

const resetSettings = () => {
    configurationProvider.updateConfiguration({
        settings: {
            [SafeDsLanguageMetaData.languageId]: {},
        },
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

    /**
     * The value of the corresponding setting to control which inlay hints should be shown.
     */
    settings?: DeepPartial<SafeDsInlayHintsSettings>;
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
