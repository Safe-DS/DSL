import { AstNode, AstUtils, ValidationAcceptor } from 'langium';
import { isEmpty } from '../../helpers/collections.js';
import { pluralize } from '../../helpers/strings.js';
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
    SdsIndexedAccess,
    SdsInfixOperation,
    SdsList,
    SdsMap,
    SdsNamedType,
    SdsParameter,
    SdsPrefixOperation,
    SdsResult,
    SdsTypeCast,
    SdsTypeParameter,
    SdsYield,
} from '../generated/ast.js';
import { getArguments, getTypeArguments, getTypeParameters, TypeParameter } from '../helpers/nodeProperties.js';
import { SafeDsServices } from '../safe-ds-module.js';
import { ClassType, NamedTupleType, TypeParameterType, UnknownType } from '../typing/model.js';

export const CODE_TYPE_CALLABLE_RECEIVER = 'type/callable-receiver';
export const CODE_TYPE_MISMATCH = 'type/mismatch';
export const CODE_TYPE_MISSING_TYPE_ARGUMENTS = 'type/missing-type-arguments';
export const CODE_TYPE_MISSING_TYPE_HINT = 'type/missing-type-hint';

// -----------------------------------------------------------------------------
// Type checking
// -----------------------------------------------------------------------------

export const callArgumentTypesMustMatchParameterTypes = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;
    const typeChecker = services.typing.TypeChecker;
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsCall, accept: ValidationAcceptor) => {
        const substitutions = typeComputer.computeSubstitutionsForCall(node);

        for (const argument of getArguments(node)) {
            const parameter = nodeMapper.argumentToParameter(argument);
            if (!parameter) {
                return;
            }

            const argumentType = typeComputer.computeType(argument).substituteTypeParameters(substitutions);
            const parameterType = typeComputer.computeType(parameter).substituteTypeParameters(substitutions);

            if (!typeChecker.isSubtypeOf(argumentType, parameterType)) {
                accept('error', `Expected type '${parameterType}' but got '${argumentType}'.`, {
                    node: argument,
                    property: 'value',
                    code: CODE_TYPE_MISMATCH,
                });
            }
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
        if (node.receiver && (!callable || isSdsAnnotation(callable))) {
            accept('error', 'This expression is not callable.', {
                node: node.receiver,
                code: CODE_TYPE_CALLABLE_RECEIVER,
            });
        } else if (node.receiver && isSdsClass(callable) && !callable.parameterList) {
            accept('error', 'Cannot instantiate a class that has no constructor.', {
                node: node.receiver,
                code: CODE_TYPE_CALLABLE_RECEIVER,
            });
        }
    };
};

export const indexedAccessReceiverMustBeListOrMap = (services: SafeDsServices) => {
    const typeChecker = services.typing.TypeChecker;
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsIndexedAccess, accept: ValidationAcceptor): void => {
        if (!node.receiver) {
            /* c8 ignore next 2 */
            return;
        }

        const receiverType = typeComputer.computeType(node.receiver);
        if (!typeChecker.canBeAccessedByIndex(receiverType)) {
            accept('error', `Expected type 'List<T>' or 'Map<K, V>' but got '${receiverType}'.`, {
                node: node.receiver,
                code: CODE_TYPE_MISMATCH,
            });
        }
    };
};

export const indexedAccessIndexMustHaveCorrectType = (services: SafeDsServices) => {
    const coreClasses = services.builtins.Classes;
    const coreTypes = services.typing.CoreTypes;
    const typeChecker = services.typing.TypeChecker;
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsIndexedAccess, accept: ValidationAcceptor): void => {
        const receiverType = typeComputer.computeType(node.receiver);
        if (typeChecker.isList(receiverType)) {
            const indexType = typeComputer.computeType(node.index);
            if (!typeChecker.isSubtypeOf(indexType, coreTypes.Int)) {
                accept('error', `Expected type '${coreTypes.Int}' but got '${indexType}'.`, {
                    node,
                    property: 'index',
                    code: CODE_TYPE_MISMATCH,
                });
            }
        } else if (receiverType instanceof ClassType || receiverType instanceof TypeParameterType) {
            const mapType = typeComputer.computeMatchingSupertype(receiverType, coreClasses.Map);
            if (mapType) {
                const keyType = mapType.getTypeParameterTypeByIndex(0);
                const indexType = typeComputer.computeType(node.index);
                if (!typeChecker.isSubtypeOf(indexType, keyType)) {
                    accept('error', `Expected type '${keyType}' but got '${indexType}'.`, {
                        node,
                        property: 'index',
                        code: CODE_TYPE_MISMATCH,
                    });
                }
            }
        }
    };
};

