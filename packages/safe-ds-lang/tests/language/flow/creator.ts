import { listTestSafeDsFiles, uriToShortenedTestResourceName } from '../../helpers/testResources.js';
import { Location } from 'vscode-languageserver';
import { EmptyFileSystem, URI } from 'langium';
import { createSafeDsServices } from '../../../src/language/index.js';
import { TestDescription, TestDescriptionError } from '../../helpers/testDescription.js';
import fs from 'fs';
import { getSyntaxErrors, SyntaxErrorsInCodeError } from '../../helpers/diagnostics.js';
import { findTestChecks } from '../../helpers/testChecks.js';

const services = createSafeDsServices(EmptyFileSystem).SafeDs;
const rootResourceName = 'call graph';

export const createCallGraphTests = (): Promise<CallGraphTest[]> => {
    const uris = listTestSafeDsFiles(rootResourceName);
    const testCases = uris.map((it) => createCallGraphTest(it));

    return Promise.all(testCases);
};

const createCallGraphTest = async (uri: URI): Promise<CallGraphTest> => {
    const expectedCallGraphs: ExpectedCallGraph[] = [];
    const code = fs.readFileSync(uri.fsPath).toString();

    // File must not contain any syntax errors
    const syntaxErrors = await getSyntaxErrors(services, code);
    if (syntaxErrors.length > 0) {
        return invalidTest(new SyntaxErrorsInCodeError(syntaxErrors, uri));
    }

    const checksResult = findTestChecks(code, uri, { failIfFewerRangesThanComments: true });

    // Something went wrong when finding test checks
    if (checksResult.isErr) {
        return invalidTest(checksResult.error);
    }

    for (const check of checksResult.value) {
        try {
            const parseResult = JSON.parse(check.comment);
            if (!Array.isArray(parseResult)) {
                return invalidTest(new InvalidCommentError(check.comment, uri));
            }

            expectedCallGraphs.push({
                location: check.location!,
                expectedCallables: parseResult,
            });
        } catch (e) {
            return invalidTest(new InvalidCommentError(check.comment, uri));
        }
    }

    const shortenedResourceName = uriToShortenedTestResourceName(uri, rootResourceName);
    return {
        testName: `[${shortenedResourceName}]`,
        code,
        expectedCallGraphs,
    };
};

/**
 * Report a test that has errors.
 *
 * @param error The error that occurred.
 */
const invalidTest = (error: TestDescriptionError): CallGraphTest => {
    const shortenedResourceName = uriToShortenedTestResourceName(error.uri, rootResourceName);
    const testName = `INVALID TEST FILE [${shortenedResourceName}]`;
    return {
        testName,
        code: '',
        expectedCallGraphs: [],
        error,
    };
};

/**
 * A description of a call graph test.
 */
interface CallGraphTest extends TestDescription {
    /**
     * The code to test.
     */
    code: string;

    /**
     * Calls and their expected call graph.
     */
    expectedCallGraphs: ExpectedCallGraph[];
}

/**
 * A call and the expected callables in its call graph.
 */
export interface ExpectedCallGraph {
    /**
     * The location of the call to compute the call graph of.
     */
    location: Location;

    /**
     * Expected callables in the call graph. For named callables, the name is used. For block lambdas, the name
     * $blockLambda is used. For expression lambdas, the name $expressionLambda is used.
     */
    expectedCallables: string[];
}

/**
 * A test comment did not match the expected format.
 */
class InvalidCommentError extends TestDescriptionError {
    constructor(
        readonly comment: string,
        uri: URI,
    ) {
        super(`Invalid test comment (must be array of strings): ${comment}`, uri);
    }
}
