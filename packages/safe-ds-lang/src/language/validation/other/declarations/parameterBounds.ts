import { SafeDsServices } from '../../../safe-ds-module.js';
import { SdsParameterBound } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { Parameter } from '../../../helpers/nodeProperties.js';

export const CODE_PARAMETER_BOUND_PARAMETER = 'parameter-bound/parameter';

export const parameterBoundParameterMustBeConstFloatOrInt = (services: SafeDsServices) => {
    const coreTypes = services.types.CoreTypes;
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsParameterBound, accept: ValidationAcceptor) => {
        const parameter = node.leftOperand?.ref;
        if (!parameter) {
            return;
        }

        const parameterType = typeComputer.computeType(parameter);
        if (
            !typeChecker.isSubtypeOf(parameterType, coreTypes.Float) &&
            !typeChecker.isSubtypeOf(parameterType, coreTypes.Int)
        ) {
            accept('error', "Only 'Float' and 'Int' parameters can have bounds.", {
                node,
                property: 'leftOperand',
                code: CODE_PARAMETER_BOUND_PARAMETER,
            });
        } else if (!Parameter.isConstant(parameter)) {
            accept('error', 'Only constant parameters can have bounds.', {
                node,
                property: 'leftOperand',
                code: CODE_PARAMETER_BOUND_PARAMETER,
            });
        }
    };
};
