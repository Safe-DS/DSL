import { AstNode, hasContainerOfType } from 'langium';

/**
 * Returns whether the inner node is contained in the outer node. If the nodes are equal, this function returns `true`.
 */
export const isContainedIn = (inner: AstNode | undefined, outer: AstNode | undefined): boolean => {
    return hasContainerOfType(inner, (it) => it === outer);
};
