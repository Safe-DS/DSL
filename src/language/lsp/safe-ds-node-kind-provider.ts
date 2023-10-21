import { AstNode, AstNodeDescription, hasContainerOfType, isAstNode, NodeKindProvider } from 'langium';
import { CompletionItemKind, SymbolKind } from 'vscode-languageserver';
import {
    isSdsAnnotation,
    isSdsAttribute,
    isSdsClass,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsFunction,
    isSdsModule,
    isSdsParameter,
    isSdsPipeline,
    isSdsPlaceholder,
    isSdsSegment,
    isSdsTypeParameter,
} from '../generated/ast.js';

export class SafeDsNodeKindProvider implements NodeKindProvider {
    getSymbolKind(nodeOrDescription: AstNode | AstNodeDescription): SymbolKind {
        const node = this.getNode(nodeOrDescription);

        if (isSdsAnnotation(node)) {
            return SymbolKind.Interface;
        } else if (isSdsAttribute(node)) {
            return SymbolKind.Property;
        } else if (isSdsClass(node)) {
            return SymbolKind.Class;
        } else if (isSdsEnum(node)) {
            return SymbolKind.Enum;
        } else if (isSdsEnumVariant(node)) {
            return SymbolKind.EnumMember;
        } else if (isSdsFunction(node)) {
            if (hasContainerOfType(node, isSdsClass)) {
                return SymbolKind.Method;
            } else {
                return SymbolKind.Function;
            }
        } else if (isSdsModule(node)) {
            return SymbolKind.Package;
        } else if (isSdsParameter(node)) {
            return SymbolKind.Variable;
        } else if (isSdsPipeline(node)) {
            return SymbolKind.Function;
        } else if (isSdsPlaceholder(node)) {
            return SymbolKind.Variable;
        } else if (isSdsSegment(node)) {
            return SymbolKind.Function;
        } else if (isSdsTypeParameter(node)) {
            return SymbolKind.TypeParameter;
        } /* c8 ignore start */ else {
            return SymbolKind.Null;
        } /* c8 ignore stop */
    }

    /* c8 ignore start */
    getCompletionItemKind(_nodeOrDescription: AstNode | AstNodeDescription) {
        return CompletionItemKind.Reference;
    }

    /* c8 ignore stop */

    private getNode(nodeOrDescription: AstNode | AstNodeDescription): AstNode | undefined {
        if (isAstNode(nodeOrDescription)) {
            return nodeOrDescription;
        } /* c8 ignore start */ else {
            return nodeOrDescription.node;
        } /* c8 ignore stop */
    }
}
