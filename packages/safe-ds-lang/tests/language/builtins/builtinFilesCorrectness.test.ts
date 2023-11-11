import { beforeAll, describe, it } from 'vitest';
import { listBuiltinFiles } from '../../../src/language/builtins/fileFinder.js';
import { uriToShortenedResourceName } from '../../../src/helpers/resources.js';
import { createSafeDsServices } from '../../../src/language/safe-ds-module.js';
import { NodeFileSystem } from 'langium/node';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { URI } from 'langium';
import { locationToString } from '../../helpers/location.js';
import { AssertionError } from 'assert';
import { isEmpty } from '../../../src/helpers/collectionUtils.js';
import { loadDocuments } from '../../helpers/testResources.js';
import { CODE_EXPERIMENTAL_LANGUAGE_FEATURE } from '../../../src/language/validation/experimentalLanguageFeatures.js';
import {
    CODE_EXPERIMENTAL_ASSIGNED_RESULT,
    CODE_EXPERIMENTAL_CALLED_ANNOTATION,
    CODE_EXPERIMENTAL_CORRESPONDING_PARAMETER,
    CODE_EXPERIMENTAL_REFERENCED_DECLARATION,
} from '../../../src/language/validation/builtins/experimental.js';

const services = createSafeDsServices(NodeFileSystem).SafeDs;
const builtinFiles = listBuiltinFiles();

const ignoredWarnings: (number | string | undefined)[] = [
    CODE_EXPERIMENTAL_LANGUAGE_FEATURE,
    CODE_EXPERIMENTAL_ASSIGNED_RESULT,
    CODE_EXPERIMENTAL_CALLED_ANNOTATION,
    CODE_EXPERIMENTAL_CORRESPONDING_PARAMETER,
    CODE_EXPERIMENTAL_REFERENCED_DECLARATION,
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
        const document = services.shared.workspace.LangiumDocuments.getOrCreateDocument(uri);

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
