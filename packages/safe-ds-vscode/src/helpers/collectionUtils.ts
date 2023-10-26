import { Stream, stream } from 'langium';

/**
 * Returns the values of the iterable that are labeled the same as a previous value. The first value with a label is
 * not included. Neither are values with an `undefined` label.
 *
 * @example
 *     const id = (value: any) => value;
 *     duplicatesBy([1, 2, 1, 3], id) // [1]
 */
export const duplicatesBy = <T, K>(iterable: Iterable<T>, labeler: (element: T) => K | undefined): Stream<T> => {
    return stream(duplicatedByGenerator(iterable, labeler));
};

const duplicatedByGenerator = function* <T, K>(
    iterable: Iterable<T>,
    labeler: (element: T) => K | undefined,
): Generator<T, void> {
    const knownLabels = new Set<K>();

    for (const value of iterable) {
        const label = labeler(value);
        if (label === undefined) {
            continue;
        }

        if (knownLabels.has(label)) {
            yield value;
        } else {
            knownLabels.add(label);
        }
    }
};

/**
 * Returns the values of the iterable grouped by their label. Values with an `undefined` label are not included.
 */
export const groupBy = <T, K>(iterable: Iterable<T>, labeler: (element: T) => K | undefined): Stream<[K, T[]]> => {
    const groups = new Map<K, T[]>();

    for (const value of iterable) {
        const label = labeler(value);
        if (label === undefined) {
            continue;
        }

        const group = groups.get(label);
        if (group === undefined) {
            groups.set(label, [value]);
        } else {
            group.push(value);
        }
    }

    return stream(groups.entries());
};

/**
 * Returns whether the iterable has no values.
 */
export const isEmpty = (iterable: Iterable<unknown>): boolean => {
    return iterable[Symbol.iterator]().next().done === true;
};

/**
 * Returns the last element of the array, or `undefined` if the array is empty.
 */
export const last = <T>(array: T[]): T | undefined => {
    return array[array.length - 1];
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
