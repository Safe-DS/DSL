import { isSdsCallable, isSdsParameterList, isSdsUnionType, SdsTypeParameter } from '../../../generated/ast.js';
import { findLocalReferences, getContainerOfType, hasContainerOfType, ValidationAcceptor } from 'langium';
import { SafeDsServices } from '../../../safe-ds-module.js';

export const CODE_TYPE_PARAMETER_INSUFFICIENT_CONTEXT = 'type-parameter/insufficient-context';

export const typeParameterMustHaveSufficientContext = (services: SafeDsServices) => {
    const builtinClasses = services.builtins.Classes;

    return (node: SdsTypeParameter, accept: ValidationAcceptor) => {
        const containingCallable = getContainerOfType(node, isSdsCallable);
        /* c8 ignore start */
        if (!containingCallable) {
            return;
        }
        /* c8 ignore stop */

        // Lists and maps are created using literals
        if (containingCallable === builtinClasses.List || containingCallable === builtinClasses.Map) {
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
};
