import { NodeKindProvider } from 'langium';
import { CompletionItemKind, SymbolKind } from 'vscode-languageserver';

export class SafeDsNodeKindProvider implements NodeKindProvider {
    getSymbolKind(): SymbolKind {
        return SymbolKind.Constant;
    }

    getCompletionItemKind(): CompletionItemKind {
        return CompletionItemKind.Reference;
    }
}
