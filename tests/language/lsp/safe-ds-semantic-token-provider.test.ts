import { afterEach, describe, it } from 'vitest';
import { clearDocuments, expectSemanticToken, highlightHelper } from 'langium/test';
import { EmptyFileSystem } from 'langium';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { SemanticTokenTypes } from 'vscode-languageserver-types';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;

describe('SafeDsSemanticTokenProvider', async () => {
    afterEach(async () => {
        await clearDocuments(services);
    });

    it.each([
        {
            testName: 'annotation',
            code: 'annotation <|A|>',
            expectedTokenTypes: [SemanticTokenTypes.decorator],
        },
        {
            testName: 'attribute',
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
    ])('should assign the correct token types ($testName)', async ({ code, expectedTokenTypes }) => {
        await checkSemanticTokens(code, expectedTokenTypes);
    });
});

const checkSemanticTokens = async (code: string, expectedTokenTypes: SemanticTokenTypes[]) => {
    const result = await highlightHelper(services)(code);
    expectedTokenTypes.forEach((expectedTokenType, index) => {
        expectSemanticToken(result, {
            rangeIndex: index,
            tokenType: expectedTokenType,
        });
    });
};
