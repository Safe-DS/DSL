import { AstUtils, ValidationAcceptor } from 'langium';
import { isSdsAnnotation, isSdsCallable, SdsParameter } from '../../../generated/ast.js';
import { Parameter } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';

export const CODE_PARAMETER_CONSTANT_DEFAULT_VALUE = 'parameter/constant-default-value';
export const CODE_PARAMETER_CONSTANT_TYPE = 'parameter/constant-type';

export const constantParameterMustHaveConstantDefaultValue = (services: SafeDsServices) => {
    const partialEvaluator = services.evaluation.PartialEvaluator;

    return (node: SdsParameter, accept: ValidationAcceptor) => {
        if (!Parameter.isConstant(node) || !node.defaultValue) {
            return;
        }

        if (!partialEvaluator.canBeValueOfConstantParameter(node.defaultValue)) {
            const containingCallable = AstUtils.getContainerOfType(node, isSdsCallable);
            const kind = isSdsAnnotation(containingCallable) ? 'annotation' : 'constant';

            accept('error', `Default values of ${kind} parameters must be constant.`, {
                node,
                property: 'defaultValue',
                code: CODE_PARAMETER_CONSTANT_DEFAULT_VALUE,
            });
        }
    };
};

export const constantParameterMustHaveTypeThatCanBeEvaluatedToConstant = (services: SafeDsServices) => {
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsParameter, accept: ValidationAcceptor) => {
        if (!Parameter.isConstant(node) || !node.type) {
            return;
        }

        const type = typeComputer.computeType(node);
        if (!typeChecker.canBeTypeOfConstantParameter(type)) {
            const containingCallable = AstUtils.getContainerOfType(node, isSdsCallable);
            const kind = isSdsAnnotation(containingCallable) ? 'An annotation' : 'A constant';

            accept('error', `${kind} parameter cannot have type '${type.toString()}'.`, {
                node,
                property: 'type',
                code: CODE_PARAMETER_CONSTANT_TYPE,
            });
        }
    };
};
