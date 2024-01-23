import { AstNode, findLocalReferences, getContainerOfType, hasContainerOfType, ValidationAcceptor } from 'langium';
import {
    isSdsCallable,
    isSdsClass,
    isSdsClassMember,
    isSdsDeclaration,
    isSdsNamedTypeDeclaration,
    isSdsParameterList,
    isSdsUnionType,
    SdsClass,
    SdsTypeParameter,
} from '../../../generated/ast.js';
import { isStatic } from '../../../helpers/nodeProperties.js';

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

export const typeParameterMustBeUsedInCorrectContext = (node: SdsTypeParameter, accept: ValidationAcceptor) => {
    // Only classes can have nested named type declarations
    const declarationWithTypeParameter = getContainerOfType(node.$container, isSdsDeclaration);
    if (!isSdsClass(declarationWithTypeParameter)) {
        return;
    }

    findLocalReferences(node).forEach((it) => {
        const reference = it.$refNode?.astNode;
        if (reference && !classTypeParameterIsUsedInCorrectContext(declarationWithTypeParameter, reference)) {
            accept('error', 'This type parameter of a containing class cannot be used here.', {
                node: reference,
                code: CODE_TYPE_PARAMETER_USAGE,
            });
        }
    });
};

const classTypeParameterIsUsedInCorrectContext = (classWithTypeParameter: SdsClass, reference: AstNode) => {
    const containingClassMember = getContainerOfType(reference, isSdsClassMember);

    // Handle usage in constructor
    if (!containingClassMember || containingClassMember === classWithTypeParameter) {
        return true;
    }

    // Handle usage in static context
    if (isStatic(containingClassMember)) {
        return false;
    }

    // Handle usage inside nested enums and classes (could be an instance attribute/function)
    const containingNamedTypeDeclaration = getContainerOfType(reference, isSdsNamedTypeDeclaration);
    return !containingNamedTypeDeclaration || containingNamedTypeDeclaration === classWithTypeParameter;
};
