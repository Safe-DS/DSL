import { DefaultWorkspaceManager, LangiumDocument, LangiumDocumentFactory, LangiumSharedServices } from 'langium';
import { WorkspaceFolder } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { SAFE_DS_FILE_EXTENSIONS } from '../constants/fileExtensions.js';
import { globSync } from 'glob';
import path from 'path';

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

        for (const uri of listBuiltinsFiles()) {
            collector(this.documentFactory.create(uri));
        }
    }
}

let builtinsPath: string;
if (__filename.endsWith('.ts')) {
    // Before running ESBuild
    builtinsPath = path.join(__dirname, '..', '..', 'resources', 'builtins');
} else {
    // After running ESBuild
    builtinsPath = path.join(__dirname, '..', 'resources', 'builtins');
}

/**
 * Lists all Safe-DS files in `src/resources/builtins`.
 *
 * @return URIs of all discovered files.
 */
export const listBuiltinsFiles = (): URI[] => {
    const pattern = `**/*.{${SAFE_DS_FILE_EXTENSIONS.join(',')}}`;
    const relativePaths = globSync(pattern, { cwd: builtinsPath, nodir: true });
    return relativePaths.map((relativePath) => {
        const absolutePath = path.join(builtinsPath, relativePath);
        return URI.file(absolutePath);
    });
};
