import { isSdsAnnotation, isSdsCallable, SdsParameter } from '../../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';
import { isConstantParameter } from '../../../helpers/nodeProperties.js';
import { ConstantExpression } from '../../../partialEvaluation/model.js';
import { SafeDsServices } from '../../../safe-ds-module.js';

export const CODE_PARAMETER_CONSTANT_DEFAULT_VALUE = 'parameter/constant-default-value';

export const constantParameterMustHaveConstantDefaultValue = (services: SafeDsServices) => {
    const partialEvaluator = services.evaluation.PartialEvaluator;

    return (node: SdsParameter, accept: ValidationAcceptor) => {
        if (!isConstantParameter(node) || !node.defaultValue) return;

        const evaluatedDefaultValue = partialEvaluator.evaluate(node.defaultValue);
        if (!(evaluatedDefaultValue instanceof ConstantExpression)) {
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
