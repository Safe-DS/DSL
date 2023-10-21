import { AstNode, DefaultDocumentSymbolProvider, LangiumDocument } from 'langium';
import { DocumentSymbol, SymbolTag } from 'vscode-languageserver';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import {
    isSdsAnnotatedObject,
    isSdsAnnotation,
    isSdsAttribute,
    isSdsClass,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsPipeline,
    isSdsSegment,
} from '../generated/ast.js';

export class SafeDsDocumentSymbolProvider extends DefaultDocumentSymbolProvider {
    private readonly builtinAnnotations: SafeDsAnnotations;

    constructor(services: SafeDsServices) {
        super(services);

        this.builtinAnnotations = services.builtins.Annotations;
    }

    protected override getSymbol(document: LangiumDocument, node: AstNode): DocumentSymbol[] {
        const cstNode = node.$cstNode;
        const nameNode = this.nameProvider.getNameNode(node);
        if (nameNode && cstNode) {
            const name = this.nameProvider.getName(node);
            const isDeprecated = isSdsAnnotatedObject(node) && this.builtinAnnotations.isDeprecated(node);

            return [
                {
                    name: name ?? nameNode.text,
                    kind: this.nodeKindProvider.getSymbolKind(node),
                    tags: isDeprecated ? [SymbolTag.Deprecated] : undefined,
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
