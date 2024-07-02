/**
 * Normalizes line breaks to `\n`.
 *
 * @param text The text to normalize.
 * @return The normalized text.
 */
export const normalizeLineBreaks = (text: string | undefined): string => {
    return text?.replace(/\r\n?/gu, '\n') ?? '';
};

/**
 * Based on the given count, returns the singular or plural form of the given word.
 */
export const pluralize = (count: number, singular: string, plural: string = `${singular}s`): string => {
    return count === 1 ? singular : plural;
};

/**
 * Prepends each line of the given text with the given prefix.
 */
export const addLinePrefix = (text: string, prefix: string): string => {
    return text
        .trim()
        .split('\n')
        .map((line) => (/^\s*$/u.test(line) ? line : `${prefix}${line}`))
        .join('\n');
};

/**
 * Removes the given prefix from each line of the given text.
 */
export const removeLinePrefix = (text: string, prefix: string): string => {
    return text
        .split('\n')
        .map((line) => (line.startsWith(prefix) ? line.slice(prefix.length) : line))
        .join('\n');
};
