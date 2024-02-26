import {
    isSdsAnnotation,
    isSdsCallable,
    isSdsClass,
    isSdsFunction,
    isSdsParameter,
    isSdsUnionType,
    SdsUnionType,
} from '../../../generated/ast.js';
import { AstUtils, ValidationAcceptor } from 'langium';
import { getTypeArguments } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { Type } from '../../../typing/model.js';
import { isEmpty } from '../../../../helpers/collections.js';

export const CODE_UNION_TYPE_CONTEXT = 'union-type/context';
export const CODE_UNION_TYPE_DUPLICATE_TYPE = 'union-type/duplicate-type';
export const CODE_UNION_TYPE_MISSING_TYPES = 'union-type/missing-types';

export const unionTypeMustBeUsedInCorrectContext = (node: SdsUnionType, accept: ValidationAcceptor): void => {
    if (!contextIsCorrect(node)) {
        accept('error', 'Union types must only be used for parameters of annotations, classes, and functions.', {
            node,
            code: CODE_UNION_TYPE_CONTEXT,
        });
    }
};

const contextIsCorrect = (node: SdsUnionType): boolean => {
    if (AstUtils.hasContainerOfType(node.$container, isSdsUnionType)) {
        return true;
    }

    const container = node.$container;
    if (!isSdsParameter(container)) {
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

export const unionTypeMustHaveTypes = (node: SdsUnionType, accept: ValidationAcceptor): void => {
    if (isEmpty(getTypeArguments(node.typeArgumentList))) {
        accept('error', 'A union type must have at least one type.', {
            node,
            property: 'typeArgumentList',
            code: CODE_UNION_TYPE_MISSING_TYPES,
        });
    }
};

export const unionTypeShouldNotHaveDuplicateTypes = (services: SafeDsServices) => {
    const typeComputer = services.types.TypeComputer;

    return (node: SdsUnionType, accept: ValidationAcceptor): void => {
        const typeArguments = getTypeArguments(node.typeArgumentList);
        const knownTypes: Type[] = [];

        for (const typeArgument of typeArguments) {
            const type = typeComputer.computeType(typeArgument);
            if (knownTypes.some((it) => it.equals(type))) {
                accept('warning', `The type '${type.toString()}' was already listed.`, {
                    node: typeArgument,
                    code: CODE_UNION_TYPE_DUPLICATE_TYPE,
                });
            } else {
                knownTypes.push(type);
            }
        }
    };
};
