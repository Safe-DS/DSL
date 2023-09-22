import { SdsCallableType } from '../../../generated/ast.js';
import { ValidationAcceptor } from 'langium';
import { parametersOrEmpty } from '../../../ast/shortcuts.js';

export const CODE_CALLABLE_TYPE_NO_OPTIONAL_PARAMETERS = 'callable-type/no-optional-parameters';

export const callableTypeMustNotHaveOptionalParameters = (node: SdsCallableType, accept: ValidationAcceptor): void => {
    for (const parameter of parametersOrEmpty(node.parameterList)) {
        if (parameter.defaultValue && !parameter.variadic) {
            accept('error', 'A callable type must not have optional parameters.', {
                node: parameter,
                property: 'defaultValue',
                code: CODE_CALLABLE_TYPE_NO_OPTIONAL_PARAMETERS,
            });
        }
    }
};
