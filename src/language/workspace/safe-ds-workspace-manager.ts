import { DefaultWorkspaceManager, LangiumDocument, LangiumDocumentFactory, LangiumSharedServices } from 'langium';
import { WorkspaceFolder } from 'vscode-languageserver';
import { listBuiltinsFiles } from '../builtins/fileFinder.js';

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
        for (const uri of listBuiltinsFiles()) {
            collector(this.documentFactory.create(uri));
        }
    }
}
