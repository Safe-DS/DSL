import {
    AstNode,
    getContainerOfType,
    isJSDoc,
    JSDocComment,
    JSDocDocumentationProvider,
    JSDocRenderOptions,
    parseJSDoc,
} from 'langium';
import {
    isSdsCallable,
    isSdsParameter,
    isSdsResult,
    isSdsTypeParameter,
    SdsParameter,
    SdsResult,
    SdsTypeParameter,
} from '../generated/ast.js';

export class SafeDsDocumentationProvider extends JSDocDocumentationProvider {
    override getDocumentation(node: AstNode): string | undefined {
        if (isSdsParameter(node) || isSdsResult(node) || isSdsTypeParameter(node)) {
            const containingCallable = getContainerOfType(node, isSdsCallable);
            /* c8 ignore start */
            if (!containingCallable) {
                return undefined;
            }
            /* c8 ignore stop */

            const comment = this.getJSDocComment(containingCallable);
            if (!comment) {
                return undefined;
            }

            return this.getMatchingTagContent(comment, node);
        } else {
            const comment = this.getJSDocComment(node);
            return comment?.toMarkdown(this.createJSDocRenderOptions(node));
        }
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
    ): string | undefined {
        const name = node.name;
        /* c8 ignore start */
        if (!name) {
            return undefined;
        }
        /* c8 ignore stop */

        const tagName = this.getTagName(node);
        const matchRegex = new RegExp(`^${name}\\s+(?<content>.*)`, 'u');

        return comment
            .getTags(tagName)
            .map((it) => it.content.toMarkdown(this.createJSDocRenderOptions(node)))
            .find((it) => matchRegex.test(it))
            ?.match(matchRegex)?.groups?.content;
    }

    private getTagName(node: SdsParameter | SdsResult | SdsTypeParameter): string {
        if (isSdsParameter(node)) {
            return 'param';
        } else if (isSdsResult(node)) {
            return 'result';
        } else {
            return 'typeParam';
        }
    }

    private createJSDocRenderOptions(node: AstNode): JSDocRenderOptions {
        return {
            renderLink: (link, display) => {
                return this.documentationLinkRenderer(node, link, display);
            },
        };
    }
}
