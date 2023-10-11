/**
 * Based on the given count, returns the singular or plural form of the given word.
 */
export const pluralize = (count: number, singular: string, plural: string = `${singular}s`): string => {
    return count === 1 ? singular : plural;
}
