import {
    isSdsAssignment,
    isSdsExpressionStatement,
    isSdsWildcard,
    SdsExpression,
    SdsStatement,
} from '../../../generated/ast.js';
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
    const statementExpressionDoesSomething = statementExpressionDoesSomethingProvider(services);

    return (node: SdsStatement): boolean => {
        if (isSdsAssignment(node)) {
            return !getAssignees(node).every(isSdsWildcard) || statementExpressionDoesSomething(node.expression);
        } else if (isSdsExpressionStatement(node)) {
            return statementExpressionDoesSomething(node.expression);
        }
        return false;
    };
};

const statementExpressionDoesSomethingProvider = (services: SafeDsServices) => {
    const callGraphComputer = services.flow.CallGraphComputer;
    const purityComputer = services.purity.PurityComputer;

    return (node: SdsExpression | undefined): boolean => {
        if (!node) {
            return false;
        }

        return (
            callGraphComputer.getAllContainedCalls(node).some((it) => callGraphComputer.isRecursive(it)) ||
            !purityComputer.isPureExpression(node)
        );
    };
};
