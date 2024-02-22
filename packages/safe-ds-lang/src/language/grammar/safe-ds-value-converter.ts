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
        if (current === '\\' && i < endIndex) {
            const [stringToAdd, newIndex] = handleEscapeSequence(input, i + 1, endIndex);
            result += stringToAdd;
            i = newIndex - 1; // -1 because the loop will increment it
        } else {
            result += current;
        }
    }

    return result;
};

/**
 * Handle an escape sequence.
 *
 * @param input The entire input string.
 * @param index The index of the escape sequence (after the slash).
 * @param endIndex The index of the last character of the input string, excluding delimiters.
 * @returns An array containing the string to add to the result and the new index.
 */
const handleEscapeSequence = (input: string, index: number, endIndex: number): [string, number] => {
    const current = input.charAt(index);
    switch (current) {
        case 'b':
            return ['\b', index + 1];
        case 'f':
            return ['\f', index + 1];
        case 'n':
            return ['\n', index + 1];
        case 'r':
            return ['\r', index + 1];
        case 't':
            return ['\t', index + 1];
        case 'v':
            return ['\v', index + 1];
        case '0':
            return ['\0', index + 1];
    }

    if (current === 'u' && index + 4 <= endIndex) {
        const code = input.substring(index + 1, index + 5);
        if (code.match(/[0-9a-fA-F]{4}/gu)) {
            return [String.fromCharCode(parseInt(code, 16)), index + 5];
        }
    }

    return [current, index + 1];
};

const replacements = new Map([
    ['\b', '\\b'],
    ['\f', '\\f'],
    ['\n', '\\n'],
    ['\r', '\\r'],
    ['\t', '\\t'],
    ['\v', '\\v'],
    ['\0', '\\0'],
    ['"', '\\"'],
    ['{', '\\{'],
    ['\\', '\\\\'],
]);

/**
 * Escape a string.
 */
export const escapeString = (input: string): string => {
    let result = '';

    for (let i = 0; i < input.length; i++) {
        const current = input.charAt(i);
        const replacement = replacements.get(current);
        result += replacement ? replacement : current;
    }

    return result;
};
