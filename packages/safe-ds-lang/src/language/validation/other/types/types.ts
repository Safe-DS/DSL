import {
    isSdsAnnotation,
    isSdsCallable,
    isSdsCallableType,
    isSdsClass,
    isSdsFunction,
    isSdsParameter,
    isSdsTypeAlias,
    isSdsUnionType,
    SdsType,
} from '../../../generated/ast.js';
import { AstNode, AstUtils, ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { CallableType, UnionType } from '../../../typing/model.js';

export const CODE_TYPE_CONTEXT = 'type/context';

export const typeMustBeUsedInCorrectContext = (services: SafeDsServices) => {
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsType, accept: ValidationAcceptor): void => {
        const type = typeComputer.computeType(node);

        if (type instanceof CallableType) {
            if (!callableTypeContextIsCorrect(node)) {
                accept('error', 'Callable types must only be used for parameters.', {
                    node,
                    code: CODE_TYPE_CONTEXT,
                });
            }
        } else if (type instanceof UnionType) {
            if (!unionTypeContextIsCorrect(node)) {
                accept(
                    'error',
                    'Union types must only be used for parameters of annotations, classes, and functions.',
                    {
                        node,
                        code: CODE_TYPE_CONTEXT,
                    },
                );
            }
        }
    };
};

const callableTypeContextIsCorrect = (node: AstNode): boolean => {
    if (isSdsParameter(node.$container) || isSdsTypeAlias(node.$container)) {
        return true;
    }

    // Check whether we already show an error on a containing callable type
    let containingCallableType = AstUtils.getContainerOfType(node.$container, isSdsCallableType);
    while (containingCallableType) {
        if (!isSdsParameter(containingCallableType.$container)) {
            return true; // Container already has wrong context
        }
        containingCallableType = AstUtils.getContainerOfType(containingCallableType.$container, isSdsCallableType);
    }

    return false;
};

const unionTypeContextIsCorrect = (node: AstNode): boolean => {
    const container = node.$container;

    if (AstUtils.hasContainerOfType(container, isSdsUnionType) || isSdsTypeAlias(container)) {
        return true;
    } else if (!isSdsParameter(container)) {
        return false;
    }

    const containingCallable = AstUtils.getContainerOfType(container, isSdsCallable);
    return (
        !containingCallable ||
        isSdsAnnotation(containingCallable) ||
        isSdsClass(containingCallable) ||
        isSdsFunction(containingCallable)
    );
};
