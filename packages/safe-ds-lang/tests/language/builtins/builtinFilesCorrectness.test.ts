import { AssertionError } from 'assert';
import { AstUtils, URI } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { beforeAll, describe, it } from 'vitest';
import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver';
import { isEmpty } from '../../../src/helpers/collections.js';
import { uriToShortenedResourceName } from '../../../src/helpers/resources.js';
import { listBuiltinFiles } from '../../../src/language/builtins/fileFinder.js';
import { createSafeDsServices } from '../../../src/language/index.js';
import { CODE_EXPERIMENTAL_LIBRARY_ELEMENT } from '../../../src/language/validation/builtins/experimental.js';
import { CODE_EXPERIMENTAL_LANGUAGE_FEATURE } from '../../../src/language/validation/experimentalLanguageFeatures.js';
import { locationToString } from '../../../src/helpers/locations.js';
import { loadDocuments } from '../../helpers/testResources.js';
import { CODE_MODULE_MISSING_PACKAGE } from '../../../src/language/validation/other/modules.js';
import { validationHelper } from 'langium/test';
import { isSdsDeclaration } from '../../../src/language/generated/ast.js';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const documentProvider = services.documentation.DocumentationProvider;
const langiumDocuments = services.shared.workspace.LangiumDocuments;
const builtinFiles = listBuiltinFiles();

const ignoredWarnings: (number | string | undefined)[] = [
    CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    CODE_EXPERIMENTAL_LIBRARY_ELEMENT,
];

describe('source code', () => {
    beforeAll(async () => {
        await loadDocuments(services, builtinFiles, { validation: true });
    });

    const testCases: SourceCodeTest[] = builtinFiles.map((uri) => ({
        uri,
        shortenedResourceName: uriToShortenedResourceName(uri, 'builtins'),
    }));

    it.each(testCases)('[$shortenedResourceName] should have no errors or warnings', async ({ uri }) => {
        const document = langiumDocuments.getDocument(uri)!;

        const errorsOrWarnings =
            document.diagnostics?.filter(
                (diagnostic) =>
                    diagnostic.severity === DiagnosticSeverity.Error ||
                    (diagnostic.severity === DiagnosticSeverity.Warning && !ignoredWarnings.includes(diagnostic.code)),
            ) ?? [];

        if (!isEmpty(errorsOrWarnings)) {
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw new InvalidBuiltinFileError(errorsOrWarnings, uri);
        }
    });
});

describe('examples', () => {
    const ignoredErrors: (number | string | undefined)[] = [CODE_MODULE_MISSING_PACKAGE];

    const testCases: ExampleTest[] = builtinFiles.flatMap((uri) => {
        const document = langiumDocuments.getDocument(uri)!;
        const examples = AstUtils.streamAst(document.parseResult.value)
            .filter(isSdsDeclaration)
            .flatMap((node) => {
                const range = node.$cstNode?.range;
                return documentProvider.getExamples(node).map((example) => ({ example, name: node.name, range }));
            })
            .toArray();

        if (isEmpty(examples)) {
            return [];
        }

        return {
            uri,
            shortenedResourceName: uriToShortenedResourceName(uri, 'builtins'),
            examples,
        };
    });

    describe.each(testCases)('[$shortenedResourceName]', ({ uri, examples }) => {
        it.each(examples)('$name', async ({ example, range }) => {
            const result = await validationHelper(services)(example);
            try {
                const errorsOrWarnings = result.diagnostics.filter(
                    (diagnostic) =>
                        (diagnostic.severity === DiagnosticSeverity.Error &&
                            !ignoredErrors.includes(diagnostic.code)) ||
                        (diagnostic.severity === DiagnosticSeverity.Warning &&
                            !ignoredWarnings.includes(diagnostic.code)),
                );

                if (!isEmpty(errorsOrWarnings)) {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw new InvalidExampleError(errorsOrWarnings, uri, range);
                }
            } finally {
                await result.dispose();
            }
        });
    });
});

/**
 * A description of a test for the source code in a file.
 */
interface SourceCodeTest {
    /**
     * The URI of the file.
     */
    uri: URI;

    /**
     * The shortened name of the resource.
     */
    shortenedResourceName: string;
}

/**
 * A description of a test for the examples in a file.
 */
interface ExampleTest {
    /**
     * The URI of the file.
     */
    uri: URI;

    /**
     * The shortened name of the resource.
     */
    shortenedResourceName: string;

    /**
     * The examples in the file.
     */
    examples: Example[];
}

interface Example {
    /**
     * The example source code.
     */
    example: string;

    /**
     * The name of the declaration that the example belongs to.
     */
    name: string;

    /**
     * The range of the declaration in the source code.
     */
    range: Range | undefined;
}

/**
 * A builtin file has errors or warnings.
 */
class InvalidBuiltinFileError extends AssertionError {
    constructor(
        readonly diagnostics: Diagnostic[],
        uri: URI,
    ) {
        const diagnosticsAsString = diagnostics.map((d) => diagnosticToString(d, uri)).join(`\n`);

        super({
            message: `Builtin file has errors or warnings:\n${diagnosticsAsString}`,
            actual: diagnostics,
            expected: [],
        });
    }
}

/**
 * An example has errors or warnings.
 */
class InvalidExampleError extends AssertionError {
    constructor(
        readonly diagnostics: Diagnostic[],
        uri: URI,
        range: Range | undefined,
    ) {
        const diagnosticsAsString = diagnostics.map((d) => diagnosticToString(d, uri, range)).join(`\n`);

        super({
            message: `Example has errors or warnings:\n${diagnosticsAsString}`,
            actual: diagnostics,
            expected: [],
        });
    }
}

const diagnosticToString = (diagnostic: Diagnostic, uri: URI, range?: Range): string => {
    const codeString = diagnostic.data?.code ?? diagnostic.code;
    const locationString = locationToString({ uri: uri.toString(), range: range ?? diagnostic.range });
    return `    - ${codeString}: ${diagnostic.message}\n      at ${locationString}`;
};
