import { URI } from 'langium';

/**
 * A description of a test. This interface should be extended to describe tests of specific components.
 */
export interface TestDescription {
    /**
     * The name of the test.
     */
    testName: string;

    /**
     * An error that occurred while creating the test. If this is undefined, the test is valid.
     */
    error?: TestDescriptionError;
}

/**
 * An error that occurred while creating a test.
 *
 * @param message A message describing the error.
 * @param uri The URI of the file/directory that caused the error.
 */
export class TestDescriptionError extends Error {
    constructor(
        message: string,
        readonly uri: URI,
    ) {
        super(message);
        this.stack = uri.toString();
    }
}

/**
 * Tests for an `equals` method.
 */
export interface EqualsTest<T> {
    /**
     * Produces the first value to compare, which must not be equal to {@link unequalValueOfSameType}.
     */
    value: () => T;

    /**
     * Produces the second node to compare, which must not be equal to {@link value}. If the type is a singleton, leave
     * this field `undefined`.
     */
    unequalValueOfSameType?: () => T;

    /**
     * Produces a value of a different type.
     */
    valueOfOtherType?: () => T;
}

/**
 * Tests for a `toString` method
 */
export interface ToStringTest<T> {
    /**
     * The value to convert to a string.
     */
    value: T;

    /**
     * The expected string representation of the value.
     */
    expectedString: string;
}
