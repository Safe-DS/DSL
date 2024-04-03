import { SafeDsServices } from '../../../safe-ds-module.js';
import {
    isSdsCallable,
    isSdsComparisonOperator,
    type SdsCall,
    SdsParameter,
    SdsParameterBound,
} from '../../../generated/ast.js';
import { AstUtils, ValidationAcceptor } from 'langium';
import { getArguments, getParameters, Parameter } from '../../../helpers/nodeProperties.js';
import { Constant, EvaluatedNode, FloatConstant, IntConstant } from '../../../partialEvaluation/model.js';

export const CODE_PARAMETER_BOUND_INVALID_VALUE = 'parameter-bound/invalid-value';
export const CODE_PARAMETER_BOUND_PARAMETER = 'parameter-bound/parameter';
export const CODE_PARAMETER_BOUND_RIGHT_OPERAND = 'parameter-bound/right-operand';

export const callArgumentMustRespectParameterBounds = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;
    const partialEvaluator = services.evaluation.PartialEvaluator;

    return (node: SdsCall, accept: ValidationAcceptor) => {
        const substitutions = partialEvaluator.computeParameterSubstitutionsForCall(node);

        for (const argument of getArguments(node)) {
            const value = partialEvaluator.evaluate(argument.value);
            if (!(value instanceof Constant)) {
                continue;
            }

            const parameter = nodeMapper.argumentToParameter(argument);
            if (!parameter) {
                continue;
            }

            for (const bound of Parameter.getBounds(parameter)) {
                const rightOperand = partialEvaluator.evaluate(bound.rightOperand, substitutions);
                const errorMessage = checkBound(parameter.name, value, bound.operator, rightOperand);

                if (errorMessage) {
                    accept('error', errorMessage, {
                        node: argument,
                        property: 'value',
                        code: CODE_PARAMETER_BOUND_INVALID_VALUE,
                    });
                }
            }
        }
    };
};

export const parameterDefaultValueMustRespectParameterBounds = (services: SafeDsServices) => {
    const partialEvaluator = services.evaluation.PartialEvaluator;

    return (node: SdsParameter, accept: ValidationAcceptor) => {
        if (!node.defaultValue) {
            return;
        }

        const value = partialEvaluator.evaluate(node.defaultValue);
        if (!(value instanceof Constant)) {
            return;
        }

        // Error if we cannot verify some bounds
        for (const bound of Parameter.getBounds(node)) {
            const rightOperand = partialEvaluator.evaluate(bound.rightOperand);
            if (!(rightOperand instanceof Constant)) {
                accept('error', 'Cannot verify whether the parameter bounds are always met.', {
                    node,
                    property: 'defaultValue',
                    code: CODE_PARAMETER_BOUND_INVALID_VALUE,
                });
                return;
            }
        }

        // Error if the default value violates some bounds
        for (const bound of Parameter.getBounds(node)) {
            const rightOperand = partialEvaluator.evaluate(bound.rightOperand);
            const errorMessage = checkBound(node.name, value, bound.operator, rightOperand);
            if (errorMessage) {
                accept('error', errorMessage, {
                    node,
                    property: 'defaultValue',
                    code: CODE_PARAMETER_BOUND_INVALID_VALUE,
                });
            }
        }
    };
};

const checkBound = (
    parameterName: string,
    leftOperand: EvaluatedNode,
    operator: string,
    rightOperand: EvaluatedNode,
): string | undefined => {
    // Arguments must be valid
    if (
        (!(leftOperand instanceof FloatConstant) && !(leftOperand instanceof IntConstant)) ||
        !isSdsComparisonOperator(operator) ||
        (!(rightOperand instanceof FloatConstant) && !(rightOperand instanceof IntConstant))
    ) {
        return;
    }

    const createMessage = (relation: string) => {
        return `The value of '${parameterName}' must be ${relation} ${rightOperand.toString()} but was ${leftOperand.toString()}.`;
    };

    if (operator === '<') {
        if (leftOperand.value >= rightOperand.value) {
            return createMessage('less than');
        }
    } else if (operator === '<=') {
        if (leftOperand.value > rightOperand.value) {
            return createMessage('less than or equal to');
        }
    } else if (operator === '>=') {
        if (leftOperand.value < rightOperand.value) {
            return createMessage('greater than or equal to');
        }
    } else if (operator === '>') {
        if (leftOperand.value <= rightOperand.value) {
            return createMessage('greater than');
        }
    }

    return undefined;
};

export const parameterBoundParameterMustBeConstFloatOrInt = (services: SafeDsServices) => {
    const coreTypes = services.typing.CoreTypes;
    const typeChecker = services.typing.TypeChecker;
    const typeComputer = services.typing.TypeComputer;

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
    const coreTypes = services.typing.CoreTypes;
    const typeChecker = services.typing.TypeChecker;
    const typeComputer = services.typing.TypeComputer;
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

            rightOperandIsValid = value instanceof FloatConstant || value instanceof IntConstant;
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
