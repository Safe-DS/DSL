import { AstNode, AstUtils } from 'langium';

/**
 * Returns whether the inner node is contained in the outer node or equal to it.
 */
export const isContainedInOrEqual = (inner: AstNode | undefined, outer: AstNode | undefined): boolean => {
    return AstUtils.hasContainerOfType(inner, (it) => it === outer);
};

/**
 * Walk along the hierarchy of containers from the given AST node to the root and
 * return the last node that matches the type predicate. If no container matches, undefined is returned.
 */
export const getOutermostContainerOfType = <T extends AstNode>(
    node: AstNode | undefined,
    typePredicate: (n: AstNode) => n is T,
): T | undefined => {
    let item = node;
    let lastValidItem = undefined;
    while (item) {
        if (typePredicate(item)) {
            lastValidItem = item;
        }
        item = item.$container;
    }
    return lastValidItem;
}
