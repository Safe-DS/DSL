/**
 * Returns the unique element in the list, or `undefined` if none or multiple exist.
 */
export const uniqueOrUndefined = <T> (elements: T[]): T | undefined => {
    if (elements.length === 1) {
        return elements[0];
    }

    return undefined;
}
