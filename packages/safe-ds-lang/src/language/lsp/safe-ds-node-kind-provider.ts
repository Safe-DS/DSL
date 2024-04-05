import { AstNode, AstNodeDescription, AstUtils, isAstNode } from 'langium';
import { CompletionItemKind, SymbolKind } from 'vscode-languageserver';
import {
    isSdsClass,
    isSdsFunction,
    SdsAnnotation,
    SdsAttribute,
    SdsBlockLambdaResult,
    SdsClass,
    SdsEnum,
    SdsEnumVariant,
    SdsFunction,
    SdsModule,
    SdsParameter,
    SdsPipeline,
    SdsPlaceholder,
    SdsResult,
    SdsSchema,
    SdsSegment,
    SdsTypeParameter,
} from '../generated/ast.js';
import { NodeKindProvider } from 'langium/lsp';

export class SafeDsNodeKindProvider implements NodeKindProvider {
    getSymbolKind(nodeOrDescription: AstNode | AstNodeDescription): SymbolKind {
        // The WorkspaceSymbolProvider only passes descriptions, where the node might be undefined
        const node = this.getNode(nodeOrDescription);
        if (isSdsFunction(node) && AstUtils.hasContainerOfType(node, isSdsClass)) {
            return SymbolKind.Method;
        }

        /* c8 ignore start */
        const type = this.getNodeType(nodeOrDescription);
        switch (type) {
            case SdsAnnotation:
                return SymbolKind.Interface;
            case SdsAttribute:
                return SymbolKind.Property;
            case SdsBlockLambdaResult:
                return SymbolKind.Variable;
            case SdsClass:
                return SymbolKind.Class;
            case SdsEnum:
                return SymbolKind.Enum;
            case SdsEnumVariant:
                return SymbolKind.EnumMember;
            case SdsFunction:
                return SymbolKind.Function;
            case SdsModule:
                return SymbolKind.Package;
            case SdsParameter:
                return SymbolKind.Variable;
            case SdsPipeline:
                return SymbolKind.Function;
            case SdsPlaceholder:
                return SymbolKind.Variable;
            case SdsResult:
                return SymbolKind.Variable;
            case SdsSchema:
                return SymbolKind.Struct;
            case SdsSegment:
                return SymbolKind.Function;
            case SdsTypeParameter:
                return SymbolKind.TypeParameter;
            default:
                return SymbolKind.Null;
        }
        /* c8 ignore stop */
    }

    getCompletionItemKind(nodeOrDescription: AstNode | AstNodeDescription): CompletionItemKind {
        // The WorkspaceSymbolProvider only passes descriptions, where the node might be undefined
        const node = this.getNode(nodeOrDescription);
        if (isSdsFunction(node) && AstUtils.hasContainerOfType(node, isSdsClass)) {
            return CompletionItemKind.Method;
        }

        /* c8 ignore start */
        const type = this.getNodeType(nodeOrDescription);
        switch (type) {
            case SdsAnnotation:
                return CompletionItemKind.Interface;
            case SdsAttribute:
                return CompletionItemKind.Property;
            case SdsBlockLambdaResult:
                return CompletionItemKind.Variable;
            case SdsClass:
                return CompletionItemKind.Class;
            case SdsEnum:
                return CompletionItemKind.Enum;
            case SdsEnumVariant:
                return CompletionItemKind.EnumMember;
            case SdsFunction:
                return CompletionItemKind.Function;
            case SdsModule:
                return CompletionItemKind.Module;
            case SdsParameter:
                return CompletionItemKind.Variable;
            case SdsPipeline:
                return CompletionItemKind.Function;
            case SdsPlaceholder:
                return CompletionItemKind.Variable;
            case SdsResult:
                return CompletionItemKind.Variable;
            case SdsSchema:
                return CompletionItemKind.Struct;
            case SdsSegment:
                return CompletionItemKind.Function;
            case SdsTypeParameter:
                return CompletionItemKind.TypeParameter;
            default:
                return CompletionItemKind.Reference;
        }
        /* c8 ignore stop */
    }

    private getNode(nodeOrDescription: AstNode | AstNodeDescription): AstNode | undefined {
        if (isAstNode(nodeOrDescription)) {
            return nodeOrDescription;
        } /* c8 ignore start */ else {
            return nodeOrDescription.node;
        } /* c8 ignore stop */
    }

    private getNodeType(nodeOrDescription: AstNode | AstNodeDescription): string {
        if (isAstNode(nodeOrDescription)) {
            return nodeOrDescription.$type;
        } /* c8 ignore start */ else {
            return nodeOrDescription.type;
        } /* c8 ignore stop */
    }
}
