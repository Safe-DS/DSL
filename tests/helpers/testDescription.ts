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
