import { Type } from '../../src/language/typing/model.js';
import { AssertionError } from 'assert';

export const expectEqualTypes = (actual: Type, expected: Type) => {
    if (!actual.equals(expected)) {
        throw new AssertionError({
            message: `Expected type '${actual.toString()}' to equal type '${expected.toString()}'.`,
            actual: actual.toString(),
            expected: expected.toString(),
        });
    }
};
