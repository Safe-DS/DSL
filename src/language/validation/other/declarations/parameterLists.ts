import { SdsParameterList } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';

export const CODE_PARAMETER_LIST_OPTIONAL_AND_VARIADIC = 'parameter-list/optional-and-variadic';
export const CODE_PARAMETER_LIST_REQUIRED_AFTER_OPTIONAL = 'parameter-list/required-after-optional';
export const CODE_PARAMETER_LIST_VARIADIC_NOT_LAST = 'parameter-list/variadic-not-last';

export const parameterListMustNotHaveOptionalAndVariadicParameters = (
    node: SdsParameterList,
    accept: ValidationAcceptor,
) => {
    const hasOptional = node.parameters.find((p) => p.defaultValue);
    if (hasOptional) {
        const variadicRequiredParameters = node.parameters.filter((p) => p.isVariadic && !p.defaultValue);

        for (const variadic of variadicRequiredParameters) {
            accept('error', 'A callable with optional parameters must not have a variadic parameter.', {
                node: variadic,
                property: 'name',
                code: CODE_PARAMETER_LIST_OPTIONAL_AND_VARIADIC,
            });
        }
    }
};

export const parameterListMustNotHaveRequiredParametersAfterOptionalParameters = (
    node: SdsParameterList,
    accept: ValidationAcceptor,
) => {
    let foundOptional = false;
    for (const parameter of node.parameters) {
        if (parameter.defaultValue) {
            foundOptional = true;
        } else if (foundOptional && !parameter.isVariadic) {
            accept('error', 'After the first optional parameter all parameters must be optional.', {
                node: parameter,
                property: 'name',
                code: CODE_PARAMETER_LIST_REQUIRED_AFTER_OPTIONAL,
            });
        }
    }
};

export const parameterListVariadicParameterMustBeLast = (node: SdsParameterList, accept: ValidationAcceptor) => {
    let foundVariadic = false;
    for (const parameter of node.parameters) {
        if (foundVariadic) {
            accept('error', 'After a variadic parameter no more parameters must be specified.', {
                node: parameter,
                property: 'name',
                code: CODE_PARAMETER_LIST_VARIADIC_NOT_LAST,
            });
        }

        if (parameter.isVariadic) {
            foundVariadic = true;
        }
    }
};
