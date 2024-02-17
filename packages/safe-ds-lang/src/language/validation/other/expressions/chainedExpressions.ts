import { SafeDsServices } from '../../../safe-ds-module.js';
import { isSdsCall, isSdsIndexedAccess, isSdsMemberAccess, SdsChainedExpression } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { UnknownType } from '../../../typing/model.js';

export const CODE_CHAINED_EXPRESSION_MISSING_NULL_SAFETY = 'chained-expression/missing-null-safety';

export const chainedExpressionsMustBeNullSafeIfReceiverIsNullable = (services: SafeDsServices) => {
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsChainedExpression, accept: ValidationAcceptor): void => {
        if (node.isNullSafe) {
            return;
        }

        const receiverType = typeComputer.computeType(node.receiver);
        if (receiverType === UnknownType || !typeChecker.canBeNull(receiverType)) {
            return;
        }

        if (isSdsCall(node) && typeChecker.canBeCalled(receiverType)) {
            accept('error', 'The receiver can be null so a null-safe call must be used.', {
                node,
                code: CODE_CHAINED_EXPRESSION_MISSING_NULL_SAFETY,
            });
        } else if (isSdsIndexedAccess(node) && typeChecker.canBeAccessedByIndex(receiverType)) {
            accept('error', 'The receiver can be null so a null-safe indexed access must be used.', {
                node,
                code: CODE_CHAINED_EXPRESSION_MISSING_NULL_SAFETY,
            });
        } else if (isSdsMemberAccess(node)) {
            accept('error', 'The receiver can be null so a null-safe member access must be used.', {
                node,
                code: CODE_CHAINED_EXPRESSION_MISSING_NULL_SAFETY,
            });
        }
    };
};
