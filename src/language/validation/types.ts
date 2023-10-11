import { getContainerOfType, ValidationAcceptor } from 'langium';
import { isSdsCallable, isSdsLambda, SdsAttribute, SdsNamedType, SdsParameter, SdsResult } from '../generated/ast.js';
import { typeParametersOrEmpty } from '../helpers/nodeProperties.js';
import { isEmpty } from 'radash';

export const CODE_TYPE_MISSING_TYPE_ARGUMENTS = 'type/missing-type-arguments';
export const CODE_TYPE_MISSING_TYPE_HINT = 'type/missing-type-hint';

// -----------------------------------------------------------------------------
// Missing type arguments
// -----------------------------------------------------------------------------

export const namedTypeMustHaveTypeArgumentListIfTypeIsParameterized = (
    node: SdsNamedType,
    accept: ValidationAcceptor,
): void => {
    if (node.typeArgumentList) {
        return;
    }

    const typeParameters = typeParametersOrEmpty(node.declaration.ref);
    if (!isEmpty(typeParameters)) {
        accept(
            'error',
            `The type '${node.declaration.$refText}' is parameterized, so a type argument list must be added.`,
            {
                node,
                code: CODE_TYPE_MISSING_TYPE_ARGUMENTS,
            },
        );
    }
};

export const namedTypeMustSetAllTypeParameters = (node: SdsNamedType, accept: ValidationAcceptor): void => {};

// -----------------------------------------------------------------------------
// Missing type hints
// -----------------------------------------------------------------------------

export const attributeMustHaveTypeHint = (node: SdsAttribute, accept: ValidationAcceptor): void => {
    if (!node.type) {
        accept('error', 'An attribute must have a type hint.', {
            node,
            property: 'name',
            code: CODE_TYPE_MISSING_TYPE_HINT,
        });
    }
};

export const parameterMustHaveTypeHint = (node: SdsParameter, accept: ValidationAcceptor): void => {
    if (!node.type) {
        const containingCallable = getContainerOfType(node, isSdsCallable);

        if (!isSdsLambda(containingCallable)) {
            accept('error', 'A parameter must have a type hint.', {
                node,
                property: 'name',
                code: CODE_TYPE_MISSING_TYPE_HINT,
            });
        }
    }
};

export const resultMustHaveTypeHint = (node: SdsResult, accept: ValidationAcceptor): void => {
    if (!node.type) {
        accept('error', 'A result must have a type hint.', {
            node,
            property: 'name',
            code: CODE_TYPE_MISSING_TYPE_HINT,
        });
    }
};
