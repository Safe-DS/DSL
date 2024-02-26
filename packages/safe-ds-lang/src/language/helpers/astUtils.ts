import { AstNode, AstUtils } from 'langium';

/**
 * Returns whether the inner node is contained in the outer node or equal to it.
 */
export const isContainedInOrEqual = (inner: AstNode | undefined, outer: AstNode | undefined): boolean => {
    return AstUtils.hasContainerOfType(inner, (it) => it === outer);
};
