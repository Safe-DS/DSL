import { describe, expect, it } from 'vitest';
import { NodeFileSystem } from 'langium/node';
import { createCodeActionsTests } from './creator.js';
import { loadDocuments } from '../../helpers/testResources.js';
import { createSafeDsServices } from '../../../src/language/index.js';
import { LangiumDocument, URI, UriUtils } from 'langium';
import {
    CodeAction,
    CodeActionParams,
    Command,
    CreateFile,
    DeleteFile,
    RenameFile,
    TextDocumentEdit,
    WorkspaceEdit,
} from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

const services = (await createSafeDsServices(NodeFileSystem)).SafeDs;
const langiumDocuments = services.shared.workspace.LangiumDocuments;
const codeActionProvider = services.lsp.CodeActionProvider!;

const codeActionTests = createCodeActionsTests();

describe('code actions', async () => {
    it.each(await codeActionTests)('$testName', async (test) => {
        // Test is invalid
        if (test.error) {
            throw test.error;
        }

        // Load all documents
        const inputUris = test.inputs.map((input) => input.uri);
        await loadDocuments(services, inputUris, { validation: true });

        // Collect workspace edits
        const edits: WorkspaceEdit[] = [];

        for (const input of test.inputs) {
            const document = langiumDocuments.getDocument(input.uri)!;
            const codeActions = (await getCodeActions(document)) ?? [];

            for (const action of codeActions) {
                if (actionShouldBeApplied(action, input.codeActionTitles) && action.edit) {
                    edits.push(action.edit);
                }
            }
        }

        // Compute actual output
        const relevantUris = await applyWorkspaceEdits(edits, inputUris);
        const actualOutputs = computeActualOutput(relevantUris, test.inputRoot, test.outputRoot);

        // File contents must match
        for (const [uriString, code] of actualOutputs) {
            const fsPath = uriString.fsPath;
            await expect(code).toMatchFileSnapshot(fsPath);
        }

        // File paths must match
        const actualOutputPaths = Array.from(actualOutputs.keys())
            .map((uri) => uri.toString())
            .sort();
        const expectedOutputPaths = test.expectedOutputUris.map((uri) => uri.toString()).sort();
        expect(actualOutputPaths).toStrictEqual(expectedOutputPaths);
    });
});

const getCodeActions = async function getCodeActions(document: LangiumDocument) {
    const params: CodeActionParams = {
        textDocument: {
            uri: document.textDocument.uri,
        },
        range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 },
        },
        context: {
            diagnostics: document.diagnostics ?? [],
        },
    };

    return codeActionProvider.getCodeActions(document, params);
};

const actionShouldBeApplied = (action: CodeAction | Command, titles: (string | RegExp)[]): action is CodeAction => {
    if (!CodeAction.is(action)) {
        return false;
    }

    for (const title of titles) {
        if (typeof title === 'string' && action.title === title) {
            return true;
        } else if (title instanceof RegExp && title.test(action.title)) {
            return true;
        }
    }

    return false;
};

const applyWorkspaceEdits = async function (edits: WorkspaceEdit[], inputUris: URI[]): Promise<URI[]> {
    const uris = [...inputUris];

    for (const edit of edits) {
        if (edit.documentChanges) {
            await applyDocumentChanges(edit.documentChanges, uris);
        }
    }

    return uris;
};

const applyDocumentChanges = async function (
    changes: (TextDocumentEdit | CreateFile | RenameFile | DeleteFile)[],
    uris: URI[],
) {
    for (const change of changes) {
        if (TextDocumentEdit.is(change)) {
            await applyTextDocumentEdit(change);
        } else if (CreateFile.is(change)) {
            await applyCreateFile(change, uris);
        } else if (RenameFile.is(change)) {
            await applyRenameFile(change, uris);
        } else if (DeleteFile.is(change)) {
            await applyDeleteFile(change, uris);
        }
    }
};

const applyTextDocumentEdit = async function (change: TextDocumentEdit) {
    const uri = URI.parse(change.textDocument.uri);
    const document = langiumDocuments.getDocument(uri)!;

    const newCode = TextDocument.applyEdits(document.textDocument, change.edits);
    langiumDocuments.deleteDocument(uri);
    langiumDocuments.createDocument(uri, newCode);
};

const applyCreateFile = async function (change: CreateFile, uris: URI[]) {
    const uri = URI.parse(change.uri);

    // Do nothing if the file exists already and should not be overwritten
    const exists = langiumDocuments.hasDocument(uri);
    if (exists && !change.options?.overwrite) {
        return;
    }

    // Apply the change
    if (exists) {
        langiumDocuments.deleteDocument(uri);
    }
    langiumDocuments.createDocument(uri, '');

    // Update the list of URIs
    if (uris.every((knownUri) => !UriUtils.equals(knownUri, uri))) {
        uris.push(uri);
    }
};

const applyRenameFile = async function (change: RenameFile, uris: URI[]) {
    const oldUri = URI.parse(change.oldUri);
    const newUri = URI.parse(change.newUri);

    // Do nothing if the old file does not exist
    if (!langiumDocuments.hasDocument(oldUri)) {
        return;
    }

    // Do nothing if the new file exists already and should not be overwritten
    const newExists = langiumDocuments.hasDocument(newUri);
    if (newExists && !change.options?.overwrite) {
        return;
    }

    // Apply the change
    const oldDocument = langiumDocuments.getDocument(oldUri)!;
    langiumDocuments.deleteDocument(oldUri);
    if (newExists) {
        langiumDocuments.deleteDocument(newUri);
    }
    langiumDocuments.createDocument(newUri, oldDocument.textDocument.getText());

    // Update the list of URIs
    const index = uris.findIndex((knownUri) => UriUtils.equals(knownUri, oldUri));
    if (index >= 0) {
        uris[index] = newUri;
    }
};

const applyDeleteFile = async function (change: DeleteFile, uris: URI[]) {
    const uri = URI.parse(change.uri);

    // Do nothing if the file does not exist
    if (!langiumDocuments.hasDocument(uri)) {
        return;
    }

    // Apply the change
    langiumDocuments.deleteDocument(uri);

    // Update the list of URIs
    const index = uris.findIndex((knownUri) => UriUtils.equals(knownUri, uri));
    if (index >= 0) {
        uris.splice(index, 1);
    }
};

const computeActualOutput = (uris: URI[], inputRoot: URI, outputRoot: URI): Map<URI, string> => {
    const result = new Map<URI, string>();

    for (const uri of uris) {
        const document = langiumDocuments.getDocument(uri)!;
        const relativeUri = UriUtils.relative(inputRoot, uri);
        const outputUri = UriUtils.resolvePath(outputRoot, relativeUri);

        result.set(outputUri, document.textDocument.getText());
    }

    return result;
};
