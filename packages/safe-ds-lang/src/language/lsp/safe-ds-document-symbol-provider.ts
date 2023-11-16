import { type AstNode, DefaultDocumentSymbolProvider, type LangiumDocument } from 'langium';
import type { DocumentSymbol } from 'vscode-languageserver';
import type { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import {
    isSdsAnnotation,
    isSdsAttribute,
    isSdsClass,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsPipeline,
    isSdsSegment,
} from '../generated/ast.js';
import type { SafeDsServices } from '../safe-ds-module.js';
import type { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';
import type { SafeDsNodeInfoProvider } from './safe-ds-node-info-provider.js';

export class SafeDsDocumentSymbolProvider extends DefaultDocumentSymbolProvider {
    private readonly builtinAnnotations: SafeDsAnnotations;
    private readonly nodeInfoProvider: SafeDsNodeInfoProvider;
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        super(services);

        this.builtinAnnotations = services.builtins.Annotations;
        this.nodeInfoProvider = services.lsp.NodeInfoProvider;
        this.typeComputer = services.types.TypeComputer;
    }

    protected override getSymbol(document: LangiumDocument, node: AstNode): DocumentSymbol[] {
        const cstNode = node.$cstNode;
        const nameNode = this.nameProvider.getNameNode(node);
        if (nameNode && cstNode) {
            const name = this.nameProvider.getName(node);
            return [
                {
                    name: name ?? nameNode.text,
                    kind: this.nodeKindProvider.getSymbolKind(node),
                    tags: this.nodeInfoProvider.getTags(node),
                    detail: this.nodeInfoProvider.getDetails(node),
                    range: cstNode.range,
                    selectionRange: nameNode.range,
                    children: this.getChildSymbols(document, node),
                },
            ];
        } else {
            return this.getChildSymbols(document, node) || [];
        }
    }

    protected override getChildSymbols(document: LangiumDocument, node: AstNode): DocumentSymbol[] | undefined {
        if (this.isLeaf(node)) {
            return undefined;
        } else if (isSdsClass(node)) {
            if (node.body) {
                return super.getChildSymbols(document, node.body);
            } else {
                return undefined;
            }
        } else {
            return super.getChildSymbols(document, node);
        }
    }

    private isLeaf(node: AstNode): boolean {
        return (
            isSdsAnnotation(node) ||
            isSdsAttribute(node) ||
            isSdsEnumVariant(node) ||
            isSdsFunction(node) ||
            isSdsPipeline(node) ||
            isSdsSegment(node)
        );
    }
}
