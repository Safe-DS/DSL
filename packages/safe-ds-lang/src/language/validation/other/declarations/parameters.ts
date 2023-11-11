import { getContainerOfType, ValidationAcceptor } from 'langium';
import { isSdsAnnotation, isSdsCallable, SdsParameter } from '../../../generated/ast.js';
import { Parameter } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';

export const CODE_PARAMETER_CONSTANT_DEFAULT_VALUE = 'parameter/constant-default-value';

export const constantParameterMustHaveConstantDefaultValue = (services: SafeDsServices) => {
    const partialEvaluator = services.evaluation.PartialEvaluator;

    return (node: SdsParameter, accept: ValidationAcceptor) => {
        if (!Parameter.isConstant(node) || !node.defaultValue) return;

        const evaluatedDefaultValue = partialEvaluator.evaluate(node.defaultValue);
        if (!evaluatedDefaultValue.isFullyEvaluated) {
            const containingCallable = getContainerOfType(node, isSdsCallable);
            const kind = isSdsAnnotation(containingCallable) ? 'annotation' : 'constant';

            accept('error', `Default values of ${kind} parameters must be constant.`, {
                node,
                property: 'defaultValue',
                code: CODE_PARAMETER_CONSTANT_DEFAULT_VALUE,
            });
        }
    };
};
