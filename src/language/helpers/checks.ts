import { isSdsAttribute, isSdsClass, isSdsEnum, isSdsFunction, SdsClassMember, SdsImport } from '../generated/ast.js';

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

export const isWildcardImport = function (node: SdsImport): boolean {
    const importedNamespace = node.importedNamespace ?? '';
    return importedNamespace.endsWith('*');
};
