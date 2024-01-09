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
