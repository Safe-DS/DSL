import { CodeAction, Diagnostic, TextEdit } from 'vscode-languageserver';
import { LangiumDocument } from 'langium';

export const createQuickfixFromTextEditsToSingleDocument = (
    title: string,
    diagnostic: Diagnostic,
    document: LangiumDocument,
    edits: TextEdit[],
    isPreferred: boolean = false,
): CodeAction => {
    return {
        title,
        kind: 'quickfix',
        diagnostics: [diagnostic],
        edit: {
            documentChanges: [
                {
                    textDocument: {
                        uri: document.textDocument.uri,
                        version: document.textDocument.version,
                    },
                    edits,
                },
            ],
        },
        isPreferred,
    };
};
