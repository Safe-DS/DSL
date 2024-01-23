import { ValidationAcceptor } from 'langium';
import { SdsTypeParameterList } from '../../../generated/ast.js';
import { TypeParameter } from '../../../helpers/nodeProperties.js';

export const CODE_TYPE_PARAMETER_LIST_REQUIRED_AFTER_OPTIONAL = 'type-parameter-list/required-after-optional';

export const typeParameterListMustNotHaveRequiredTypeParametersAfterOptionalTypeParameters = (
    node: SdsTypeParameterList,
    accept: ValidationAcceptor,
) => {
    let foundOptional = false;
    for (const typeParameter of node.typeParameters) {
        if (TypeParameter.isOptional(typeParameter)) {
            foundOptional = true;
        } else if (foundOptional) {
            accept('error', 'After the first optional type parameter all type parameters must be optional.', {
                node: typeParameter,
                property: 'name',
                code: CODE_TYPE_PARAMETER_LIST_REQUIRED_AFTER_OPTIONAL,
            });
        }
    }
};
