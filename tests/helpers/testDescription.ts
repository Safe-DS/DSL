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
    error?: Error;
}
