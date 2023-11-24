import { AssertionError } from 'assert';
import { NodeFileSystem } from 'langium/node';
import { highlightHelper } from 'langium/test';
import { describe, it } from 'vitest';
import { SemanticTokenTypes } from 'vscode-languageserver';
import { createSafeDsServicesWithBuiltins } from '../../../src/language/index.js';

const services = (await createSafeDsServicesWithBuiltins(NodeFileSystem)).SafeDs;

describe('SafeDsSemanticTokenProvider', async () => {
    it.each([
        {
            testName: 'annotation call',
            code: '<|@|><|A|>',
            expectedTokenTypes: [SemanticTokenTypes.decorator],
        },
        {
            testName: 'argument',
            code: `
                fun f(p: String)

                pipeline p {
                    f(<|p|> = "foo")
                }
            `,
            expectedTokenTypes: [SemanticTokenTypes.parameter],
        },
        {
            testName: 'annotation declaration',
            code: 'annotation <|A|>',
            expectedTokenTypes: [SemanticTokenTypes.decorator],
        },
        {
            testName: 'attribute declaration',
            code: `
                class C {
                    attr <|a|>
                    static attr <|b|>
                }
            `,
            expectedTokenTypes: [SemanticTokenTypes.property, SemanticTokenTypes.property],
        },
        {
            testName: 'class declaration',
            code: 'class <|C|>',
            expectedTokenTypes: [SemanticTokenTypes.class],
        },
        {
            testName: 'enum declaration',
            code: 'enum <|E|>',
            expectedTokenTypes: [SemanticTokenTypes.enum],
        },
        {
            testName: 'enum variant declaration',
            code: 'enum E { <|V|> }',
            expectedTokenTypes: [SemanticTokenTypes.enumMember],
        },
        {
            testName: 'function declaration',
            code: `
                class C {
                    fun <|f|>()
                    static fun <|g|>()
                }

                fun <|f|>()
            `,
            expectedTokenTypes: [SemanticTokenTypes.method, SemanticTokenTypes.method, SemanticTokenTypes.function],
        },
        {
            testName: 'module',
            code: 'package <|a.b.c|>',
            expectedTokenTypes: [SemanticTokenTypes.namespace],
        },
        {
            testName: 'parameter declaration',
            code: 'fun f(<|p|>: String)',
            expectedTokenTypes: [SemanticTokenTypes.parameter],
        },
        {
            testName: 'pipeline declaration',
            code: 'pipeline <|p|> {}',
            expectedTokenTypes: [SemanticTokenTypes.function],
        },
        {
            testName: 'placeholder declaration',
            code: `
                pipeline p {
                    val <|a|> = 1;
                }
            `,
            expectedTokenTypes: [SemanticTokenTypes.variable],
        },
        {
            testName: 'result declaration',
            code: 'fun f() -> (<|r|>: String)',
            expectedTokenTypes: [SemanticTokenTypes.parameter],
        },
        {
            testName: 'schema declaration',
            code: 'schema <|S|>() {}',
            expectedTokenTypes: [SemanticTokenTypes.type],
        },
        {
            testName: 'segment declaration',
            code: 'segment <|s|>() {}',
            expectedTokenTypes: [SemanticTokenTypes.function],
        },
        {
            testName: 'type parameter declaration',
            code: 'class C<<|T|>>',
            expectedTokenTypes: [SemanticTokenTypes.typeParameter],
        },
        {
            testName: 'import',
            code: 'from <|a.b.c|> import X',
            expectedTokenTypes: [SemanticTokenTypes.namespace],
        },
        {
            testName: 'imported declaration',
            code: 'from safeds.lang import <|Any|>',
            expectedTokenTypes: [SemanticTokenTypes.class],
        },
        {
            testName: 'named type',
            code: `
                enum E {}

                fun f(p: <|E|>)
            `,
            expectedTokenTypes: [SemanticTokenTypes.enum],
        },
        {
            testName: 'reference',
            code: `
                fun f(p: String)

                pipeline p {
                    <|f|>;
                }
            `,
            expectedTokenTypes: [SemanticTokenTypes.function],
        },
        {
            testName: 'type argument',
            code: `
                class C<T>

                fun f(p: C<<|T|> = C>)
            `,
            expectedTokenTypes: [SemanticTokenTypes.typeParameter],
        },
        {
            testName: 'type parameter constraint',
            code: `
                class C<T> where {
                    <|T|> sub C
                }
            `,
            expectedTokenTypes: [SemanticTokenTypes.typeParameter],
        },
    ])('should assign the correct token types ($testName)', async ({ code, expectedTokenTypes }) => {
        await checkSemanticTokens(code, expectedTokenTypes);
    });
});

const checkSemanticTokens = async (code: string, expectedTokenTypes: SemanticTokenTypes[]) => {
    const actualTokensWithRanges = await highlightHelper(services)(code);
    expectedTokenTypes.forEach((expectedTokenType, index) => {
        const range = actualTokensWithRanges.ranges[index];
        if (!range) {
            throw new AssertionError({
                message: `No range found for token at index ${index}.`,
            });
        }

        const tokensAtRange = actualTokensWithRanges.tokens.filter(
            (token) => token.offset === range[0] && token.offset + token.text.length === range[1],
        );

        if (tokensAtRange.length !== 1) {
            throw new AssertionError({
                message: `Expected exactly one token at offset range ${range}, but found ${tokensAtRange.length}.`,
            });
        }

        const tokenAtRange = tokensAtRange[0]!;
        if (tokenAtRange.tokenType !== expectedTokenType) {
            throw new AssertionError({
                message: `Expected token at offset range ${range} to be of type ${expectedTokenType}, but was ${tokenAtRange.tokenType}.`,
                actual: tokenAtRange.tokenType,
                expected: expectedTokenType,
            });
        }
    });
};
