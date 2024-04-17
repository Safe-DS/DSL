import { DefaultWorkspaceManager, LangiumDocument, LangiumDocumentFactory } from 'langium';
import { WorkspaceFolder } from 'vscode-languageserver';
import { listBuiltinFiles } from '../builtins/fileFinder.js';
import { type LangiumSharedServices } from 'langium/lsp';

export class SafeDsWorkspaceManager extends DefaultWorkspaceManager {
    private documentFactory: LangiumDocumentFactory;

    constructor(services: LangiumSharedServices) {
        super(services);
        this.documentFactory = services.workspace.LangiumDocumentFactory;
    }

    protected override async loadAdditionalDocuments(
        folders: WorkspaceFolder[],
        collector: (document: LangiumDocument) => void,
    ): Promise<void> {
        await super.loadAdditionalDocuments(folders, collector);

        // Load builtin files
        for (const uri of listBuiltinFiles()) {
            collector(await this.documentFactory.fromUri(uri));
        }
    }
}
