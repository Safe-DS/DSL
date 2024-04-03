import { type AstNode, AstUtils, CstUtils, type ReferenceDescription, stream, type Stream } from 'langium';
import { type TypeHierarchyItem } from 'vscode-languageserver';
import {
    isSdsClass,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsParentTypeList,
    SdsClass,
    SdsEnum,
    SdsEnumVariant,
} from '../generated/ast.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsClassHierarchy } from '../typing/safe-ds-class-hierarchy.js';
import { SafeDsNodeInfoProvider } from './safe-ds-node-info-provider.js';
import { getEnumVariants } from '../helpers/nodeProperties.js';
import { AbstractTypeHierarchyProvider, type NodeKindProvider } from 'langium/lsp';

export class SafeDsTypeHierarchyProvider extends AbstractTypeHierarchyProvider {
    private readonly classHierarchy: SafeDsClassHierarchy;
    private readonly nodeKindProvider: NodeKindProvider;
    private readonly nodeInfoProvider: SafeDsNodeInfoProvider;

    constructor(services: SafeDsServices) {
        super(services);
        this.classHierarchy = services.typing.ClassHierarchy;
        this.nodeKindProvider = services.shared.lsp.NodeKindProvider;
        this.nodeInfoProvider = services.lsp.NodeInfoProvider;
    }

    protected override getTypeHierarchyItem(targetNode: AstNode): Partial<TypeHierarchyItem> | undefined {
        {
            return {
                kind: this.nodeKindProvider.getSymbolKind(targetNode),
                tags: this.nodeInfoProvider.getTags(targetNode),
                detail: this.nodeInfoProvider.getDetails(targetNode),
            };
        }
    }

    protected override getSupertypes(node: AstNode): TypeHierarchyItem[] | undefined {
        if (isSdsClass(node)) {
            return this.getSupertypesOfClass(node);
        } else if (isSdsEnumVariant(node)) {
            return this.getSupertypesOfEnumVariant(node);
        } else {
            return undefined;
        }
    }

    private getSupertypesOfClass(node: SdsClass): TypeHierarchyItem[] | undefined {
        const parentClass = this.classHierarchy.streamProperSuperclasses(node).head();
        if (!parentClass) {
            /* c8 ignore next 2 */
            return undefined;
        }

        return this.getTypeHierarchyItems(parentClass, AstUtils.getDocument(parentClass));
    }

    private getSupertypesOfEnumVariant(node: SdsEnumVariant): TypeHierarchyItem[] | undefined {
        const containingEnum = AstUtils.getContainerOfType(node, isSdsEnum);
        if (!containingEnum) {
            /* c8 ignore next 2 */
            return undefined;
        }

        return this.getTypeHierarchyItems(containingEnum, AstUtils.getDocument(containingEnum));
    }

    protected override getSubtypes(node: AstNode): TypeHierarchyItem[] | undefined {
        const references = this.references.findReferences(node, {
            includeDeclaration: false,
        });

        let items: TypeHierarchyItem[];

        if (isSdsClass(node)) {
            items = this.getSubtypesOfClass(references);
        } else if (isSdsEnum(node)) {
            items = this.getSubtypesOfEnum(node);
        } else {
            return undefined;
        }

        return items.length === 0 ? undefined : items;
    }

    private getSubtypesOfClass(references: Stream<ReferenceDescription>): TypeHierarchyItem[] {
        return references
            .flatMap((it) => {
                const document = this.documents.getDocument(it.sourceUri);
                if (!document) {
                    /* c8 ignore next 2 */
                    return [];
                }

                const rootNode = document.parseResult.value;
                if (!rootNode.$cstNode) {
                    /* c8 ignore next 2 */
                    return [];
                }

                const targetCstNode = CstUtils.findLeafNodeAtOffset(rootNode.$cstNode, it.segment.offset);
                if (!targetCstNode) {
                    /* c8 ignore next 2 */
                    return [];
                }

                // Only consider the first parent type
                const targetNode = targetCstNode.astNode;
                if (!isSdsParentTypeList(targetNode.$container) || targetNode.$containerIndex !== 0) {
                    return [];
                }

                const containingClass = AstUtils.getContainerOfType(targetNode, isSdsClass);
                if (!containingClass) {
                    /* c8 ignore next 2 */
                    return [];
                }

                return this.getTypeHierarchyItems(containingClass, document) ?? [];
            })
            .toArray();
    }

    private getSubtypesOfEnum(node: SdsEnum): TypeHierarchyItem[] {
        const variants = getEnumVariants(node);
        const document = AstUtils.getDocument(node);

        return stream(variants)
            .flatMap((it) => this.getTypeHierarchyItems(it, document) ?? [])
            .toArray();
    }
}
