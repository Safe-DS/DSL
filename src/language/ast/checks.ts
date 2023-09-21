import { SdsImport } from '../generated/ast.js';

export const isWildcardImport = function (node: SdsImport): boolean {
    const importedNamespace = node.importedNamespace ?? '';
    return importedNamespace.endsWith('*');
};
