import { SdsCall } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { argumentsOrEmpty, isConstantParameter } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';

export const CODE_CALL_CONSTANT_ARGUMENT = 'call/constant-argument';

export const callArgumentsMustBeConstantIfParameterIsConstant = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;
    const partialEvaluator = services.evaluation.PartialEvaluator;

    return (node: SdsCall, accept: ValidationAcceptor) => {
        for (const argument of argumentsOrEmpty(node)) {
            const parameter = nodeMapper.argumentToParameterOrUndefined(argument);
            if (!isConstantParameter(parameter)) continue;

            const evaluatedArgumentValue = partialEvaluator.evaluate(argument.value);
            if (!evaluatedArgumentValue.isFullyEvaluated) {
                accept('error', 'Arguments assigned to constant parameters must be constant.', {
                    node: argument,
                    property: 'value',
                    code: CODE_CALL_CONSTANT_ARGUMENT,
                });
            }
        }
    };
};
