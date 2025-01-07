import { Diagnostic } from 'vscode-languageserver';
import { LangiumDocument } from 'langium';
import { CODE_ARGUMENT_POSITIONAL } from '../../validation/other/expressions/arguments.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { makeArgumentsAssignedToOptionalParametersNamed } from './arguments.js';
import { CodeActionAcceptor } from '../safe-ds-code-action-provider.js';

export class SafeDsQuickfixProvider {
    private readonly registry: QuickfixRegistry;

    constructor(services: SafeDsServices) {
        this.registry = {
            [CODE_ARGUMENT_POSITIONAL]: [makeArgumentsAssignedToOptionalParametersNamed(services)],
        };
    }

    createQuickfixes(diagnostic: Diagnostic, document: LangiumDocument, acceptor: CodeActionAcceptor) {
        if (!diagnostic.code) {
            return;
        }

        const quickfixes = this.registry[diagnostic.code];
        if (Array.isArray(quickfixes)) {
            for (const quickfix of quickfixes) {
                quickfix(diagnostic, document, acceptor);
            }
        } else if (quickfixes) {
            quickfixes(diagnostic, document, acceptor);
        }
    }
}

type QuickfixRegistry = {
    [code: string | number]: Quickfix | Quickfix[];
};

type Quickfix = (diagnostic: Diagnostic, document: LangiumDocument, acceptor: CodeActionAcceptor) => void;
