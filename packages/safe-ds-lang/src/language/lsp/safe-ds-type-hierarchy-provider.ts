import {
    type AstNode,
    findDeclarationNodeAtOffset,
    getDocument,
    type GrammarConfig,
    type LangiumDocument,
    type LangiumDocuments,
    type LangiumServices,
    type NameProvider,
    type ReferenceDescription,
    type References,
    type Stream,
    URI,
} from 'langium';
import {
    type CancellationToken,
    SymbolKind,
    type TypeHierarchyItem,
    type TypeHierarchyPrepareParams,
    type TypeHierarchySubtypesParams,
    type TypeHierarchySupertypesParams,
} from 'vscode-languageserver';
import { isSdsClass } from '../generated/ast.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsClassHierarchy } from '../typing/safe-ds-class-hierarchy.js';

export interface TypeHierarchyProvider {
    prepareTypeHierarchy(
        document: LangiumDocument,
        params: TypeHierarchyPrepareParams,
        cancelToken?: CancellationToken,
    ): TypeHierarchyItem[] | undefined;

    supertypes(params: TypeHierarchySupertypesParams, cancelToken?: CancellationToken): TypeHierarchyItem[] | undefined;

    subtypes(params: TypeHierarchySubtypesParams, cancelToken?: CancellationToken): TypeHierarchyItem[] | undefined;
}

export abstract class AbstractTypeHierarchyProvider implements TypeHierarchyProvider {
    protected readonly grammarConfig: GrammarConfig;
    protected readonly nameProvider: NameProvider;
    protected readonly documents: LangiumDocuments;
    protected readonly references: References;

    protected constructor(services: LangiumServices) {
        this.grammarConfig = services.parser.GrammarConfig;
        this.nameProvider = services.references.NameProvider;
        this.documents = services.shared.workspace.LangiumDocuments;
        this.references = services.references.References;
    }

    prepareTypeHierarchy(
        document: LangiumDocument,
        params: TypeHierarchyPrepareParams,
        _cancelToken?: CancellationToken,
    ): TypeHierarchyItem[] | undefined {
        const rootNode = document.parseResult.value;
        const targetNode = findDeclarationNodeAtOffset(
            rootNode.$cstNode,
            document.textDocument.offsetAt(params.position),
            this.grammarConfig.nameRegexp,
        );
        if (!targetNode) {
            return undefined;
        }

        const declarationNode = this.references.findDeclarationNode(targetNode);
        if (!declarationNode) {
            return undefined;
        }

        return this.getTypeHierarchyItems(declarationNode.astNode, document);
    }

    protected getTypeHierarchyItems(targetNode: AstNode, document: LangiumDocument): TypeHierarchyItem[] | undefined {
        const nameNode = this.nameProvider.getNameNode(targetNode);
        const name = this.nameProvider.getName(targetNode);
        if (!nameNode || !targetNode.$cstNode || name === undefined) {
            return undefined;
        }

        return [
            {
                kind: SymbolKind.Method,
                name,
                range: targetNode.$cstNode.range,
                selectionRange: nameNode.range,
                uri: document.uri.toString(),
                ...this.getTypeHierarchyItem(targetNode),
            },
        ];
    }

    protected getTypeHierarchyItem(_targetNode: AstNode): Partial<TypeHierarchyItem> | undefined {
        return undefined;
    }

    supertypes(
        params: TypeHierarchySupertypesParams,
        _cancelToken?: CancellationToken,
    ): TypeHierarchyItem[] | undefined {
        const document = this.documents.getOrCreateDocument(URI.parse(params.item.uri));
        const rootNode = document.parseResult.value;
        const targetNode = findDeclarationNodeAtOffset(
            rootNode.$cstNode,
            document.textDocument.offsetAt(params.item.range.start),
            this.grammarConfig.nameRegexp,
        );
        if (!targetNode) {
            return undefined;
        }
        return this.getSupertypes(targetNode.astNode);
    }

    /**
     * Override this method to collect the supertypes for your language.
     */
    protected abstract getSupertypes(node: AstNode): TypeHierarchyItem[] | undefined;

    subtypes(params: TypeHierarchySubtypesParams, _cancelToken?: CancellationToken): TypeHierarchyItem[] | undefined {
        const document = this.documents.getOrCreateDocument(URI.parse(params.item.uri));
        const rootNode = document.parseResult.value;
        const targetNode = findDeclarationNodeAtOffset(
            rootNode.$cstNode,
            document.textDocument.offsetAt(params.item.range.start),
            this.grammarConfig.nameRegexp,
        );
        if (!targetNode) {
            return undefined;
        }

        const references = this.references.findReferences(targetNode.astNode, {
            includeDeclaration: false,
        });
        return this.getSubtypes(targetNode.astNode, references);
    }

    /**
     * Override this method to collect the subtypes for your language.
     */
    protected abstract getSubtypes(
        node: AstNode,
        references: Stream<ReferenceDescription>,
    ): TypeHierarchyItem[] | undefined;
}

export class SafeDsTypeHierarchyProvider extends AbstractTypeHierarchyProvider {
    private readonly classHierarchy: SafeDsClassHierarchy;

    constructor(services: SafeDsServices) {
        super(services);
        this.classHierarchy = services.types.ClassHierarchy;
    }

    protected getSubtypes(_node: AstNode, _references: Stream<ReferenceDescription>): TypeHierarchyItem[] | undefined {
        return undefined;
    }

    protected getSupertypes(node: AstNode): TypeHierarchyItem[] | undefined {
        if (!isSdsClass(node)) {
            return undefined;
        }

        const parentClass = this.classHierarchy.parentClassOrUndefined(node);
        if (!parentClass) {
            return undefined;
        }

        return this.getTypeHierarchyItems(parentClass, getDocument(parentClass));
    }
}
