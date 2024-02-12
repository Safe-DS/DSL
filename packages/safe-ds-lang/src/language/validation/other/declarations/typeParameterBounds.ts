import { isSdsDeclaration, SdsTypeParameterBound } from '../../../generated/ast.js';
import { getContainerOfType, ValidationAcceptor } from 'langium';
import { NamedType, UnknownType } from '../../../typing/model.js';
import { SafeDsServices } from '../../../safe-ds-module.js';

export const CODE_TYPE_PARAMETER_BOUND_LEFT_OPERAND = 'type-parameter-bound/left-operand';
export const CODE_TYPE_PARAMETER_BOUND_RIGHT_OPERAND = 'type-parameter-bound/right-operand';

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

export const typeParameterBoundRightOperandMustBeNamedType = (services: SafeDsServices) => {
    const typeComputer = services.types.TypeComputer;

    return (node: SdsTypeParameterBound, accept: ValidationAcceptor) => {
        const boundType = typeComputer.computeType(node.rightOperand);

        if (boundType !== UnknownType && !(boundType instanceof NamedType)) {
            accept('error', 'Bounds of type parameters must be named types.', {
                node,
                property: 'rightOperand',
                code: CODE_TYPE_PARAMETER_BOUND_RIGHT_OPERAND,
            });
        }
    };
};
