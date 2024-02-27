import { SafeDsServices } from '../../../safe-ds-module.js';
import { isSdsCallable, SdsParameterBound } from '../../../generated/ast.js';
import { AstUtils, ValidationAcceptor } from 'langium';
import { getParameters, Parameter } from '../../../helpers/nodeProperties.js';
import { FloatConstant, IntConstant } from '../../../partialEvaluation/model.js';

export const CODE_PARAMETER_BOUND_PARAMETER = 'parameter-bound/parameter';
export const CODE_PARAMETER_BOUND_RIGHT_OPERAND = 'parameter-bound/right-operand';

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

export const parameterBoundRightOperandMustEvaluateToFloatConstantOrIntConstant = (services: SafeDsServices) => {
    const coreTypes = services.types.CoreTypes;
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;
    const partialEvaluator = services.evaluation.PartialEvaluator;
    const one = new IntConstant(1n);

    return (node: SdsParameterBound, accept: ValidationAcceptor) => {
        const rightOperandType = typeComputer.computeType(node.rightOperand);

        // Must have correct type
        let rightOperandIsValid =
            typeChecker.isSubtypeOf(rightOperandType, coreTypes.Float) ||
            typeChecker.isSubtypeOf(rightOperandType, coreTypes.Int);

        // Must evaluate to a constant after substituting constant parameters
        if (rightOperandIsValid) {
            const containingCallable = AstUtils.getContainerOfType(node, isSdsCallable);
            const constantParameters = getParameters(containingCallable).filter(Parameter.isConstant);
            const substitutions = new Map(constantParameters.map((it) => [it, one]));
            const value = partialEvaluator.evaluate(node.rightOperand, substitutions);

            rightOperandIsValid = value instanceof IntConstant || value instanceof FloatConstant;
        }

        if (!rightOperandIsValid) {
            accept('error', 'The right operand of a parameter bound must evaluate to a float or int constant.', {
                node,
                property: 'rightOperand',
                code: CODE_PARAMETER_BOUND_RIGHT_OPERAND,
            });
        }
    };
};