export const infixOperationOperandsMustHaveCorrectType = (services: SafeDsServices) => {
    const coreTypes = services.typing.CoreTypes;
    const typeChecker = services.typing.TypeChecker;
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsInfixOperation, accept: ValidationAcceptor): void => {
        const leftType = typeComputer.computeType(node.leftOperand);
        const rightType = typeComputer.computeType(node.rightOperand);
        switch (node.operator) {
            case 'or':
            case 'and':
                if (node.leftOperand && !typeChecker.isSubtypeOf(leftType, coreTypes.Boolean)) {
                    accept('error', `Expected type '${coreTypes.Boolean}' but got '${leftType}'.`, {
                        node: node.leftOperand,
                        code: CODE_TYPE_MISMATCH,
                    });
                }
                if (node.rightOperand && !typeChecker.isSubtypeOf(rightType, coreTypes.Boolean)) {
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
                    node.leftOperand &&
                    !typeChecker.isSubtypeOf(leftType, coreTypes.Float) &&
                    !typeChecker.isSubtypeOf(leftType, coreTypes.Int)
                ) {
                    accept('error', `Expected type '${coreTypes.Float}' or '${coreTypes.Int}' but got '${leftType}'.`, {
                        node: node.leftOperand,
                        code: CODE_TYPE_MISMATCH,
                    });
                }
                if (
                    node.rightOperand &&
                    !typeChecker.isSubtypeOf(rightType, coreTypes.Float) &&
                    !typeChecker.isSubtypeOf(rightType, coreTypes.Int)
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

export const listMustNotContainNamedTuples = (services: SafeDsServices) => {
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsList, accept: ValidationAcceptor): void => {
        for (const element of node.elements) {
            const elementType = typeComputer.computeType(element);
            if (elementType instanceof NamedTupleType) {
                accept('error', `Cannot add a value of type '${elementType}' to a list.`, {
                    node: element,
                    code: CODE_TYPE_MISMATCH,
                });
            }
        }
    };
};

export const mapMustNotContainNamedTuples = (services: SafeDsServices) => {
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsMap, accept: ValidationAcceptor): void => {
        for (const entry of node.entries) {
            const keyType = typeComputer.computeType(entry.key);
            if (keyType instanceof NamedTupleType) {
                accept('error', `Cannot use a value of type '${keyType}' as a map key.`, {
                    node: entry,
                    property: 'key',
                    code: CODE_TYPE_MISMATCH,
                });
            }

            const valueKey = typeComputer.computeType(entry.value);
            if (valueKey instanceof NamedTupleType) {
                accept('error', `Cannot use a value of type '${valueKey}' as a map value.`, {
                    node: entry,
                    property: 'value',
                    code: CODE_TYPE_MISMATCH,
                });
            }
        }
    };
};

export const namedTypeTypeArgumentsMustMatchBounds = (services: SafeDsServices) => {
    const nodeMapper = services.helpers.NodeMapper;
    const typeChecker = services.typing.TypeChecker;
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsNamedType, accept: ValidationAcceptor): void => {
        const type = typeComputer.computeType(node);
        if (!(type instanceof ClassType) || isEmpty(type.substitutions)) {
            return;
        }

        for (const typeArgument of getTypeArguments(node)) {
            const typeParameter = nodeMapper.typeArgumentToTypeParameter(typeArgument);
            if (!typeParameter) {
                continue;
            }

            const typeArgumentType = type.substitutions.get(typeParameter);
            if (!typeArgumentType) {
                /* c8 ignore next 2 */
                continue;
            }

            const upperBound = typeComputer
                .computeUpperBound(typeParameter, { stopAtTypeParameterType: true })
                .substituteTypeParameters(type.substitutions);

            if (!typeChecker.isSubtypeOf(typeArgumentType, upperBound)) {
                accept('error', `Expected type '${upperBound}' but got '${typeArgumentType}'.`, {
                    node: typeArgument,
                    property: 'value',
                    code: CODE_TYPE_MISMATCH,
                });
            }
        }
    };
};

