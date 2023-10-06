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
import { isSdsSegment } from '../generated/ast.js';
import {isInternal, packageNameOrUndefined} from '../helpers/nodeProperties.js';

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
     * Returns all declarations that are defined directly in the given package. The options can be used to filter the
     * results.
     */
    getDeclarationsInPackage(packageName: string, options: GetDeclarationsOptions = {}): AstNodeDescription[] {
        const result = this.getPackageContents(packageName)?.ownDeclarations ?? [];
        return this.filterDescriptions(result, options);
    }

    /**
     * Returns all declarations that are defined in the given package or any of its (transitive) subpackages. The
     * options can be used to filter the results.
     */
    getDeclarationsInPackageOrSubpackage(
        packageName: string,
        options: GetDeclarationsOptions = {},
    ): AstNodeDescription[] {
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

        return this.filterDescriptions(result, options);
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

    private filterDescriptions(
        descriptions: AstNodeDescription[],
        options: GetDeclarationsOptions,
    ): AstNodeDescription[] {
        const { nodeType, hideInternal } = options;
        let result = descriptions;

        if (nodeType) {
            result = descriptions.filter((it) => this.astReflection.isSubtype(it.type, nodeType));
        }

        if (hideInternal) {
            result = result.filter((it) => !isSdsSegment(it.node) || !isInternal(it.node));
        }

        return result;
    }

    private buildPackageStructures(): void {
        this.packageNames.clear();
        this.packageContents.subpackages.clear();

        for (const description of this.indexManager.allElements()) {
            const node = this.loadAstNode(description);
            if (!node) {
                continue;
            }

            const packageName = packageNameOrUndefined(node);
            if (!packageName || !this.isValidPackageName(packageName)) {
                /* c8 ignore next 2 */
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

export interface GetDeclarationsOptions {
    /**
     * If specified, only declarations of the given node type are returned.
     */
    readonly nodeType?: string;

    /**
     * If true, internal declarations are hidden.
     */
    readonly hideInternal?: boolean;
}

type PackageNames = Set<string>;
type PackageContents = {
    subpackages: PackageTree;
    ownDeclarations: OwnDeclarations;
};
type PackageTree = Map<string, PackageContents>;
type OwnDeclarations = AstNodeDescription[];
