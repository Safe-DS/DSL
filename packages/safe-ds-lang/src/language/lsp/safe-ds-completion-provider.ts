import { CompletionContext, CompletionValueItem, DefaultCompletionProvider } from 'langium/lsp';
import { AstNode, AstNodeDescription, ReferenceInfo, Stream } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import { CompletionItemTag, MarkupContent } from 'vscode-languageserver';
import { createMarkupContent } from '../documentation/safe-ds-comment-provider.js';
import { SafeDsDocumentationProvider } from '../documentation/safe-ds-documentation-provider.js';
import type { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import {
    isSdsAnnotatedObject,
    isSdsAttribute,
    isSdsFunction,
    isSdsNamedType,
    isSdsReference,
    isSdsSegment,
} from '../generated/ast.js';
import { SafeDsTypeComputer } from '../typing/safe-ds-type-computer.js';

export class SafeDsCompletionProvider extends DefaultCompletionProvider {
    private readonly builtinAnnotations: SafeDsAnnotations;
    private readonly documentationProvider: SafeDsDocumentationProvider;
    private readonly typeComputer: SafeDsTypeComputer;

    readonly completionOptions = {
        triggerCharacters: ['.', '@'],
    };

    constructor(service: SafeDsServices) {
        super(service);

        this.builtinAnnotations = service.builtins.Annotations;
        this.documentationProvider = service.documentation.DocumentationProvider;
        this.typeComputer = service.typing.TypeComputer;
    }

    protected override getReferenceCandidates(
        refInfo: ReferenceInfo,
        context: CompletionContext,
    ): Stream<AstNodeDescription> {
        this.fixReferenceInfo(refInfo);
        return super.getReferenceCandidates(refInfo, context);
    }

    private fixReferenceInfo(refInfo: ReferenceInfo): void {
        if (isSdsNamedType(refInfo.container) && refInfo.container.$containerProperty === 'declaration') {
            const syntheticNode = refInfo.container.$container as AstNode;
            if (isSdsNamedType(syntheticNode) && syntheticNode.$containerProperty === 'member') {
                refInfo.container = {
                    ...refInfo.container,
                    $container: syntheticNode.$container,
                    $containerProperty: 'member',
                };
            } else {
                refInfo.container = {
                    ...refInfo.container,
                    $containerProperty: 'member',
                };
            }
        } else if (isSdsReference(refInfo.container) && refInfo.container.$containerProperty === 'member') {
            const syntheticNode = refInfo.container.$container as AstNode;
            if (isSdsReference(syntheticNode) && syntheticNode.$containerProperty === 'member') {
                refInfo.container = {
                    ...refInfo.container,
                    $container: syntheticNode.$container,
                    $containerProperty: 'member',
                };
            }
        }
    }

    protected override createReferenceCompletionItem(nodeDescription: AstNodeDescription): CompletionValueItem {
        const node = nodeDescription.node;

        return {
            nodeDescription,
            detail: this.getDetails(node),
            documentation: this.getDocumentation(node),
            kind: this.nodeKindProvider.getCompletionItemKind(nodeDescription),
            tags: this.getTags(node),
            sortText: '0',
        };
    }

    private getDetails(node: AstNode | undefined): string | undefined {
        if (isSdsAttribute(node)) {
            return `${node.name}: ${this.typeComputer.computeType(node)}`;
        } else if (isSdsFunction(node) || isSdsSegment(node)) {
            return `${node.name}${this.typeComputer.computeType(node)?.toString()}`;
        } else {
            return undefined;
        }
    }

    private getDocumentation(node: AstNode | undefined): MarkupContent | undefined {
        if (!node) {
            return undefined;
        }

        const documentation = this.documentationProvider.getDescription(node);
        return createMarkupContent(documentation);
    }

    private getTags(node: AstNode | undefined): CompletionItemTag[] | undefined {
        if (isSdsAnnotatedObject(node) && this.builtinAnnotations.callsDeprecated(node)) {
            return [CompletionItemTag.Deprecated];
        } else {
            return undefined;
        }
    }
}
