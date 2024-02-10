import { isSdsDeclaration, SdsTypeParameterBound } from '../../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';

export const CODE_TYPE_PARAMETER_BOUND_LEFT_OPERAND = 'type-parameter-bound/left-operand';

export const typeParameterBoundLeftOperandMustBeOwnTypeParameter = (
    node: SdsTypeParameterBound,
    accept: ValidationAcceptor,
) => {
    const typeParameter = node.leftOperand?.ref;
    if (!typeParameter) {
        return;
    }

    const declarationWithConstraint = getContainerOfType(node.$container, isSdsDeclaration);
    const declarationWithTypeParameters = getContainerOfType(typeParameter.$container, isSdsDeclaration);

    if (declarationWithConstraint !== declarationWithTypeParameters) {
        accept('error', 'The left operand must refer to a type parameter of the declaration with the bound.', {
            node,
            property: 'leftOperand',
            code: CODE_TYPE_PARAMETER_BOUND_LEFT_OPERAND,
        });
    }
};
