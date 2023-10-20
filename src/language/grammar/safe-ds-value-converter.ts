import { convertBigint, CstNode, DefaultValueConverter, GrammarAST, ValueType } from 'langium';

export class SafeDsValueConverter extends DefaultValueConverter {
    protected override runConverter(rule: GrammarAST.AbstractRule, input: string, cstNode: CstNode): ValueType {
        switch (rule.name.toUpperCase()) {
            case 'ID':
                return input.replaceAll('`', '');
            case 'INT':
                return convertBigint(input);
            case 'STRING':
                return convertString(input, 1, 1);
            case 'TEMPLATE_STRING_START':
                return convertString(input, 1, 2);
            case 'TEMPLATE_STRING_INNER':
                return convertString(input, 2, 2);
            case 'TEMPLATE_STRING_END':
                return convertString(input, 2, 1);
            default:
                return super.runConverter(rule, input, cstNode);
        }
    }
}

const convertString = (input: string, openingDelimiterLength: number, closingDelimiterLength: number): string => {
    let result = '';
    const endIndex = input.length - 1 - closingDelimiterLength;

    for (let i = openingDelimiterLength; i <= endIndex; i++) {
        const current = input.charAt(i);
        if (current === '\\') {
            const next = input.charAt(++i);
            if (next === 'u') {
                const codeEndIndex = Math.min(i + 5, endIndex + 1);
                const code = input.substring(i + 1, codeEndIndex);

                if (code.match(/[\da-fA-F]{4}/gu)) {
                    result += String.fromCharCode(parseInt(code, 16));
                } else {
                    result += 'u' + code;
                }

                i = codeEndIndex;
            } else {
                result += convertEscapeCharacter(next);
            }
        } else {
            result += current;
        }
    }

    return result;
};

const convertEscapeCharacter = (char: string): string => {
    switch (char) {
        case 'b':
            return '\b';
        case 'f':
            return '\f';
        case 'n':
            return '\n';
        case 'r':
            return '\r';
        case 't':
            return '\t';
        case 'v':
            return '\v';
        case '0':
            return '\0';
        default:
            return char;
    }
};
