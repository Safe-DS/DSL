import { CodeActionProvider } from 'langium/lsp';
import { LangiumDocument, MaybePromise } from 'langium';
import { CancellationToken, CodeAction, CodeActionParams, Command } from 'vscode-languageserver';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsQuickfixProvider } from './quickfixes/safe-ds-quickfix-provider.js';

export class SafeDsCodeActionProvider implements CodeActionProvider {
    private readonly quickfixProvider: SafeDsQuickfixProvider;

    constructor(services: SafeDsServices) {
        this.quickfixProvider = services.codeActions.QuickfixProvider;
    }

    getCodeActions(
        document: LangiumDocument,
        params: CodeActionParams,
        _cancelToken?: CancellationToken,
    ): MaybePromise<Array<Command | CodeAction> | undefined> {
        const result: CodeAction[] = [];
        const acceptor = (action: CodeAction) => result.push(action);

        for (const diagnostic of params.context.diagnostics) {
            this.quickfixProvider.createQuickfixes(diagnostic, document, acceptor);
        }

        return result;
    }
}

export type CodeActionAcceptor = (action: CodeAction) => void;
