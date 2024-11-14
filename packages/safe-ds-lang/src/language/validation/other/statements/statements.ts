import { isSdsAssignment, isSdsExpressionStatement, isSdsWildcard, SdsStatement } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { NamedTupleType } from '../../../typing/model.js';
import { getAssignees } from '../../../helpers/nodeProperties.js';

export const CODE_STATEMENT_HAS_NO_EFFECT = 'statement/has-no-effect';

export const statementMustDoSomething = (services: SafeDsServices) => {
    const purityComputer = services.purity.PurityComputer;
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsStatement, accept: ValidationAcceptor): void => {
        if (isSdsAssignment(node)) {
            if (getAssignees(node).every(isSdsWildcard) && !purityComputer.expressionHasSideEffects(node.expression)) {
                accept('warning', 'This statement does nothing.', {
                    node,
                    code: CODE_STATEMENT_HAS_NO_EFFECT,
                });
            }
        } else if (isSdsExpressionStatement(node)) {
            if (purityComputer.expressionHasSideEffects(node.expression)) {
                return;
            }

            let message = 'This statement does nothing.';
            const expressionType = typeComputer.computeType(node.expression);
            if (!(expressionType instanceof NamedTupleType) || expressionType.length > 0) {
                message += ' Did you mean to assign or output the result?';
            }

            accept('warning', message, {
                node,
                code: CODE_STATEMENT_HAS_NO_EFFECT,
            });
        }
    };
};
