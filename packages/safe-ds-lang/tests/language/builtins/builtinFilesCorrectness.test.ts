import { AssertionError } from 'assert';
import { URI } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { beforeAll, describe, it } from 'vitest';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { isEmpty } from '../../../src/helpers/collections.js';
import { uriToShortenedResourceName } from '../../../src/helpers/resources.js';
import { listBuiltinFiles } from '../../../src/language/builtins/fileFinder.js';
import { createSafeDsServices } from '../../../src/language/index.js';
import { CODE_EXPERIMENTAL_LIBRARY_ELEMENT } from '../../../src/language/validation/builtins/experimental.js';
import { CODE_EXPERIMENTAL_LANGUAGE_FEATURE } from '../../../src/language/validation/experimentalLanguageFeatures.js';
import { locationToString } from '../../../src/helpers/locations.js';
import { loadDocuments } from '../../helpers/testResources.js';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
const langiumDocuments = services.shared.workspace.LangiumDocuments;
const builtinFiles = listBuiltinFiles();

const ignoredWarnings: (number | string | undefined)[] = [
    CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    CODE_EXPERIMENTAL_LIBRARY_ELEMENT,
];

describe('builtin files', () => {
    beforeAll(async () => {
        await loadDocuments(services, builtinFiles, { validation: true });
    });

    const testCases = builtinFiles.map((uri) => ({
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

const diagnosticToString = (diagnostic: Diagnostic, uri: URI): string => {
    const codeString = diagnostic.data?.code ?? diagnostic.code;
    const locationString = locationToString({ uri: uri.toString(), range: diagnostic.range });
    return `    - ${codeString}: ${diagnostic.message}\n      at ${locationString}`;
};
