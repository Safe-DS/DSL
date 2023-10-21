import {AstNode, DefaultDocumentSymbolProvider, LangiumDocument} from 'langium';
import {DocumentSymbol, SymbolTag} from 'vscode-languageserver';
import {SafeDsServices} from "../safe-ds-module.js";
import {SafeDsAnnotations} from "../builtins/safe-ds-annotations.js";
import {isSdsAnnotatedObject} from "../generated/ast.js";

export class SafeDsDocumentSymbolProvider extends DefaultDocumentSymbolProvider {
    private readonly builtinAnnotations: SafeDsAnnotations;

    constructor(services: SafeDsServices) {
        super(services);

        this.builtinAnnotations = services.builtins.Annotations
    }

    protected override getSymbol(document: LangiumDocument, astNode: AstNode): DocumentSymbol[] {
        const node = astNode.$cstNode;
        const nameNode = this.nameProvider.getNameNode(astNode);
        if (nameNode && node) {
            const name = this.nameProvider.getName(astNode);
            const isDeprecated = isSdsAnnotatedObject(astNode) && this.builtinAnnotations.isDeprecated(astNode);

            return [
                {
                    name: name ?? nameNode.text,
                    kind: this.nodeKindProvider.getSymbolKind(astNode),
                    tags: isDeprecated ? [ SymbolTag.Deprecated ] : undefined,
                    range: node.range,
                    selectionRange: nameNode.range,
                    children: this.getChildSymbols(document, astNode),
                },
            ];
        } else {
            return this.getChildSymbols(document, astNode) || [];
        }
    }
}
