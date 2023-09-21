import { ValidationAcceptor } from 'langium';
import { SdsImportAlias } from '../generated/ast.js';
import { isWildcardImport } from '../helpers/astShortcuts.js';

export const CODE_IMPORT_WILDCARD_IMPORT_WITH_ALIAS = 'import/wildcard-import-with-alias';

export const importAliasMustNotBeUsedForWildcardImports = (node: SdsImportAlias, accept: ValidationAcceptor): void => {
    const importNode = node.$container;

    if (importNode && isWildcardImport(importNode)) {
        accept('error', 'A wildcard import must not have an alias.', {
            node,
            code: CODE_IMPORT_WILDCARD_IMPORT_WITH_ALIAS,
        });
    }
};
