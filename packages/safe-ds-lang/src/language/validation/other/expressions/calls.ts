import { ValidationAcceptor } from 'langium';
import { SdsCall } from '../../../generated/ast.js';
import { getArguments, Parameter } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';

export const CODE_CALL_CONSTANT_ARGUMENT = 'call/constant-argument';

export const callArgumentsMustBeConstantIfParameterIsConstant = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;
    const partialEvaluator = services.evaluation.PartialEvaluator;

    return (node: SdsCall, accept: ValidationAcceptor) => {
        for (const argument of getArguments(node)) {
            const parameter = nodeMapper.argumentToParameter(argument);
            if (!Parameter.isConstant(parameter)) continue;

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
