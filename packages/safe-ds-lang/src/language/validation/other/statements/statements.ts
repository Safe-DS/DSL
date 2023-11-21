import { isSdsAssignment, isSdsExpressionStatement, isSdsWildcard, SdsStatement } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { getAssignees } from '../../../helpers/nodeProperties.js';

export const CODE_STATEMENT_HAS_NO_EFFECT = 'statement/has-no-effect';

export const statementMustDoSomething = (services: SafeDsServices) => {
    const statementDoesSomething = statementDoesSomethingProvider(services);

    return (node: SdsStatement, accept: ValidationAcceptor): void => {
        if (!statementDoesSomething(node)) {
            accept('warning', 'This statement does nothing.', {
                node,
                code: CODE_STATEMENT_HAS_NO_EFFECT,
            });
        }
    };
};

const statementDoesSomethingProvider = (services: SafeDsServices) => {
    const purityComputer = services.purity.PurityComputer;

    return (node: SdsStatement): boolean => {
        if (isSdsAssignment(node)) {
            return !getAssignees(node).every(isSdsWildcard) || purityComputer.expressionHasSideEffects(node.expression);
        } else if (isSdsExpressionStatement(node)) {
            return purityComputer.expressionHasSideEffects(node.expression);
        } else {
            /* c8 ignore next 2 */
            return false;
        }
    };
};
