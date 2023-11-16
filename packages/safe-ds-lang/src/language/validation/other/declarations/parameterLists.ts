import { ValidationAcceptor } from 'langium';
import { SdsParameterList } from '../../../generated/ast.js';
import { Parameter } from '../../../helpers/nodeProperties.js';

export const CODE_PARAMETER_LIST_REQUIRED_AFTER_OPTIONAL = 'parameter-list/required-after-optional';

export const parameterListMustNotHaveRequiredParametersAfterOptionalParameters = (
    node: SdsParameterList,
    accept: ValidationAcceptor,
) => {
    let foundOptional = false;
    for (const parameter of node.parameters) {
        if (Parameter.isOptional(parameter)) {
            foundOptional = true;
        } else if (foundOptional) {
            accept('error', 'After the first optional parameter all parameters must be optional.', {
                node: parameter,
                property: 'name',
                code: CODE_PARAMETER_LIST_REQUIRED_AFTER_OPTIONAL,
            });
        }
    }
};
