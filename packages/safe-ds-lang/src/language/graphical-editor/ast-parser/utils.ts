import { CustomError } from '../global.js';

export const zip = <A, B>(arrayA: A[], arrayB: B[]): [A, B][] => {
    const minLength = Math.min(arrayA.length, arrayB.length);
    const result: [A, B][] = [];

    for (let i = 0; i < minLength; i++) {
        result.push([arrayA[i]!, arrayB[i]!]);
    }

    return result;
};

export const filterErrors = <T>(array: (T | CustomError)[]): T[] => {
    return array.filter(
        (element): element is Exclude<typeof element, CustomError> => !(element instanceof CustomError),
    );
};
