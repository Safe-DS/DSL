import { findLocalReferences, getContainerOfType, hasContainerOfType, ValidationAcceptor } from 'langium';
import {
    isSdsCallable,
    isSdsClass,
    isSdsDeclaration,
    isSdsNamedTypeDeclaration,
    isSdsParameterList,
    isSdsUnionType,
    SdsTypeParameter,
} from '../../../generated/ast.js';

export const CODE_TYPE_PARAMETER_INSUFFICIENT_CONTEXT = 'type-parameter/insufficient-context';
export const CODE_TYPE_PARAMETER_USAGE = 'type-parameter/usage';

export const typeParameterMustHaveSufficientContext = (node: SdsTypeParameter, accept: ValidationAcceptor) => {
    const containingCallable = getContainerOfType(node, isSdsCallable);
    /* c8 ignore start */
    if (!containingCallable) {
        return;
    }
    /* c8 ignore stop */

    // Classes without constructor can only be used as named types, where type arguments are manifest
    if (isSdsClass(containingCallable) && !containingCallable.parameterList) {
        return;
    }

    // A type parameter must be referenced in the parameter list of the containing callable...
    let typeParameterHasInsufficientContext =
        !containingCallable.parameterList ||
        findLocalReferences(node, containingCallable.parameterList)
            // ...but references in a union type or in the parameter list of a callable type don't count
            .filter((reference) => {
                const referenceNode = reference.$refNode?.astNode;
                const containingParameterList = getContainerOfType(referenceNode, isSdsParameterList);

                return (
                    !hasContainerOfType(referenceNode, isSdsUnionType) &&
                    containingParameterList === containingCallable.parameterList
                );
            })
            .isEmpty();

    if (typeParameterHasInsufficientContext) {
        accept('error', 'Insufficient context to infer this type parameter.', {
            node,
            code: CODE_TYPE_PARAMETER_INSUFFICIENT_CONTEXT,
        });
    }
};

export const typeParameterMustNotBeUsedInNestedNamedTypeDeclarations = (
    node: SdsTypeParameter,
    accept: ValidationAcceptor,
) => {
    // Only classes can have nested named type declarations
    const declarationWithTypeParameter = getContainerOfType(node.$container, isSdsDeclaration);
    if (!isSdsClass(declarationWithTypeParameter)) {
        return;
    }

    findLocalReferences(node).forEach((it) => {
        const reference = it.$refNode?.astNode;
        const containingNamedTypeDeclaration = getContainerOfType(reference, isSdsNamedTypeDeclaration);
        if (
            reference &&
            containingNamedTypeDeclaration &&
            containingNamedTypeDeclaration !== declarationWithTypeParameter
        ) {
            accept('error', 'Type parameters cannot be used in nested named type declarations.', {
                node: reference,
                code: CODE_TYPE_PARAMETER_USAGE,
            });
        }
    });
};
