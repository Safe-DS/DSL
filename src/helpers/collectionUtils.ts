import { Stream, stream } from 'langium';

/**
 * Returns the values of the iterable that are labeled the same as a previous value. The first value with a label is
 * not included. Neither are values with an undefined label.
 *
 * @example
 *     const id = (value: any) => value;
 *     duplicatesBy([1, 2, 1, 3], id) // [1]
 */
export const duplicatesBy = <T, K>(iterable: Iterable<T>, labeler: (element: T) => K | undefined): Stream<T> => {
    return stream(duplicatedByGenerator(iterable, labeler));
};

const duplicatedByGenerator = function* <T, K>(
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

/**
 * Returns whether the iterable has no values.
 */
export const isEmpty = (iterable: Iterable<unknown>): boolean => {
    return iterable[Symbol.iterator]().next().done === true;
};

/**
 * Returns the unique value in the iterable, or `undefined` if none or multiple exist.
 */
export const uniqueOrUndefined = <T>(iterable: Iterable<T>): T | undefined => {
    const iterator = iterable[Symbol.iterator]();
    const { value: first } = iterator.next();
    const { done } = iterator.next();

    if (done) {
        return first;
    } else {
        return undefined;
    }
};
