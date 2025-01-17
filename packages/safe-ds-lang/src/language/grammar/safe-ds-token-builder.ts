import { DefaultTokenBuilder, GrammarAST, isTokenTypeArray } from 'langium';
import { TokenType, TokenVocabulary } from 'chevrotain';

// Inspired by https://eclipse-langium.github.io/langium-previews/pr-previews/pr-132/guides/multi-mode-lexing/

// Lexer modes
const DEFAULT_MODE = 'default';
const TEMPLATE_STRING_MODE = 'template-string';

// Tokens
const BLOCK_END = '}';
const TEMPLATE_STRING_START = 'TEMPLATE_STRING_START';
const TEMPLATE_STRING_INNER = 'TEMPLATE_STRING_INNER';
const TEMPLATE_STRING_END = 'TEMPLATE_STRING_END';

export class SafeDsTokenBuilder extends DefaultTokenBuilder {
    override buildTokens(grammar: GrammarAST.Grammar, options?: { caseInsensitive?: boolean }): TokenVocabulary {
        const tokenTypes = super.buildTokens(grammar, options);

        if (isTokenTypeArray(tokenTypes)) {
            const defaultModeTokens = tokenTypes.filter(
                (token) => ![TEMPLATE_STRING_INNER, TEMPLATE_STRING_END].includes(token.name),
            );
            const templateStringModeTokens = tokenTypes.filter((token) => ![BLOCK_END].includes(token.name));

            return {
                modes: {
                    [DEFAULT_MODE]: defaultModeTokens,
                    [TEMPLATE_STRING_MODE]: templateStringModeTokens,
                },
                defaultMode: DEFAULT_MODE,
            };
        } else {
            /* c8 ignore next 2 */
            throw new Error('Invalid TokenVocabulary received from DefaultTokenBuilder.');
        }
    }

    protected override buildKeywordToken(
        keyword: GrammarAST.Keyword,
        terminalTokens: TokenType[],
        caseInsensitive: boolean,
    ): TokenType {
        let tokenType = super.buildKeywordToken(keyword, terminalTokens, caseInsensitive);

        if (tokenType.name === BLOCK_END) {
            // BLOCK_END has TEMPLATE_STRING_INNER and TEMPLATE_STRING_END as longer alternatives, which are not valid
            // in the default mode.
            delete tokenType.LONGER_ALT;
        }

        return tokenType;
    }

    protected override buildTerminalToken(terminal: GrammarAST.TerminalRule): TokenType {
        let tokenType = super.buildTerminalToken(terminal);

        // Enter/leave template string mode
        if (tokenType.name === TEMPLATE_STRING_START) {
            tokenType.PUSH_MODE = TEMPLATE_STRING_MODE;
        } else if (tokenType.name === TEMPLATE_STRING_END) {
            tokenType.POP_MODE = true;
        }

        return tokenType;
    }
}
