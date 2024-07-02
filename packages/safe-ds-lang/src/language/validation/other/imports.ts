import { ValidationAcceptor } from 'langium';
import { SdsImport } from '../../generated/ast.js';
import { SafeDsServices } from '../../safe-ds-module.js';
import { isEmpty } from '../../../helpers/collections.js';

export const CODE_IMPORT_EMPTY_PACKAGE = 'import/empty-package';

export const importPackageMustNotBeEmpty =
    (services: SafeDsServices) =>
    (node: SdsImport, accept: ValidationAcceptor): void => {
        const declarationsInPackage = services.workspace.PackageManager.getDeclarationsInPackage(node.package);
        if (isEmpty(declarationsInPackage)) {
            accept('error', `The package '${node.package}' is empty.`, {
                node,
                property: 'package',
                code: CODE_IMPORT_EMPTY_PACKAGE,
            });
        }
    };
