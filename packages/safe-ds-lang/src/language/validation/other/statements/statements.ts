import { SdsStatement } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';

export const CODE_STATEMENT_HAS_NO_EFFECT = 'statement/has-no-effect';

export const statementMustDoSomething = (services: SafeDsServices) => {
    const purityComputer = services.purity.PurityComputer;

    return (node: SdsStatement, accept: ValidationAcceptor): void => {
        if (!purityComputer.statementDoesSomething(node)) {
            accept('warning', 'This statement does nothing.', {
                node,
                code: CODE_STATEMENT_HAS_NO_EFFECT,
            });
        }
    };
};
