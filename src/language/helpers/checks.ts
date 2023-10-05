import {
    isSdsAttribute,
    isSdsClass,
    isSdsEnum,
    isSdsFunction,
    isSdsSegment,
    SdsArgument,
    SdsClassMember,
    SdsDeclaration, SdsParameter,
} from '../generated/ast.js';

export const isInternal = (node: SdsDeclaration): boolean => {
    return isSdsSegment(node) && node.visibility === 'internal';
};

export const isNamedArgument = (node: SdsArgument): boolean => {
    return Boolean(node.parameter);
};

export const isStatic = (node: SdsClassMember): boolean => {
    if (isSdsClass(node) || isSdsEnum(node)) {
        return true;
    } else if (isSdsAttribute(node)) {
        return node.isStatic;
    } else if (isSdsFunction(node)) {
        return node.isStatic;
    } else {
        /* c8 ignore next 2 */
        return false;
    }
};
