import { SdsInfixOperation } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { FloatConstant, IntConstant, NumberConstant } from '../../../partialEvaluation/model.js';
import { UnknownType } from '../../../typing/model.js';

export const CODE_INFIX_OPERATION_DIVISION_BY_ZERO = 'infix-operation/division-by-zero';

export const divisionDivisorMustNotBeZero = (services: SafeDsServices) => {
    const coreTypes = services.types.CoreTypes;
    const partialEvaluator = services.evaluation.PartialEvaluator;
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;

    const zeroInt = new IntConstant(0n);
    const zeroFloat = new FloatConstant(0.0);
    const minusZeroFloat = new FloatConstant(-0.0);

    return (node: SdsInfixOperation, accept: ValidationAcceptor): void => {
        if (node.operator !== '/') {
            return;
        }

        const dividendType = typeComputer.computeType(node.leftOperand);
        if (
            dividendType === UnknownType ||
            (!typeChecker.isSubtypeOf(dividendType, coreTypes.Float) &&
                !typeChecker.isSubtypeOf(dividendType, coreTypes.Int))
        ) {
            return;
        }

        const divisorValue = partialEvaluator.evaluate(node.rightOperand);
        if (
            divisorValue instanceof NumberConstant &&
            (divisorValue.equals(zeroInt) || divisorValue.equals(zeroFloat) || divisorValue.equals(minusZeroFloat))
        ) {
            accept('error', 'Division by zero.', {
                node,
                code: CODE_INFIX_OPERATION_DIVISION_BY_ZERO,
            });
        }
    };
};
