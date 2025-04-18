import { ValidationAcceptor } from 'langium';
import { SdsCallableType } from '../../../generated/ast.js';

import { getParameters, Parameter } from '../../../helpers/nodeProperties.js';

export const CODE_CALLABLE_TYPE_CONST_MODIFIER = 'callable-type/const-modifier';
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
