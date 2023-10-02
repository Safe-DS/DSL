import { SafeDsServices } from '../safe-ds-module.js';
import {
    AstNode,
    AstNodeDescription,
    AstNodeLocator,
    AstReflection,
    DocumentState,
    IndexManager,
    LangiumDocuments,
} from 'langium';
import { packageNameOrNull } from '../helpers/shortcuts.js';

export class SafeDsPackageManager {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly astReflection: AstReflection;
    private readonly indexManager: IndexManager;
    private readonly langiumDocuments: LangiumDocuments;

    private readonly packageNames: PackageNames;
    private readonly packageContents: PackageContents;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.astReflection = services.shared.AstReflection;
        this.indexManager = services.shared.workspace.IndexManager;
        this.langiumDocuments = services.shared.workspace.LangiumDocuments;

        this.packageNames = new Set();
        this.packageContents = {
            subpackages: new Map(),
            ownDeclarations: [],
        };

        // Update data once documents are indexed
        services.shared.workspace.DocumentBuilder.onBuildPhase(DocumentState.IndexedContent, () =>
            this.buildPackageStructures(),
        );
    }

    /**
     * Returns all package names that are defined in the workspace sorted alphabetically.
     */
    getPackageNames(): string[] {
        return Array.from(this.packageNames).sort();
    }

    /**
     * Returns whether a module with the given package name exists in the workspace.
     */
    hasPackage(packageName: string): boolean {
        return this.packageNames.has(packageName);
    }

    /**
     * Returns all declarations that are defined directly in the given package. They must match the node type if
     * specified.
     */
    getDeclarationsInPackage(packageName: string, nodeType?: string): AstNodeDescription[] {
        const result = this.getPackageContents(packageName)?.ownDeclarations ?? [];
        return this.filterByNodeType(result, nodeType);
    }

    /**
     * Returns all declarations that are defined in the given package or any of its (transitive) subpackages. They must
     * match the node type if specified.
     */
    getDeclarationsInPackageOrSubpackage(packageName: string, nodeType?: string): AstNodeDescription[] {
        const packageContents = this.getPackageContents(packageName);
        if (!packageContents) {
            return [];
        }

        const result: AstNodeDescription[] = [];
        const queue: PackageContents[] = [packageContents];
        while (queue.length > 0) {
            const current = queue.shift()!;
            result.push(...current.ownDeclarations);
            queue.push(...current.subpackages.values());
        }

        return this.filterByNodeType(result, nodeType);
    }

    private getPackageContents(packageName: string): PackageContents | undefined {
        const parts = packageName.split('.');
        let current = this.packageContents;

        for (const part of parts) {
            if (!current.subpackages.has(part)) {
                return undefined;
            }

            current = current.subpackages.get(part)!;
        }

        return current;
    }

    private filterByNodeType(descriptions: AstNodeDescription[], nodeType?: string): AstNodeDescription[] {
        if (!nodeType) {
            return descriptions;
        }

        return descriptions.filter((it) => this.astReflection.isSubtype(it.type, nodeType));
    }

    private buildPackageStructures(): void {
        this.packageNames.clear();
        this.packageContents.subpackages.clear();

        for (const description of this.indexManager.allElements()) {
            const node = this.loadAstNode(description);
            if (!node) {
                continue;
            }

            const packageName = packageNameOrNull(node);
            if (!packageName || !this.isValidPackageName(packageName)) {
                continue;
            }

            this.packageNames.add(packageName);
            this.addToTree(packageName, description, node);
        }
    }

    private loadAstNode(nodeDescription: AstNodeDescription): AstNode | undefined {
        if (nodeDescription.node) {
            /* c8 ignore next 2 */
            return nodeDescription.node;
        }

        if (this.langiumDocuments.hasDocument(nodeDescription.documentUri)) {
            const document = this.langiumDocuments.getOrCreateDocument(nodeDescription.documentUri);
            return this.astNodeLocator.getAstNode(document.parseResult.value, nodeDescription.path);
        }

        return undefined;
    }

    /**
     * Checks whether the given package name is valid. There must be no leading or trailing dots, and no double dots.
     */
    private isValidPackageName(packageName: string): boolean {
        return packageName.split('.').every((it) => it !== '');
    }

    private addToTree(packageName: string, description: AstNodeDescription, node: AstNode): void {
        const descriptionWithResolvedNode = { ...description, node };

        const parts = packageName.split('.');
        let current = this.packageContents;

        // Traverse the package tree and create missing nodes
        for (const part of parts) {
            if (!current.subpackages.has(part)) {
                current.subpackages.set(part, {
                    subpackages: new Map(),
                    ownDeclarations: [],
                });
            }
            current = current.subpackages.get(part)!;
        }

        current.ownDeclarations.push(descriptionWithResolvedNode);
    }
}

type PackageNames = Set<string>;
type PackageContents = {
    subpackages: PackageTree;
    ownDeclarations: OwnDeclarations;
};
type PackageTree = Map<string, PackageContents>;
type OwnDeclarations = AstNodeDescription[];
