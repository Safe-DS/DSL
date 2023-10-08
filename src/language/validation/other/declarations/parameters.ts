import { SdsParameter } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';

export const CODE_PARAMETER_VARIADIC_AND_OPTIONAL = 'parameter/variadic-and-optional';

export const parameterMustNotBeVariadicAndOptional = (node: SdsParameter, accept: ValidationAcceptor) => {
    if (node.isVariadic && node.defaultValue) {
        accept('error', 'Variadic parameters must not be optional.', {
            node,
            property: 'name',
            code: CODE_PARAMETER_VARIADIC_AND_OPTIONAL,
        });
    }
};
