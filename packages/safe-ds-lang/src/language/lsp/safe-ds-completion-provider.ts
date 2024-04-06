import { CompletionContext, CompletionValueItem, DefaultCompletionProvider } from 'langium/lsp';
import { AstNode, AstNodeDescription, ReferenceInfo, Stream } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import { CompletionItemTag, MarkupContent } from 'vscode-languageserver';
import { createMarkupContent } from '../documentation/safe-ds-comment-provider.js';
import { SafeDsDocumentationProvider } from '../documentation/safe-ds-documentation-provider.js';
import type { SafeDsAnnotations } from '../builtins/safe-ds-annotations.js';
import {
    isSdsAnnotatedObject,
    isSdsModule,
    isSdsNamedType,
    isSdsReference,
    SdsAnnotation,
    SdsPipeline,
    SdsSchema,
} from '../generated/ast.js';
import { getPackageName } from '../helpers/nodeProperties.js';
import { isInPipelineFile, isInStubFile } from '../helpers/fileExtensions.js';

export class SafeDsCompletionProvider extends DefaultCompletionProvider {
    private readonly builtinAnnotations: SafeDsAnnotations;
    private readonly documentationProvider: SafeDsDocumentationProvider;

    readonly completionOptions = {
        triggerCharacters: ['.', '@'],
    };

    constructor(service: SafeDsServices) {
        super(service);

        this.builtinAnnotations = service.builtins.Annotations;
        this.documentationProvider = service.documentation.DocumentationProvider;
    }

    protected override getReferenceCandidates(
        refInfo: ReferenceInfo,
        context: CompletionContext,
    ): Stream<AstNodeDescription> {
        this.fixReferenceInfo(refInfo);
        return super
            .getReferenceCandidates(refInfo, context)
            .filter((description) => this.filterReferenceCandidate(refInfo, description));
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

    private illegalNodeTypesForReferences = new Set([SdsAnnotation, SdsPipeline, SdsSchema]);

    private filterReferenceCandidate(refInfo: ReferenceInfo, description: AstNodeDescription): boolean {
        if (isSdsReference(refInfo.container)) {
            return !this.illegalNodeTypesForReferences.has(description.type);
        } else {
            return true;
        }
    }

    protected override createReferenceCompletionItem(nodeDescription: AstNodeDescription): CompletionValueItem {
        const node = nodeDescription.node;

        return {
            nodeDescription,
            documentation: this.getDocumentation(node),
            kind: this.nodeKindProvider.getCompletionItemKind(nodeDescription),
            tags: this.getTags(node),
            sortText: '0',
        };
    }

    private getDocumentation(node: AstNode | undefined): MarkupContent | undefined {
        if (!node) {
            /* c8 ignore next 2 */
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

    private illegalKeywordsInPipelineFile = new Set(['annotation', 'class', 'enum', 'fun', 'schema']);
    private illegalKeywordsInStubFile = new Set(['pipeline', 'internal', 'private', 'segment']);

    protected override filterKeyword(context: CompletionContext, keyword: Keyword): boolean {
        // Filter out keywords that do not contain any word character
        if (!/\p{L}/u.test(keyword.value)) {
            return false;
        }

        if ((!context.node || isSdsModule(context.node)) && !getPackageName(context.node)) {
            return keyword.value === 'package';
        } else if (isSdsModule(context.node) && isInPipelineFile(context.node)) {
            return !this.illegalKeywordsInPipelineFile.has(keyword.value);
        } else if (isSdsModule(context.node) && isInStubFile(context.node)) {
            return !this.illegalKeywordsInStubFile.has(keyword.value);
        } else {
            return true;
        }
    }
}

export interface Keyword {
    value: string;
}
