import {
    AstNode,
    AstUtils,
    isJSDoc,
    JSDocComment,
    JSDocDocumentationProvider,
    JSDocElement,
    JSDocRenderOptions,
    type JSDocTag,
    parseJSDoc,
} from 'langium';
import {
    isSdsCallable,
    isSdsDeclaration,
    isSdsParameter,
    isSdsResult,
    isSdsTypeParameter,
    SdsDeclaration,
    SdsParameter,
    SdsResult,
    SdsTypeParameter,
} from '../generated/ast.js';
import { isEmpty } from '../../helpers/collections.js';

const PARAM_TAG = 'param';
const RESULT_TAG = 'result';
const SINCE_TAG = 'since';
const TYPE_PARAM_TAG = 'typeParam';

export class SafeDsDocumentationProvider extends JSDocDocumentationProvider {
    /**
     * Returns the documentation of the given node as a Markdown string.
     */
    override getDocumentation(node: AstNode, linkRenderer?: LinkRenderer): string | undefined {
        if (isSdsParameter(node) || isSdsResult(node) || isSdsTypeParameter(node)) {
            const containingCallable = AstUtils.getContainerOfType(node, isSdsCallable);
            if (!containingCallable) {
                /* c8 ignore next 2 */
                return undefined;
            }

            const comment = this.getJSDocComment(containingCallable);
            if (!comment) {
                return undefined;
            }

            return this.getMatchingTagContent(comment, node, linkRenderer)?.trim();
        } else {
            const comment = this.getJSDocComment(node);
            return comment?.toMarkdown(this.createRenderOptions(node, linkRenderer))?.trim();
        }
    }

    /**
     * Returns the description of the given node as a Markdown string, which is the documentation without tags.
     *
     * Compared to {@link getDocumentation}, this method also removes a single leading space from each line, if all
     * lines have one. Moreover, inline link tags are rendered differently.
     */
    getDescription(node: AstNode, linkRenderer?: LinkRenderer): string | undefined {
        if (isSdsParameter(node) || isSdsResult(node) || isSdsTypeParameter(node)) {
            return this.getDocumentation(node, linkRenderer);
        } else {
            const comment = this.getJSDocComment(node);
            if (!comment) {
                return undefined;
            }

            // Remove all elements starting from the first block tag
            const firstBlockTag = comment.elements.findIndex(isBlockTag);
            if (firstBlockTag > -1) {
                comment.elements.splice(firstBlockTag);
            }

            // Remove a single leading space from each line
            const [first, ...rest] = comment
                .toMarkdown(this.createRenderOptions(node, linkRenderer))
                .split('\n')
                .map((it) => it.trimEnd());

            if (rest.every((it) => isEmpty(it) || it.startsWith(' '))) {
                return [first, ...rest.map((it) => it.slice(1))].join('\n');
            } else {
                return [first, ...rest].join('\n');
            }
        }
    }

    /**
     * Returns the value of the first `@since` tag of the given node. If the tag is not present, `undefined` is
     * returned.
     */
    getSince(node: AstNode): string | undefined {
        const comment = this.getJSDocComment(node);
        const sinceTag = comment?.getTag(SINCE_TAG);
        return sinceTag?.content.toMarkdown(this.createRenderOptions(node)).trim();
    }

    private getJSDocComment(node: AstNode): JSDocComment | undefined {
        const comment = this.commentProvider.getComment(node);
        if (comment && isJSDoc(comment)) {
            return parseJSDoc(comment);
        }
        return undefined;
    }

    private getMatchingTagContent(
        comment: JSDocComment,
        node: SdsParameter | SdsResult | SdsTypeParameter,
        linkRenderer?: LinkRenderer,
    ): string | undefined {
        const name = node.name;
        if (!name) {
            /* c8 ignore next 2 */
            return undefined;
        }

        const tagName = this.getTagName(node);
        const matchRegex = new RegExp(`^${name}\\s+(?<content>[\\s\\S]*)`, 'u');

        return comment
            .getTags(tagName)
            .map((it) => it.content.toMarkdown(this.createRenderOptions(node, linkRenderer)))
            .find((it) => matchRegex.test(it))
            ?.match(matchRegex)
            ?.groups?.content?.replaceAll(/\s+/gu, ' ');
    }

    private getTagName(node: SdsParameter | SdsResult | SdsTypeParameter): string {
        if (isSdsParameter(node)) {
            return PARAM_TAG;
        } else if (isSdsResult(node)) {
            return RESULT_TAG;
        } else {
            return TYPE_PARAM_TAG;
        }
    }

    private createRenderOptions(node: AstNode, linkRenderer?: LinkRenderer): JSDocRenderOptions {
        return {
            tag: 'bold',
            renderTag: (tag: JSDocTag) => {
                if (tag.name === PARAM_TAG || tag.name === RESULT_TAG || tag.name === TYPE_PARAM_TAG) {
                    const contentMd = tag.content.toMarkdown();
                    const [name, description] = contentMd.split(/\s(.*)/su);
                    return `**@${tag.name}** *${name}* — ${(description ?? '').trim()}`;
                } else {
                    return super.documentationTagRenderer(node, tag);
                }
            },
            renderLink: (name, display) => {
                if (!linkRenderer) {
                    return super.documentationLinkRenderer(node, name, display);
                }

                const description =
                    this.findNameInPrecomputedScopes(node, name) ?? this.findNameInGlobalScope(node, name);
                const target = description?.node;

                if (isSdsDeclaration(target)) {
                    return linkRenderer(target, display);
                } else {
                    return linkRenderer(undefined, display);
                }
            },
        };
    }
}

const isBlockTag = (element: JSDocElement): element is JSDocTag => {
    return isTag(element) && !element.inline;
};

const isTag = (element: JSDocElement): element is JSDocTag => {
    return 'name' in element;
};

type LinkRenderer = (target: SdsDeclaration | undefined, display: string) => string | undefined;
