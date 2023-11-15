import { ValidationAcceptor } from 'langium';
import { type SdsCall } from '../../../generated/ast.js';
import { getArguments, Parameter } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';

export const CODE_CALL_CONSTANT_ARGUMENT = 'call/constant-argument';

export const callArgumentMustBeConstantIfParameterIsConstant = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;
    const partialEvaluator = services.evaluation.PartialEvaluator;

    return (node: SdsCall, accept: ValidationAcceptor) => {
        for (const argument of getArguments(node)) {
            if (!argument.value) {
                /* c8 ignore next 2 */
                return;
            }

            const parameter = nodeMapper.argumentToParameter(argument);
            if (!Parameter.isConstant(parameter)) {
                return;
            }

            if (!partialEvaluator.canBeValueOfConstantParameter(argument.value)) {
                accept('error', 'Values assigned to constant parameters must be constant.', {
                    node: argument,
                    property: 'value',
                    code: CODE_CALL_CONSTANT_ARGUMENT,
                });
            }
        }
    };
};
