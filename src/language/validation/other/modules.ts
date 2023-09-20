import { ValidationAcceptor } from 'langium';
import { isSdsDeclaration, SdsModule } from '../../generated/ast.js';

export const CODE_MODULE_MISSING_PACKAGE = 'module/missing-package';

export const moduleWithDeclarationsMustStatePackage = (node: SdsModule, accept: ValidationAcceptor): void => {
    if (!node.name) {
        const declarations = node.members.filter(isSdsDeclaration);
        if (declarations.length > 0) {
            accept('error', 'A module with declarations must state its package.', {
                node: declarations[0],
                property: 'name',
                code: CODE_MODULE_MISSING_PACKAGE,
            });
        }
    }
};
