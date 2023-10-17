import { SdsCall } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { argumentsOrEmpty, isConstantParameter } from '../../../helpers/nodeProperties.js';
import { toConstantExpressionOrUndefined } from '../../../partialEvaluation/toConstantExpressionOrUndefined.js';
import { SafeDsServices } from '../../../safe-ds-module.js';

export const CODE_CALL_CONSTANT_ARGUMENT = 'call/constant-argument';

export const callArgumentsMustBeConstantIfParameterIsConstant = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;

    return (node: SdsCall, accept: ValidationAcceptor) => {
        for (const argument of argumentsOrEmpty(node)) {
            const parameter = nodeMapper.argumentToParameterOrUndefined(argument);
            if (!isConstantParameter(parameter)) continue;

            const constantValue = toConstantExpressionOrUndefined(argument.value);
            if (!constantValue) {
                accept('error', "Arguments assigned to constant parameters must be constant.", {
                    node: argument,
                    property: 'value',
                    code: CODE_CALL_CONSTANT_ARGUMENT,
                });
            }
        }
    };
};
