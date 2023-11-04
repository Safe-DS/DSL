import { AstNode, getContainerOfType, ValidationAcceptor } from 'langium';
import {
    isSdsAnnotation,
    isSdsCallable,
    isSdsClass,
    isSdsLambda,
    isSdsMemberAccess,
    isSdsPipeline,
    isSdsReference,
    isSdsSchema,
    SdsAttribute,
    SdsCall,
    SdsNamedType,
    SdsParameter,
    SdsResult,
    SdsYield,
} from '../generated/ast.js';
import { getTypeArguments, getTypeParameters } from '../helpers/nodeProperties.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { pluralize } from '../../helpers/stringUtils.js';
import { isEmpty } from '../../helpers/collectionUtils.js';

export const CODE_TYPE_CALLABLE_RECEIVER = 'type/callable-receiver';
export const CODE_TYPE_YIELD = 'type/yield';
export const CODE_TYPE_MISSING_TYPE_ARGUMENTS = 'type/missing-type-arguments';
export const CODE_TYPE_MISSING_TYPE_HINT = 'type/missing-type-hint';

// -----------------------------------------------------------------------------
// Type checking
// -----------------------------------------------------------------------------

export const callReceiverMustBeCallable = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;

    return (node: SdsCall, accept: ValidationAcceptor): void => {
        let receiver: AstNode | undefined = node.receiver;
        if (isSdsMemberAccess(receiver)) {
            receiver = receiver.member;
        }

        if (isSdsReference(receiver)) {
            const target = receiver.target.ref;

            // We already report other errors at this position in those cases
            if (!target || isSdsAnnotation(target) || isSdsPipeline(target) || isSdsSchema(target)) {
                return;
            }
        }

        const callable = nodeMapper.callToCallable(node);
        if (!callable || isSdsAnnotation(callable)) {
            accept('error', 'This expression is not callable.', {
                node: node.receiver,
                code: CODE_TYPE_CALLABLE_RECEIVER,
            });
        } else if (isSdsClass(callable) && !callable.parameterList) {
            accept('error', 'Cannot instantiate a class that has no constructor.', {
                node: node.receiver,
                code: CODE_TYPE_CALLABLE_RECEIVER,
            });
        }
    };
};

export const yieldTypeMustMatchResultType = (services: SafeDsServices) => {
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsYield, accept: ValidationAcceptor) => {
        const result = node.result?.ref;
        if (!result) {
            return;
        }

        const yieldType = typeComputer.computeType(node);
        const resultType = typeComputer.computeType(result);

        if (!typeChecker.isAssignableTo(yieldType, resultType)) {
            accept('error', `A value of type '${yieldType}' cannot be assigned to a result of type '${resultType}'.`, {
                node,
                property: 'result',
                code: CODE_TYPE_YIELD,
            });
        }
    };
};

// -----------------------------------------------------------------------------
// Missing type arguments
// -----------------------------------------------------------------------------

export const namedTypeMustSetAllTypeParameters =
    (services: SafeDsServices) =>
    (node: SdsNamedType, accept: ValidationAcceptor): void => {
        const expectedTypeParameters = getTypeParameters(node.declaration?.ref);
        if (isEmpty(expectedTypeParameters)) {
            return;
        }

        if (node.typeArgumentList) {
            const actualTypeParameters = getTypeArguments(node.typeArgumentList).map((it) =>
                services.helpers.NodeMapper.typeArgumentToTypeParameter(it),
            );

            const missingTypeParameters = expectedTypeParameters.filter((it) => !actualTypeParameters.includes(it));
            if (!isEmpty(missingTypeParameters)) {
                const kind = pluralize(missingTypeParameters.length, 'type parameter');
                const missingTypeParametersString = missingTypeParameters.map((it) => `'${it.name}'`).join(', ');

                accept('error', `The ${kind} ${missingTypeParametersString} must be set here.`, {
                    node,
                    property: 'typeArgumentList',
                    code: CODE_TYPE_MISSING_TYPE_ARGUMENTS,
                });
            }
        } else {
            accept(
                'error',
                `The type '${node.declaration?.$refText}' is parameterized, so a type argument list must be added.`,
                {
                    node,
                    code: CODE_TYPE_MISSING_TYPE_ARGUMENTS,
                },
            );
        }
    };

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
