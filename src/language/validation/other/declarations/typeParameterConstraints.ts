import { isSdsDeclaration, SdsTypeParameterConstraint } from '../../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';

export const CODE_TYPE_PARAMETER_CONSTRAINT_LEFT_OPERAND = 'type-parameter-constraint/left-operand';

export const typeParameterConstraintLeftOperandMustBeOwnTypeParameter = (
    node: SdsTypeParameterConstraint,
    accept: ValidationAcceptor,
) => {
    const typeParameter = node.leftOperand.ref;
    if (!typeParameter) {
        return;
    }

    const declarationWithConstraint = getContainerOfType(node.$container, isSdsDeclaration);
    const declarationWithTypeParameters = getContainerOfType(typeParameter.$container, isSdsDeclaration);

    if (declarationWithConstraint !== declarationWithTypeParameters) {
        accept('error', 'The left operand must refer to a type parameter of the declaration with the constraint.', {
            node,
            property: 'leftOperand',
            code: CODE_TYPE_PARAMETER_CONSTRAINT_LEFT_OPERAND,
        });
    }
};
