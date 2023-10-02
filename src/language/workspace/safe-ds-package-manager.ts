import { SafeDsServices } from '../safe-ds-module.js';
import { AstNodeDescription, AstNodeLocator, DocumentState, IndexManager } from 'langium';

export class SafeDsPackageManager {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly indexManager: IndexManager;

    private readonly packageNames: PackageNames;
    private readonly packageTree: PackageTree;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.indexManager = services.shared.workspace.IndexManager;

        this.packageNames = new Set();
        this.packageTree = new Map();

        // Update data once documents are indexed
        services.shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.IndexedContent, () =>
            this.buildDatastructures(),
        );
    }

    private buildDatastructures(): void {
        this.packageNames.clear();
        this.packageTree.clear();

        const elements = [...this.indexManager.allElements()]

        for (const description of this.indexManager.allElements()) {
            // TODO
        }
    }
}

type PackageNames = Set<string>;
type PackageTree = Map<string, PackageContents>;
type PackageContents = {
    subpackages: PackageTree;
    ownDeclarations: OwnDeclarations;
};
type OwnDeclarations = AstNodeDescription[];
