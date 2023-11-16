import { getContainerOfType, ValidationAcceptor } from 'langium';
import { isSdsCallableType, isSdsParameter, SdsCallableType } from '../../../generated/ast.js';

import { getParameters, Parameter } from '../../../helpers/nodeProperties.js';

export const CODE_CALLABLE_TYPE_CONST_MODIFIER = 'callable-type/const-modifier';
export const CODE_CALLABLE_TYPE_CONTEXT = 'callable-type/context';
export const CODE_CALLABLE_TYPE_NO_OPTIONAL_PARAMETERS = 'callable-type/no-optional-parameters';

export const callableTypeParameterMustNotHaveConstModifier = (
    node: SdsCallableType,
    accept: ValidationAcceptor,
): void => {
    for (const parameter of getParameters(node)) {
        if (parameter.isConstant) {
            accept('error', 'The const modifier is not applicable to parameters of callable types.', {
                node: parameter,
                property: 'isConstant',
                code: CODE_CALLABLE_TYPE_CONST_MODIFIER,
            });
        }
    }
};

export const callableTypeMustBeUsedInCorrectContext = (node: SdsCallableType, accept: ValidationAcceptor): void => {
    if (!contextIsCorrect(node)) {
        accept('error', 'Callable types must only be used for parameters.', {
            node,
            code: CODE_CALLABLE_TYPE_CONTEXT,
        });
    }
};

const contextIsCorrect = (node: SdsCallableType): boolean => {
    if (isSdsParameter(node.$container)) {
        return true;
    }

    // Check whether we already show an error on a containing callable type
    let containingCallableType = getContainerOfType(node.$container, isSdsCallableType);
    while (containingCallableType) {
        if (!isSdsParameter(containingCallableType.$container)) {
            return true; // Container already has wrong context
        }
        containingCallableType = getContainerOfType(containingCallableType.$container, isSdsCallableType);
    }

    return false;
};

export const callableTypeMustNotHaveOptionalParameters = (node: SdsCallableType, accept: ValidationAcceptor): void => {
    for (const parameter of getParameters(node)) {
        if (Parameter.isOptional(parameter)) {
            accept('error', 'A callable type must not have optional parameters.', {
                node: parameter,
                property: 'defaultValue',
                code: CODE_CALLABLE_TYPE_NO_OPTIONAL_PARAMETERS,
            });
        }
    }
};
