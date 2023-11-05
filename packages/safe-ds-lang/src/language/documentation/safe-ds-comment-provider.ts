import { AstNode, DefaultCommentProvider, isAstNodeWithComment } from 'langium';
import { MarkupContent } from 'vscode-languageserver';
import {
    isSdsBlockLambdaResult,
    isSdsDeclaration,
    isSdsParameter,
    isSdsPlaceholder,
    isSdsResult,
    isSdsTypeParameter,
} from '../generated/ast.js';

export class SafeDsCommentProvider extends DefaultCommentProvider {
    override getComment(node: AstNode): string | undefined {
        /* c8 ignore start */ if (isAstNodeWithComment(node)) {
            return node.$comment;
        } /* c8 ignore stop */ else if (
            !isSdsDeclaration(node) ||
            isSdsBlockLambdaResult(node) ||
            isSdsParameter(node) ||
            isSdsPlaceholder(node) ||
            isSdsResult(node) ||
            isSdsTypeParameter(node)
        ) {
            return undefined;
        }

        // The annotation call list is the previous sibling of the declaration in the CST, so we must step past it
        if (node.annotationCallList) {
            return super.getComment(node.annotationCallList);
        } else {
            return super.getComment(node);
        }
    }
}

export const createMarkupContent = (documentation: string | undefined): MarkupContent | undefined => {
    if (!documentation) {
        return undefined;
    }

    return {
        kind: 'markdown',
        value: documentation,
    };
};
