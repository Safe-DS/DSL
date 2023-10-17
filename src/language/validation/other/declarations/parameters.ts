import { isSdsAnnotation, isSdsCallable, SdsParameter } from '../../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';
import { isConstantParameter } from '../../../helpers/nodeProperties.js';
import { toConstantExpression } from '../../../partialEvaluation/toConstantExpression.js';
import { UnknownValue } from '../../../partialEvaluation/model.js';

export const CODE_PARAMETER_CONSTANT_DEFAULT_VALUE = 'parameter/constant-default-value';

export const constantParameterMustHaveConstantDefaultValue = (node: SdsParameter, accept: ValidationAcceptor) => {
    if (!isConstantParameter(node) || !node.defaultValue) return;

    const defaultValue = toConstantExpression(node.defaultValue);
    if (defaultValue === UnknownValue) {
        const containingCallable = getContainerOfType(node, isSdsCallable);
        const kind = isSdsAnnotation(containingCallable) ? 'annotation' : 'constant';

        accept('error', `Default values of ${kind} parameters must be constant.`, {
            node,
            property: 'defaultValue',
            code: CODE_PARAMETER_CONSTANT_DEFAULT_VALUE,
        });
    }
};
