import { isSdsExpressionStatement, SdsStatement } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { NamedTupleType } from '../../../typing/model.js';

export const CODE_STATEMENT_HAS_NO_EFFECT = 'statement/has-no-effect';

export const statementMustDoSomething = (services: SafeDsServices) => {
    const purityComputer = services.purity.PurityComputer;
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsStatement, accept: ValidationAcceptor): void => {
        if (purityComputer.statementDoesSomething(node)) {
            return;
        }

        // Special warning message if an assignment is probably missing
        if (isSdsExpressionStatement(node)) {
            const expressionType = typeComputer.computeType(node.expression);
            if (!(expressionType instanceof NamedTupleType) || expressionType.length > 0) {
                accept('warning', 'This statement does nothing. Did you forget the assignment?', {
                    node,
                    code: CODE_STATEMENT_HAS_NO_EFFECT,
                });
                return;
            }
        }

        accept('warning', 'This statement does nothing.', {
            node,
            code: CODE_STATEMENT_HAS_NO_EFFECT,
        });
    };
};
