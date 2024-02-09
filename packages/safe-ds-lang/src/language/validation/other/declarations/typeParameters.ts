import { AstNode, findLocalReferences, getContainerOfType, hasContainerOfType, ValidationAcceptor } from 'langium';
import {
    isSdsCallable,
    isSdsClass,
    isSdsClassMember,
    isSdsDeclaration,
    isSdsNamedTypeDeclaration,
    isSdsParameter,
    isSdsParameterList,
    isSdsTypeArgument,
    isSdsUnionType,
    SdsClass,
    SdsDeclaration,
    SdsTypeParameter,
} from '../../../generated/ast.js';
import { isStatic, TypeParameter } from '../../../helpers/nodeProperties.js';
import { SafeDsServices } from '../../../safe-ds-module.js';
import { SafeDsNodeMapper } from '../../../helpers/safe-ds-node-mapper.js';

export const CODE_TYPE_PARAMETER_INSUFFICIENT_CONTEXT = 'type-parameter/insufficient-context';
export const CODE_TYPE_PARAMETER_USAGE = 'type-parameter/usage';
export const CODE_TYPE_PARAMETER_VARIANCE = 'type-parameter/variance';

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

export const typeParameterMustBeUsedInCorrectPosition = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;

    return (node: SdsTypeParameter, accept: ValidationAcceptor) => {
        const declarationWithTypeParameter = getContainerOfType(node.$container, isSdsDeclaration);

        // Early exit
        if (
            !declarationWithTypeParameter ||
            (!isSdsClass(declarationWithTypeParameter) && TypeParameter.isInvariant(node))
        ) {
            return;
        }

        findLocalReferences(node).forEach((it) => {
            const reference = it.$refNode?.astNode;
            if (!reference) {
                /* c8 ignore next 2 */
                return;
            }

            // Check usage of class type parameters
            if (
                isSdsClass(declarationWithTypeParameter) &&
                !classTypeParameterIsUsedInCorrectPosition(declarationWithTypeParameter, reference)
            ) {
                accept('error', 'This type parameter of a containing class cannot be used here.', {
                    node: reference,
                    code: CODE_TYPE_PARAMETER_USAGE,
                });
                return; // Don't show other errors for this reference
            }

            // Usages in the **own constructor** are always correct. This check must come after the previous one, since
            // that one filters out usages in **constructors of nested classes**.
            if (isInConstructor(reference)) {
                return;
            }

            // Check usage of variant type parameters
            if (TypeParameter.isContravariant(node)) {
                const position = getTypePosition(nodeMapper, declarationWithTypeParameter, reference);

                if (position !== 'contravariant') {
                    accept('error', `A contravariant type parameter cannot be used in ${position} position.`, {
                        node: reference,
                        code: CODE_TYPE_PARAMETER_USAGE,
                    });
                }
            } else if (TypeParameter.isCovariant(node)) {
                const position = getTypePosition(nodeMapper, declarationWithTypeParameter, reference);

                if (position !== 'covariant') {
                    accept('error', `A covariant type parameter cannot be used in ${position} position.`, {
                        node: reference,
                        code: CODE_TYPE_PARAMETER_USAGE,
                    });
                }
            }
        });
    };
};

const isInConstructor = (node: AstNode) => {
    const parameterList = getContainerOfType(node, isSdsParameterList);
    return isSdsClass(parameterList?.$container);
};

const classTypeParameterIsUsedInCorrectPosition = (classWithTypeParameter: SdsClass, reference: AstNode) => {
    const containingClassMember = getContainerOfType(reference, isSdsClassMember);

    // Handle usage in constructor
    if (!containingClassMember || containingClassMember === classWithTypeParameter) {
        return true;
    }

    // Handle usage in static member
    if (isStatic(containingClassMember)) {
        return false;
    }

    // Handle usage inside nested enums and classes (could be an instance attribute/function)
    const containingNamedTypeDeclaration = getContainerOfType(reference, isSdsNamedTypeDeclaration);
    return !containingNamedTypeDeclaration || containingNamedTypeDeclaration === classWithTypeParameter;
};

type TypePosition = 'contravariant' | 'covariant' | 'invariant';

const getTypePosition = (
    nodeMapper: SafeDsNodeMapper,
    declarationWithTypeParameter: SdsDeclaration,
    reference: AstNode,
): TypePosition => {
    let current: AstNode | undefined = reference;
    let result: TypePosition = 'covariant';

    while (current && current !== declarationWithTypeParameter && result !== 'invariant') {
        let step: TypePosition;

        if (isSdsParameter(current)) {
            step = 'contravariant';
        } else if (isSdsTypeArgument(current)) {
            const typeParameter = nodeMapper.typeArgumentToTypeParameter(current);

            if (TypeParameter.isContravariant(typeParameter)) {
                step = 'contravariant';
            } else if (TypeParameter.isCovariant(typeParameter)) {
                step = 'covariant';
            } else {
                step = 'invariant';
            }
        } else {
            step = 'covariant';
        }

        result = nextTypePosition(result, step);
        current = current.$container;
    }

    return result;
};

const nextTypePosition = (aggregator: TypePosition, step: TypePosition): TypePosition => {
    // We could also get the result by mapping the following numbers to the positions and multiplying them:
    //     -1 = contravariant
    //      0 = invariant
    //      1 = covariant

    if (aggregator === 'invariant' || step === 'invariant') {
        return 'invariant';
    } else if (aggregator === 'covariant') {
        return step;
    } else if (step === 'covariant') {
        return aggregator;
    } else {
        // Both are contravariant
        return 'covariant';
    }
};

export const typeParameterMustOnlyBeVariantOnClass = (node: SdsTypeParameter, accept: ValidationAcceptor) => {
    if (TypeParameter.isInvariant(node)) {
        return;
    }

    const declarationWithTypeParameter = getContainerOfType(node.$container, isSdsDeclaration);
    if (declarationWithTypeParameter && !isSdsClass(declarationWithTypeParameter)) {
        accept('error', 'Only type parameters of classes can be variant.', {
            node,
            property: 'variance',
            code: CODE_TYPE_PARAMETER_VARIANCE,
        });
    }
};
