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
 * Partitions the iterable into two arrays based on the predicate. The first array contains the values for which the
 * predicate returned `true`, the second array the values for which it returned `false`.
 */
export const partitionBy = <T>(iterable: Iterable<T>, predicate: (element: T) => boolean): [T[], T[]] => {
    const truthy: T[] = [];
    const falsy: T[] = [];

    for (const value of iterable) {
        if (predicate(value)) {
            truthy.push(value);
        } else {
            falsy.push(value);
        }
    }

    return [truthy, falsy];
};

/**
 * Returns whether the iterable has no values.
 */
export const isEmpty = (iterable: Iterable<unknown>): boolean => {
    return iterable[Symbol.iterator]().next().done === true;
};

/**
 * Returns whether `set1` and `set2` contain the same values.
 */
export const isEqualSet = <T>(set1: Set<T>, set2: Set<T>): boolean => {
    return set1.size === set2.size && isSubset(set1, set2);
};

/**
 * Returns whether `set1` is a subset of `set2`.
 */
export const isSubset = <T>(set1: Set<T>, set2: Set<T>): boolean => {
    for (const value of set1) {
        if (!set2.has(value)) {
            return false;
        }
    }
    return true;
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