export const parameterDefaultValueTypeMustMatchParameterType = (services: SafeDsServices) => {
    const typeChecker = services.typing.TypeChecker;
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsParameter, accept: ValidationAcceptor) => {
        const defaultValue = node.defaultValue;
        if (!defaultValue) {
            return;
        }

        const defaultValueType = typeComputer.computeType(defaultValue);
        const parameterType = typeComputer.computeType(node);

        if (!typeChecker.isSubtypeOf(defaultValueType, parameterType)) {
            accept('error', `Expected type '${parameterType}' but got '${defaultValueType}'.`, {
                node,
                property: 'defaultValue',
                code: CODE_TYPE_MISMATCH,
            });
        }
    };
};

export const prefixOperationOperandMustHaveCorrectType = (services: SafeDsServices) => {
    const coreTypes = services.typing.CoreTypes;
    const typeChecker = services.typing.TypeChecker;
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsPrefixOperation, accept: ValidationAcceptor): void => {
        const operandType = typeComputer.computeType(node.operand);
        switch (node.operator) {
            case 'not':
                if (!typeChecker.isSubtypeOf(operandType, coreTypes.Boolean)) {
                    accept('error', `Expected type '${coreTypes.Boolean}' but got '${operandType}'.`, {
                        node,
                        property: 'operand',
                        code: CODE_TYPE_MISMATCH,
                    });
                }
                return;
            case '-':
                if (
                    !typeChecker.isSubtypeOf(operandType, coreTypes.Float) &&
                    !typeChecker.isSubtypeOf(operandType, coreTypes.Int)
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

export const typeCastMustNotAlwaysFail = (services: SafeDsServices) => {
    const typeChecker = services.typing.TypeChecker;
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsTypeCast, accept: ValidationAcceptor): void => {
        const expressionType = typeComputer.computeType(node.expression);
        const targetType = typeComputer.computeType(node.type);

        if (
            node.expression &&
            expressionType !== UnknownType &&
            !typeChecker.isSubtypeOf(expressionType, targetType) &&
            !typeChecker.isSupertypeOf(expressionType, targetType)
        ) {
            accept('error', 'This type cast can never succeed.', {
                // Using property: "expression" does not work here, probably due to eclipse-langium/langium#1218
                node,
                code: CODE_TYPE_MISMATCH,
            });
        }
    };
};

export const typeParameterDefaultValueMustMatchUpperBound = (services: SafeDsServices) => {
    const typeChecker = services.typing.TypeChecker;
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsTypeParameter, accept: ValidationAcceptor): void => {
        if (!node.defaultValue || !node.upperBound) {
            return;
        }

        const defaultValueType = typeComputer.computeType(node.defaultValue);
        const upperBoundType = typeComputer.computeUpperBound(node, { stopAtTypeParameterType: true });

        if (!typeChecker.isSubtypeOf(defaultValueType, upperBoundType)) {
            accept('error', `Expected type '${upperBoundType}' but got '${defaultValueType}'.`, {
                node,
                property: 'defaultValue',
                code: CODE_TYPE_MISMATCH,
            });
        }
    };
};

export const yieldTypeMustMatchResultType = (services: SafeDsServices) => {
    const typeChecker = services.typing.TypeChecker;
    const typeComputer = services.typing.TypeComputer;

    return (node: SdsYield, accept: ValidationAcceptor) => {
        const result = node.result?.ref;
        if (!result) {
            return;
        }

        const yieldType = typeComputer.computeType(node);
        const resultType = typeComputer.computeType(result);

        if (!typeChecker.isSubtypeOf(yieldType, resultType)) {
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
        const expectedTypeParameters = getTypeParameters(node.declaration?.ref).filter(TypeParameter.isRequired);
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
                `The type '${node.declaration?.$refText}' has required type parameters, so a type argument list must be added.`,
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
        const containingCallable = AstUtils.getContainerOfType(node, isSdsCallable);

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
