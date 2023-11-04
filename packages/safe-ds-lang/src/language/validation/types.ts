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
    SdsArgument,
    SdsAttribute,
    SdsCall,
    SdsIndexedAccess,
    SdsInfixOperation,
    SdsNamedType,
    SdsParameter,
    SdsPrefixOperation,
    SdsResult,
    SdsYield,
} from '../generated/ast.js';
import { getTypeArguments, getTypeParameters } from '../helpers/nodeProperties.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { pluralize } from '../../helpers/stringUtils.js';
import { isEmpty } from '../../helpers/collectionUtils.js';

export const CODE_TYPE_CALLABLE_RECEIVER = 'type/callable-receiver';
export const CODE_TYPE_MISMATCH = 'type/mismatch';
export const CODE_TYPE_MISSING_TYPE_ARGUMENTS = 'type/missing-type-arguments';
export const CODE_TYPE_MISSING_TYPE_HINT = 'type/missing-type-hint';

// -----------------------------------------------------------------------------
// Type checking
// -----------------------------------------------------------------------------

export const argumentTypeMustMatchParameterType = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsArgument, accept: ValidationAcceptor) => {
        const parameter = nodeMapper.argumentToParameter(node);
        if (!parameter) {
            return;
        }

        const argumentType = typeComputer.computeType(node);
        const parameterType = typeComputer.computeType(parameter);

        if (!typeChecker.isAssignableTo(argumentType, parameterType)) {
            accept('error', `Expected type '${parameterType}' but got '${argumentType}'.`, {
                node,
                property: 'value',
                code: CODE_TYPE_MISMATCH,
            });
        }
    };
};

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

export const indexedAccessReceiverMustBeListOrMap = (services: SafeDsServices) => {
    const coreTypes = services.types.CoreTypes;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsIndexedAccess, accept: ValidationAcceptor): void => {
        const receiverType = typeComputer.computeType(node.receiver);
        if (receiverType !== coreTypes.List && receiverType !== coreTypes.Map) {
            accept('error', `Expected type '${coreTypes.List}' or '${coreTypes.Map}' but got '${receiverType}'.`, {
                node: node.receiver,
                code: CODE_TYPE_MISMATCH,
            });
        }
    };
};

export const indexedAccessIndexMustHaveCorrectType = (services: SafeDsServices) => {
    const coreTypes = services.types.CoreTypes;
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsIndexedAccess, accept: ValidationAcceptor): void => {
        const receiverType = typeComputer.computeType(node.receiver);
        if (receiverType === coreTypes.List) {
            const indexType = typeComputer.computeType(node.index);
            if (!typeChecker.isAssignableTo(indexType, coreTypes.Int)) {
                accept('error', `Expected type '${coreTypes.Int}' but got '${indexType}'.`, {
                    node,
                    property: 'index',
                    code: CODE_TYPE_MISMATCH,
                });
            }
        }
    };
};

export const infixOperationOperandsMustHaveCorrectType = (services: SafeDsServices) => {
    const coreTypes = services.types.CoreTypes;
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsInfixOperation, accept: ValidationAcceptor): void => {
        const leftType = typeComputer.computeType(node.leftOperand);
        const rightType = typeComputer.computeType(node.rightOperand);
        switch (node.operator) {
            case 'or':
            case 'and':
                if (!typeChecker.isAssignableTo(leftType, coreTypes.Boolean)) {
                    accept('error', `Expected type '${coreTypes.Boolean}' but got '${leftType}'.`, {
                        node: node.leftOperand,
                        code: CODE_TYPE_MISMATCH,
                    });
                }
                if (!typeChecker.isAssignableTo(rightType, coreTypes.Boolean)) {
                    accept('error', `Expected type '${coreTypes.Boolean}' but got '${rightType}'.`, {
                        node: node.rightOperand,
                        code: CODE_TYPE_MISMATCH,
                    });
                }
                return;
            case '<':
            case '<=':
            case '>=':
            case '>':
            case '+':
            case '-':
            case '*':
            case '/':
                if (
                    !typeChecker.isAssignableTo(leftType, coreTypes.Float) &&
                    !typeChecker.isAssignableTo(leftType, coreTypes.Int)
                ) {
                    accept('error', `Expected type '${coreTypes.Float}' or '${coreTypes.Int}' but got '${leftType}'.`, {
                        node: node.leftOperand,
                        code: CODE_TYPE_MISMATCH,
                    });
                }
                if (
                    !typeChecker.isAssignableTo(rightType, coreTypes.Float) &&
                    !typeChecker.isAssignableTo(rightType, coreTypes.Int)
                ) {
                    accept(
                        'error',
                        `Expected type '${coreTypes.Float}' or '${coreTypes.Int}' but got '${rightType}'.`,
                        {
                            node: node.rightOperand,
                            code: CODE_TYPE_MISMATCH,
                        },
                    );
                }
                return;
        }
    };
};

export const parameterDefaultValueTypeMustMatchParameterType = (services: SafeDsServices) => {
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsParameter, accept: ValidationAcceptor) => {
        const defaultValue = node.defaultValue;
        if (!defaultValue) {
            return;
        }

        const defaultValueType = typeComputer.computeType(defaultValue);
        const parameterType = typeComputer.computeType(node);

        if (!typeChecker.isAssignableTo(defaultValueType, parameterType)) {
            accept('error', `Expected type '${parameterType}' but got '${defaultValueType}'.`, {
                node,
                property: 'defaultValue',
                code: CODE_TYPE_MISMATCH,
            });
        }
    };
};

export const prefixOperationOperandMustHaveCorrectType = (services: SafeDsServices) => {
    const coreTypes = services.types.CoreTypes;
    const typeChecker = services.types.TypeChecker;
    const typeComputer = services.types.TypeComputer;

    return (node: SdsPrefixOperation, accept: ValidationAcceptor): void => {
        const operandType = typeComputer.computeType(node.operand);
        switch (node.operator) {
            case 'not':
                if (!typeChecker.isAssignableTo(operandType, coreTypes.Boolean)) {
                    accept('error', `Expected type '${coreTypes.Boolean}' but got '${operandType}'.`, {
                        node,
                        property: 'operand',
                        code: CODE_TYPE_MISMATCH,
                    });
                }
                return;
            case '-':
                if (
                    !typeChecker.isAssignableTo(operandType, coreTypes.Float) &&
                    !typeChecker.isAssignableTo(operandType, coreTypes.Int)
                ) {
                    accept(
                        'error',
                        `Expected type '${coreTypes.Float}' or '${coreTypes.Int}' but got '${operandType}'.`,
                        {
                            node,
                            property: 'operand',
                            code: CODE_TYPE_MISMATCH,
                        },
                    );
                }
                return;
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
            accept('error', `Expected type '${resultType}' but got '${yieldType}'.`, {
                node,
                property: 'result',
                code: CODE_TYPE_MISMATCH,
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
