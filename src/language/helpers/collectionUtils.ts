/**
 * Returns the unique element in the array, or `undefined` if none or multiple exist.
 */
export const uniqueOrUndefined = <T>(elements: T[]): T | undefined => {
    if (elements.length === 1) {
        return elements[0];
    }

    return undefined;
};

/**
 * Returns the elements of the array that are labeled the same as a previous element. The first element with a label is
 * not included. Neither are elements with an undefined label.
 */
export const duplicatesBy = function* <T, K>(
    elements: Iterable<T>,
    labeler: (element: T) => K | undefined,
): Generator<T, void> {
    const knownLabels = new Set<K>();

    for (const element of elements) {
        const label = labeler(element);
        if (label === undefined) {
            continue;
        }

        if (knownLabels.has(label)) {
            yield element;
        } else {
            knownLabels.add(label);
        }
    }
};
