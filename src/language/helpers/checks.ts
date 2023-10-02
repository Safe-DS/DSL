import {
    isSdsAttribute,
    isSdsClass,
    isSdsEnum,
    isSdsFunction,
    isSdsWildcardImport,
    SdsClassMember,
    SdsImport
} from '../generated/ast.js';

export const isStatic = (node: SdsClassMember): boolean => {
    if (isSdsClass(node) || isSdsEnum(node)) {
        return true;
    } else if (isSdsAttribute(node)) {
        return node.static;
    } else if (isSdsFunction(node)) {
        return node.static;
    } else {
        /* c8 ignore next 2 */
        return false;
    }
};
