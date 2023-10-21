import { AstNode, DefaultDocumentSymbolProvider, LangiumDocument } from 'langium';
import { DocumentSymbol, SymbolTag } from 'vscode-languageserver';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import {
    isSdsAnnotatedObject,
    isSdsAnnotation,
    isSdsAttribute, isSdsCallable,
    isSdsClass,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsPipeline,
    isSdsSegment,
} from '../generated/ast.js';
import {SafeDsTypeComputer} from "../typing/safe-ds-type-computer.js";

export class SafeDsDocumentSymbolProvider extends DefaultDocumentSymbolProvider {
    private readonly builtinAnnotations: SafeDsAnnotations;
    private readonly typeComputer: SafeDsTypeComputer;

    constructor(services: SafeDsServices) {
        super(services);

        this.builtinAnnotations = services.builtins.Annotations;
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
                    tags: this.getTags(node),
                    detail: this.getDetails(node),
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

    private getDetails(node: AstNode): string | undefined {
        if (isSdsFunction(node) || isSdsSegment(node)) {
            const type = this.typeComputer.computeType(node);
            return type?.toString();
        }
        return undefined
    }

    private getTags(node: AstNode): SymbolTag[] | undefined {
        if (isSdsAnnotatedObject(node) && this.builtinAnnotations.isDeprecated(node)) {
            return [SymbolTag.Deprecated]
        } else {
            return undefined;
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
