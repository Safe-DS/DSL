import { AstNode, AstNodeLocator, AstUtils, EMPTY_STREAM, Stream, stream, WorkspaceCache } from 'langium';
import { isEmpty } from '../../helpers/collections.js';
import {
    isSdsAnnotation,
    isSdsArgument,
    isSdsAssignee,
    isSdsAssignment,
    isSdsAttribute,
    isSdsBlockLambda,
    isSdsCall,
    isSdsCallable,
    isSdsCallableType,
    isSdsClass,
    isSdsClassMember,
    isSdsDeclaration,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsExpression,
    isSdsExpressionLambda,
    isSdsFunction,
    isSdsIndexedAccess,
    isSdsInfixOperation,
    isSdsLambda,
    isSdsList,
    isSdsLiteralType,
    isSdsMap,
    isSdsMemberAccess,
    isSdsMemberType,
    isSdsNamedType,
    isSdsNamedTypeDeclaration,
    isSdsParameter,
    isSdsParenthesizedExpression,
    isSdsPipeline,
    isSdsPrefixOperation,
    isSdsReference,
    isSdsResult,
    isSdsSchema,
    isSdsSegment,
    isSdsTemplateString,
    isSdsThis,
    isSdsType,
    isSdsTypeArgument,
    isSdsTypeCast,
    isSdsTypeParameter,
    isSdsUnionType,
    isSdsUnknown,
    isSdsUnknownType,
    isSdsYield,
    SdsAbstractCall,
    SdsAbstractResult,
    SdsAssignee,
    SdsCall,
    SdsCallableType,
    SdsClass,
    SdsDeclaration,
    SdsExpression,
    SdsFunction,
    SdsIndexedAccess,
    SdsInfixOperation,
    SdsLambda,
    SdsLiteralType,
    SdsMemberAccess,
    SdsNamedType,
    SdsParameter,
    SdsPrefixOperation,
    SdsReference,
    SdsSegment,
    SdsThis,
    SdsType,
    SdsTypeArgument,
    SdsTypeParameter,
} from '../generated/ast.js';
import {
    getArguments,
    getAssignees,
    getLiterals,
    getParameters,
    getParentTypes,
    getResults,
    getTypeArguments,
    getTypeParameters,
    isStatic,
    streamBlockLambdaResults,
    TypeParameter,
} from '../helpers/nodeProperties.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import {
    BooleanConstant,
    Constant,
    FloatConstant,
    IntConstant,
    isConstant,
    NullConstant,
    StringConstant,
} from '../partialEvaluation/model.js';
import { SafeDsPartialEvaluator } from '../partialEvaluation/safe-ds-partial-evaluator.js';
import { SafeDsServices } from '../safe-ds-module.js';
import {
    CallableType,
    ClassType,
    EnumType,
    EnumVariantType,
    LiteralType,
    NamedTupleEntry,
    NamedTupleType,
    NamedType,
    StaticType,
    Type,
    TypeParameterSubstitutions,
    TypeVariable,
    UnionType,
    UnknownType,
} from './model.js';
import { SafeDsCoreTypes } from './safe-ds-core-types.js';
import type { SafeDsTypeChecker } from './safe-ds-type-checker.js';
import { SafeDsClasses } from '../builtins/safe-ds-classes.js';
import { SafeDsTypeFactory } from './safe-ds-type-factory.js';

export class SafeDsTypeComputer {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly coreClasses: SafeDsClasses;
    private readonly coreTypes: SafeDsCoreTypes;
    private readonly factory: SafeDsTypeFactory;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly partialEvaluator: SafeDsPartialEvaluator;
    private readonly typeChecker: SafeDsTypeChecker;

    /**
     * Contains all lambda parameters that are currently being computed. When computing the types of lambda parameters,
     * they must only access the type of the containing lambda, if they are not contained in this set themselves.
     * Otherwise, this would cause endless recursion.
     */
    private readonly incompleteLambdaParameters = new Set<SdsParameter>();
    private readonly nodeTypeCache: WorkspaceCache<string, Type>;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.coreClasses = services.builtins.Classes;
        this.coreTypes = services.typing.CoreTypes;
        this.factory = services.typing.TypeFactory;
        this.nodeMapper = services.helpers.NodeMapper;
        this.partialEvaluator = services.evaluation.PartialEvaluator;
        this.typeChecker = services.typing.TypeChecker;

        this.nodeTypeCache = new WorkspaceCache(services.shared);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Compute type
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Computes the type of the given node and applies the given substitutions for type parameters. The result gets
     * simplified as much as possible.
     */
    computeType(node: AstNode | undefined, substitutions: TypeParameterSubstitutions = NO_SUBSTITUTIONS): Type {
        if (!node) {
            return UnknownType;
        }

        const id = this.getNodeId(node);

        // Only cache fully substituted types
        let unsubstitutedType: Type | undefined = this.nodeTypeCache.get(id);
        if (!unsubstitutedType) {
            unsubstitutedType = this.doComputeType(node).simplify();

            if (unsubstitutedType.isFullySubstituted) {
                this.nodeTypeCache.set(id, unsubstitutedType);
            }
        }

        if (isEmpty(substitutions)) {
            return unsubstitutedType;
        }

        // Substitute type parameters
        const simplifiedSubstitutions = new Map(
            [...substitutions].map(([typeParameter, type]) => [typeParameter, type.simplify()]),
        );
        return unsubstitutedType.substituteTypeParameters(simplifiedSubstitutions);
    }

    private getNodeId(node: AstNode) {
        const documentUri = AstUtils.getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        return `${documentUri}~${nodePath}`;
    }

    private doComputeType(node: AstNode | undefined): Type {
        if (isSdsAssignee(node)) {
            return this.computeTypeOfAssignee(node);
        } else if (isSdsDeclaration(node)) {
            return this.computeTypeOfDeclaration(node);
        } else if (isSdsExpression(node)) {
            return this.computeTypeOfExpression(node);
        } else if (isSdsType(node)) {
            return this.computeTypeOfType(node);
        } else if (isSdsTypeArgument(node)) {
            return this.computeTypeOfType(node.value);
        } /* c8 ignore start */ else {
            return UnknownType;
        } /* c8 ignore stop */
    }

    private computeTypeOfAssignee(node: SdsAssignee): Type {
        const containingAssignment = AstUtils.getContainerOfType(node, isSdsAssignment);
        if (!containingAssignment) {
            /* c8 ignore next 2 */
            return UnknownType;
        }

        const assigneePosition = node.$containerIndex ?? -1;
        const expressionType = this.computeType(containingAssignment?.expression);
        if (expressionType instanceof NamedTupleType) {
            return expressionType.getTypeOfEntryByIndex(assigneePosition);
        } else if (assigneePosition === 0) {
            return expressionType;
        }

        return UnknownType;
    }

    private computeTypeOfDeclaration(node: SdsDeclaration): Type {
        if (isSdsAnnotation(node)) {
            const parameterEntries = getParameters(node).map(
                (it) => new NamedTupleEntry(it, it.name, this.computeType(it.type)),
            );

            return this.factory.createCallableType(
                node,
                undefined,
                this.factory.createNamedTupleType(...parameterEntries),
                this.factory.createNamedTupleType(),
            );
        } else if (isSdsAttribute(node)) {
            return this.computeType(node.type);
        } else if (isSdsClass(node)) {
            return this.factory.createClassType(node, NO_SUBSTITUTIONS, false);
        } else if (isSdsEnum(node)) {
            return this.factory.createEnumType(node, false);
        } else if (isSdsEnumVariant(node)) {
            return this.factory.createEnumVariantType(node, false);
        } else if (isSdsFunction(node)) {
            return this.computeTypeOfCallableWithManifestTypes(node);
        } else if (isSdsParameter(node)) {
            return this.computeTypeOfParameter(node);
        } else if (isSdsPipeline(node)) {
            return UnknownType;
        } else if (isSdsResult(node)) {
            return this.computeType(node.type);
        } else if (isSdsSchema(node)) {
            return UnknownType;
        } else if (isSdsSegment(node)) {
            return this.computeTypeOfCallableWithManifestTypes(node);
        } else if (isSdsTypeParameter(node)) {
            return this.factory.createTypeVariable(node, false);
        } /* c8 ignore start */ else {
            return UnknownType;
        } /* c8 ignore stop */
    }

    private computeTypeOfCallableWithManifestTypes(node: SdsFunction | SdsSegment | SdsCallableType): Type {
        const parameterEntries = getParameters(node).map(
            (it) => new NamedTupleEntry(it, it.name, this.computeType(it.type)),
        );
        const resultEntries = getResults(node.resultList).map(
            (it) => new NamedTupleEntry(it, it.name, this.computeType(it.type)),
        );

        return this.factory.createCallableType(
            node,
            undefined,
            this.factory.createNamedTupleType(...parameterEntries),
            this.factory.createNamedTupleType(...resultEntries),
        );
    }

    private computeTypeOfParameter(node: SdsParameter): Type {
        // Manifest type
        if (node.type) {
            const type = this.computeType(node.type);
            return this.rememberParameterInCallableType(node, type);
        }

        // Infer type from context
        const contextType = this.computeTypeOfParameterContext(node);
        if (!(contextType instanceof CallableType)) {
            return UnknownType;
        }

        const parameterPosition = node.$containerIndex ?? -1;
        const type = contextType.getParameterTypeByIndex(parameterPosition);
        return this.rememberParameterInCallableType(node, type);
    }

    private computeTypeOfParameterContext(node: SdsParameter): Type {
        const containingCallable = AstUtils.getContainerOfType(node, isSdsCallable);
        if (!isSdsLambda(containingCallable)) {
            return UnknownType;
        }

        const containerOfLambda = containingCallable.$container;

        // Lambda passed as argument
        if (isSdsArgument(containerOfLambda)) {
            // Lookup parameter type in lambda unless the lambda is being computed. These contain the correct
            // substitutions for type parameters.
            if (!this.incompleteLambdaParameters.has(node)) {
                return this.computeType(containingCallable);
            }

            const parameter = this.nodeMapper.argumentToParameter(containerOfLambda);
            if (!parameter) {
                return UnknownType;
            }

            return this.computeType(parameter);
        }

        // Lambda passed as default value
        if (isSdsParameter(containerOfLambda)) {
            return this.computeType(containerOfLambda);
        }

        // Yielded lambda
        else if (isSdsAssignment(containerOfLambda)) {
            const firstAssignee = getAssignees(containerOfLambda)[0];
            if (!isSdsYield(firstAssignee)) {
                return UnknownType;
            }
            return this.computeType(firstAssignee.result?.ref);
        }

        return UnknownType;
    }

    private rememberParameterInCallableType(node: SdsParameter, type: Type) {
        if (type instanceof CallableType) {
            return this.factory.createCallableType(type.callable, node, type.inputType, type.outputType);
        } else {
            return type;
        }
    }

    private computeTypeOfExpression(node: SdsExpression): Type {
        // Type cast
        if (isSdsTypeCast(node)) {
            return this.computeType(node.type);
        }

        // Partial evaluation (definitely handles SdsBoolean, SdsFloat, SdsInt, SdsNull, and SdsString)
        const evaluatedNode = this.partialEvaluator.evaluate(node);
        if (evaluatedNode instanceof Constant) {
            return this.factory.createLiteralType(evaluatedNode);
        }

        // Terminal cases
        if (isSdsTemplateString(node)) {
            return this.coreTypes.String;
        } else if (isSdsUnknown(node)) {
            return this.coreTypes.Nothing;
        }

        // Recursive cases
        else if (isSdsArgument(node)) {
            return this.computeType(node.value);
        } else if (isSdsCall(node)) {
            return this.computeTypeOfCall(node);
        } else if (isSdsIndexedAccess(node)) {
            return this.computeTypeOfIndexedAccess(node);
        } else if (isSdsInfixOperation(node)) {
            switch (node.operator) {
                // Boolean operators
                case 'or':
                case 'and':
                    return this.coreTypes.Boolean;

                // Equality operators
                case '==':
                case '!=':
                case '===':
                case '!==':
                    return this.coreTypes.Boolean;

                // Comparison operators
                case '<':
                case '<=':
                case '>=':
                case '>':
                    return this.coreTypes.Boolean;

                // Arithmetic operators
                case '+':
                case '-':
                case '*':
                case '/':
                    return this.computeTypeOfArithmeticInfixOperation(node);

                // Elvis operator
                case '?:':
                    return this.computeTypeOfElvisOperation(node);

                // Unknown operator
                /* c8 ignore next 2 */
                default:
                    return UnknownType;
            }
        } else if (isSdsLambda(node)) {
            return this.computeTypeOfLambda(node);
        } else if (isSdsList(node)) {
            const elementType = this.lowestCommonSupertype(node.elements.map((it) => this.computeType(it)));
            return this.coreTypes.List(elementType);
        } else if (isSdsMap(node)) {
            let keyType = this.lowestCommonSupertype(node.entries.map((it) => this.computeType(it.key)));

            // Keeping literal types for keys is too strict: We would otherwise infer the key type of `{"a": 1, "b": 2}`
            // as `Literal<"a", "b">`. But then we would be unable to pass an unknown `String` as the key in an indexed
            // access. Where possible, we already validate the existence of keys in indexed accesses using the partial
            // evaluator.
            keyType = this.computeClassTypeForLiteralType(keyType);

            const valueType = this.lowestCommonSupertype(node.entries.map((it) => this.computeType(it.value)));
            return this.coreTypes.Map(keyType, valueType);
        } else if (isSdsMemberAccess(node)) {
            return this.computeTypeOfMemberAccess(node);
        } else if (isSdsParenthesizedExpression(node)) {
            return this.computeType(node.expression);
        } else if (isSdsPrefixOperation(node)) {
            switch (node.operator) {
                case 'not':
                    return this.coreTypes.Boolean;
                case '-':
                    return this.computeTypeOfArithmeticPrefixOperation(node);

                // Unknown operator
                /* c8 ignore next 2 */
                default:
                    return UnknownType;
            }
        } else if (isSdsReference(node)) {
            return this.computeTypeOfReference(node);
        } else if (isSdsThis(node)) {
            return this.computeTypeOfThis(node);
        } /* c8 ignore start */ else {
            return UnknownType;
        } /* c8 ignore stop */
    }

    private computeTypeOfCall(node: SdsCall): Type {
        const receiverType = this.computeType(node.receiver);
        const nonNullableReceiverType = this.computeNonNullableType(receiverType);
        let result: Type = UnknownType;

        if (nonNullableReceiverType instanceof CallableType) {
            if (!isSdsAnnotation(nonNullableReceiverType.callable)) {
                result = nonNullableReceiverType.outputType;
            }

            // Substitute type parameters
            if (isSdsFunction(nonNullableReceiverType.callable)) {
                const substitutions = this.computeSubstitutionsForCall(node);
                result = result.substituteTypeParameters(substitutions);
            }
        } else if (nonNullableReceiverType instanceof StaticType) {
            const instanceType = nonNullableReceiverType.instanceType;
            if (isSdsCallable(instanceType.declaration)) {
                result = instanceType;
            }

            // Substitute type parameters
            if (instanceType instanceof ClassType) {
                const substitutions = this.computeSubstitutionsForCall(node);

                result = this.factory.createClassType(
                    instanceType.declaration,
                    substitutions,
                    instanceType.isExplicitlyNullable,
                );
            }
        }

        // Update nullability
        return result.withExplicitNullability(receiverType.isExplicitlyNullable && node.isNullSafe);
    }

    private computeTypeOfIndexedAccess(node: SdsIndexedAccess): Type {
        const receiverType = this.computeType(node.receiver);
        if (!(receiverType instanceof ClassType) && !(receiverType instanceof TypeVariable)) {
            return UnknownType;
        }

        // Receiver is a list
        const listType = this.computeMatchingSupertype(receiverType, this.coreClasses.List);
        if (listType) {
            return listType
                .getTypeParameterTypeByIndex(0)
                .withExplicitNullability(listType.isExplicitlyNullable && node.isNullSafe);
        }

        // Receiver is a map
        const mapType = this.computeMatchingSupertype(receiverType, this.coreClasses.Map);
        if (mapType) {
            return mapType
                .getTypeParameterTypeByIndex(1)
                .withExplicitNullability(mapType.isExplicitlyNullable && node.isNullSafe);
        }

        return UnknownType;
    }

    private computeTypeOfArithmeticInfixOperation(node: SdsInfixOperation): Type {
        const leftOperandType = this.computeType(node.leftOperand);
        const rightOperandType = this.computeType(node.rightOperand);

        if (
            this.typeChecker.isSubtypeOf(leftOperandType, this.coreTypes.Int) &&
            this.typeChecker.isSubtypeOf(rightOperandType, this.coreTypes.Int)
        ) {
            return this.coreTypes.Int;
        } else {
            return this.coreTypes.Float;
        }
    }

    private computeTypeOfElvisOperation(node: SdsInfixOperation): Type {
        const leftOperandType = this.computeType(node.leftOperand);
        if (leftOperandType.isExplicitlyNullable) {
            const rightOperandType = this.computeType(node.rightOperand);
            return this.lowestCommonSupertype([leftOperandType.withExplicitNullability(false), rightOperandType]);
        } else {
            return leftOperandType;
        }
    }

    private computeTypeOfLambda(node: SdsLambda): Type {
        // Remember lambda parameters
        const parameters = getParameters(node);
        parameters.forEach((it) => {
            this.incompleteLambdaParameters.add(it);
        });

        const parameterEntries = parameters.map((it) => new NamedTupleEntry(it, it.name, this.computeType(it)));
        const resultEntries = this.buildLambdaResultEntries(node);

        const unsubstitutedType = this.factory.createCallableType(
            node,
            undefined,
            this.factory.createNamedTupleType(...parameterEntries),
            this.factory.createNamedTupleType(...resultEntries),
        );
        const substitutions = this.computeSubstitutionsForLambda(node, unsubstitutedType);

        // Forget lambda parameters
        parameters.forEach((it) => {
            this.incompleteLambdaParameters.delete(it);
        });

        return unsubstitutedType.substituteTypeParameters(substitutions);
    }

    private buildLambdaResultEntries(node: SdsLambda): NamedTupleEntry<SdsAbstractResult>[] {
        if (isSdsExpressionLambda(node)) {
            return [new NamedTupleEntry<SdsAbstractResult>(undefined, 'result', this.computeType(node.result))];
        } else if (isSdsBlockLambda(node)) {
            return streamBlockLambdaResults(node)
                .map((it) => new NamedTupleEntry(it, it.name, this.computeType(it)))
                .toArray();
        } /* c8 ignore start */ else {
            return [];
        } /* c8 ignore stop */
    }

    private computeTypeOfMemberAccess(node: SdsMemberAccess) {
        const memberType = this.computeType(node.member);

        // A member access of an enum variant without parameters always yields an instance, even if it is not in a call
        if (memberType instanceof StaticType && !isSdsCall(node.$container)) {
            const instanceType = memberType.instanceType;

            if (instanceType instanceof EnumVariantType && isEmpty(getParameters(instanceType.declaration))) {
                return instanceType;
            }
        }

        const receiverType = this.computeType(node.receiver);
        let result: Type = memberType;

        // Substitute type parameters
        const substitutions = this.computeSubstitutionsForMemberAccess(node);
        result = result.substituteTypeParameters(substitutions);

        // Update nullability
        return result.withExplicitNullability(
            (receiverType.isExplicitlyNullable && node.isNullSafe) || result.isExplicitlyNullable,
        );
    }

    private computeTypeOfArithmeticPrefixOperation(node: SdsPrefixOperation): Type {
        const operandType = this.computeType(node.operand);

        if (this.typeChecker.isSubtypeOf(operandType, this.coreTypes.Int)) {
            return this.coreTypes.Int;
        } else {
            return this.coreTypes.Float;
        }
    }

    private computeTypeOfReference(node: SdsReference): Type {
        const target = node.target.ref;
        const instanceType = this.computeType(target);

        if (isSdsNamedTypeDeclaration(target) && instanceType instanceof NamedType) {
            return this.factory.createStaticType(instanceType.withExplicitNullability(false));
        } else {
            return instanceType;
        }
    }

    private computeTypeOfThis(node: SdsThis): Type {
        // If closest callable is a class, return the class type
        const containingCallable = AstUtils.getContainerOfType(node, isSdsCallable);
        if (isSdsClass(containingCallable)) {
            return this.computeType(containingCallable);
        }

        // Invalid if the callable is not a class member or static
        if (!isSdsClassMember(containingCallable) || isStatic(containingCallable)) {
            return UnknownType;
        }

        // Otherwise, return the type of the containing class or unknown if not in a class
        const containingClass = AstUtils.getContainerOfType(containingCallable, isSdsClass);
        return this.computeType(containingClass);
    }

    private computeTypeOfType(node: SdsType): Type {
        if (isSdsCallableType(node)) {
            return this.computeTypeOfCallableWithManifestTypes(node);
        } else if (isSdsLiteralType(node)) {
            return this.computeTypeOfLiteralType(node);
        } else if (isSdsMemberType(node)) {
            return this.computeType(node.member);
        } else if (isSdsNamedType(node)) {
            return this.computeTypeOfNamedType(node);
        } else if (isSdsUnionType(node)) {
            const typeArguments = getTypeArguments(node.typeArgumentList);
            return this.factory.createUnionType(
                ...typeArguments.map((typeArgument) => this.computeType(typeArgument.value)),
            );
        } else if (isSdsUnknownType(node)) {
            return UnknownType;
        } /* c8 ignore start */ else {
            return UnknownType;
        } /* c8 ignore stop */
    }

    private computeTypeOfLiteralType(node: SdsLiteralType): Type {
        const constants = getLiterals(node).map((it) => this.partialEvaluator.evaluate(it));
        if (constants.every(isConstant)) {
            return this.factory.createLiteralType(...constants);
        } /* c8 ignore start */ else {
            return UnknownType;
        } /* c8 ignore stop */
    }

    private computeTypeOfNamedType(node: SdsNamedType) {
        const unparameterizedType = this.computeType(node.declaration?.ref).withExplicitNullability(node.isNullable);
        if (!(unparameterizedType instanceof ClassType)) {
            return unparameterizedType;
        }

        const substitutions = this.computeSubstitutionsForNamedType(node, unparameterizedType.declaration);
        return this.factory.createClassType(unparameterizedType.declaration, substitutions, node.isNullable);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Various type conversions
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Returns the non-nullable type for the given type. The result is simplified as much as possible.
     */
    computeNonNullableType(type: Type): Type {
        return type.withExplicitNullability(false).simplify();
    }

    /**
     * Returns the lowest class type for the given literal type. If the given type is not a literal type, it is returned
     * as is.
     */
    computeClassTypeForLiteralType(type: Type): Type {
        if (!(type instanceof LiteralType)) {
            return type;
        }

        return this.lowestCommonSupertype(type.constants.map((it) => this.computeClassTypeForConstant(it)));
    }

    /**
     * Returns the lowest class type for the given constant.
     */
    computeClassTypeForConstant(constant: Constant): Type {
        if (constant instanceof BooleanConstant) {
            return this.coreTypes.Boolean;
        } else if (constant instanceof FloatConstant) {
            return this.coreTypes.Float;
        } else if (constant instanceof IntConstant) {
            return this.coreTypes.Int;
        } else if (constant === NullConstant) {
            return this.coreTypes.NothingOrNull;
        } else if (constant instanceof StringConstant) {
            return this.coreTypes.String;
        } /* c8 ignore start */ else {
            throw new Error(`Unexpected constant type: ${constant.constructor.name}`);
        } /* c8 ignore stop */
    }

    computeCallableTypeForStaticType(type: StaticType): Type {
        const instanceType = type.instanceType;
        if (instanceType instanceof ClassType) {
            const declaration = instanceType.declaration;
            if (!declaration.parameterList) {
                return UnknownType;
            }

            const parameterEntries = this.factory.createNamedTupleType(
                ...getParameters(declaration).map((it) => new NamedTupleEntry(it, it.name, this.computeType(it))),
            );
            const resultEntries = this.factory.createNamedTupleType(
                new NamedTupleEntry<SdsAbstractResult>(undefined, 'instance', instanceType),
            );

            return this.factory.createCallableType(declaration, undefined, parameterEntries, resultEntries);
        } else if (instanceType instanceof EnumVariantType) {
            const declaration = instanceType.declaration;

            const parameterEntries = this.factory.createNamedTupleType(
                ...getParameters(declaration).map((it) => new NamedTupleEntry(it, it.name, this.computeType(it))),
            );
            const resultEntries = this.factory.createNamedTupleType(
                new NamedTupleEntry<SdsAbstractResult>(undefined, 'instance', instanceType),
            );

            return this.factory.createCallableType(declaration, undefined, parameterEntries, resultEntries);
        } else {
            return UnknownType;
        }
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Type parameter bounds
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Returns the upper bound for the given input. If no upper bound is specified explicitly, the result is `Any?`. If
     * invalid upper bounds are specified, but are invalid (e.g. because of an unresolved reference or a cycle),
     * `unknown` is returned. The result is simplified as much as possible.
     */
    computeUpperBound(nodeOrType: SdsTypeParameter | TypeVariable, options: ComputeUpperBoundOptions = {}): Type {
        let type: TypeVariable;
        if (nodeOrType instanceof TypeVariable) {
            type = nodeOrType;
        } else {
            type = this.computeType(nodeOrType) as TypeVariable;
        }

        const result = this.doComputeUpperBound(type, options);
        return result.withExplicitNullability(result.isExplicitlyNullable || type.isExplicitlyNullable);
    }

    private doComputeUpperBound(type: TypeVariable, options: ComputeUpperBoundOptions): Type {
        const upperBound = type.declaration.upperBound;
        if (!upperBound) {
            return this.coreTypes.AnyOrNull;
        }

        const boundType = this.computeType(upperBound);
        if (boundType instanceof LiteralType) {
            return boundType;
        } else if (!(boundType instanceof NamedType)) {
            return UnknownType;
        } else if (options.stopAtTypeVariable || !(boundType instanceof TypeVariable)) {
            return boundType;
        } else {
            return this.doComputeUpperBound(boundType, options);
        }
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Type parameter substitutions
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Computes substitutions for the type parameters of a callable in the context of a call.
     *
     * @param node The call to compute substitutions for.
     * @returns The computed substitutions for the type parameters of the callable.
     */
    computeSubstitutionsForCall(node: SdsAbstractCall): TypeParameterSubstitutions {
        return this.doComputeSubstitutionsForCall(node);
    }

    private doComputeSubstitutionsForCall(
        node: SdsAbstractCall,
        precomputedArgumentTypes?: Map<AstNode | undefined, Type>,
    ): TypeParameterSubstitutions {
        // Compute substitutions for member access
        const substitutionsFromReceiver =
            isSdsCall(node) && isSdsMemberAccess(node.receiver)
                ? this.computeSubstitutionsForMemberAccess(node.receiver)
                : NO_SUBSTITUTIONS;

        // Compute substitutions for arguments
        const callable = this.nodeMapper.callToCallable(node);
        const typeParameters = getTypeParameters(callable);
        if (isEmpty(typeParameters)) {
            return substitutionsFromReceiver;
        }

        const parameters = getParameters(callable);
        const args = getArguments(node);

        const parametersToArguments = this.nodeMapper.parametersToArguments(parameters, args);
        const parameterTypesToArgumentTypes: [Type, Type][] = parameters.map((parameter) => {
            const argument = parametersToArguments.get(parameter);
            return [
                this.computeType(parameter.type),
                // Use precomputed argument types (lambdas) if available. This prevents infinite recursion.
                precomputedArgumentTypes?.get(argument?.value) ??
                    this.computeType(argument?.value ?? parameter.defaultValue),
            ];
        });

        const substitutionsFromArguments = this.computeSubstitutionsForArguments(
            typeParameters,
            parameterTypesToArgumentTypes,
        );

        return new Map([...substitutionsFromReceiver, ...substitutionsFromArguments]);
    }

    /**
     * Computes substitutions for the type parameters of a callable in the context of overriding another callable.
     *
     * @param ownMemberType The type of the overriding callable.
     * @param overriddenMemberType The type of the overridden callable.
     */
    computeSubstitutionsForOverriding(ownMemberType: Type, overriddenMemberType: Type): TypeParameterSubstitutions {
        if (!(ownMemberType instanceof CallableType) || !(overriddenMemberType instanceof CallableType)) {
            return NO_SUBSTITUTIONS;
        }

        const ownTypeParameters = getTypeParameters(ownMemberType.callable);
        if (isEmpty(ownTypeParameters)) {
            return NO_SUBSTITUTIONS;
        }

        const ownParameterTypes = ownMemberType.inputType.entries.map((it) => it.type);
        const overriddenParameterTypes = overriddenMemberType.inputType.entries.map((it) => it.type);

        const minimumParameterCount = Math.min(ownParameterTypes.length, overriddenParameterTypes.length);
        const ownTypesToOverriddenTypes: [Type, Type][] = [];

        for (let i = 0; i < minimumParameterCount; i++) {
            ownTypesToOverriddenTypes.push([ownParameterTypes[i]!, overriddenParameterTypes[i]!]);
        }

        return this.computeSubstitutionsForArguments(ownTypeParameters, ownTypesToOverriddenTypes);
    }

    private computeSubstitutionsForLambda(node: SdsLambda, unsubstitutedType: Type): TypeParameterSubstitutions {
        const containerOfLambda = node.$container;
        if (!isSdsArgument(containerOfLambda)) {
            return NO_SUBSTITUTIONS;
        }

        const containingCall = AstUtils.getContainerOfType(containerOfLambda, isSdsCall);
        if (!containingCall) {
            /* c8 ignore next 2 */
            return NO_SUBSTITUTIONS;
        }

        const precomputedArgumentTypes = new Map([[node, unsubstitutedType]]);
        return this.doComputeSubstitutionsForCall(containingCall, precomputedArgumentTypes);
    }

    private computeSubstitutionsForMemberAccess(node: SdsMemberAccess): TypeParameterSubstitutions {
        const receiverType = this.computeType(node.receiver);
        if (receiverType instanceof ClassType) {
            // Must also work for inherited members
            const classContainingMember = AstUtils.getContainerOfType(node.member?.target.ref, isSdsClass);
            const typeContainingMember = this.computeMatchingSupertype(receiverType, classContainingMember);

            if (typeContainingMember) {
                return typeContainingMember.substitutions;
            }
        }

        return NO_SUBSTITUTIONS;
    }

    private computeSubstitutionsForNamedType(node: SdsNamedType, clazz: SdsClass): TypeParameterSubstitutions {
        const typeParameters = getTypeParameters(clazz);
        if (isEmpty(typeParameters)) {
            return NO_SUBSTITUTIONS;
        }

        // Map type parameters to the first type argument that sets it
        const typeArgumentsByTypeParameters = new Map<SdsTypeParameter, SdsTypeArgument>();
        for (const typeArgument of getTypeArguments(node)) {
            const typeParameter = this.nodeMapper.typeArgumentToTypeParameter(typeArgument);
            if (typeParameter && !typeArgumentsByTypeParameters.has(typeParameter)) {
                typeArgumentsByTypeParameters.set(typeParameter, typeArgument);
            }
        }

        // Compute substitutions (ordered by the position of the type parameters)
        const result = new Map<SdsTypeParameter, Type>();

        for (const typeParameter of typeParameters) {
            const typeArgument = typeArgumentsByTypeParameters.get(typeParameter);
            const type = this.computeType(typeArgument?.value ?? typeParameter.defaultValue);
            result.set(typeParameter, type);
        }

        return result;
    }

    /**
     * Computes substitutions for the given type parameters in a list of parameter types based on the corresponding
     * argument types.
     *
     * @param typeParameters The type parameters to compute substitutions for.
     * @param parameterTypesToArgumentTypes Pairs of parameter types and the corresponding argument types.
     * @returns The computed substitutions for the type parameters in the parameter types.
     */
    private computeSubstitutionsForArguments(
        typeParameters: SdsTypeParameter[],
        parameterTypesToArgumentTypes: [Type, Type][],
    ): TypeParameterSubstitutions {
        // Build initial state
        const state: ComputeSubstitutionsForParametersState = {
            substitutions: new Map(typeParameters.map((it) => [it, UnknownType])),
            remainingVariances: new Map(typeParameters.map((it) => [it, 'bivariant'])),
        };

        // Compute substitutions
        for (const [parameterType, argumentType] of parameterTypesToArgumentTypes) {
            this.computeSubstitutionsForParameter(parameterType, argumentType, 'covariant', state);
        }

        // Normalize substitutions
        for (const [typeParameter, substitution] of state.substitutions) {
            let newSubstitution = substitution;

            // Replace unknown types by default values or lower bound (Nothing)
            if (newSubstitution === UnknownType) {
                const defaultValueType = this.computeType(typeParameter.defaultValue);
                if (defaultValueType === UnknownType) {
                    state.substitutions.set(typeParameter, this.coreTypes.Nothing);
                    continue;
                } else {
                    newSubstitution = defaultValueType;
                }
            }

            // Clamp to upper bound
            const upperBound = this.computeUpperBound(typeParameter, {
                stopAtTypeVariable: true,
            }).substituteTypeParameters(state.substitutions);

            if (!this.typeChecker.isSubtypeOf(newSubstitution, upperBound)) {
                newSubstitution = upperBound;
            }

            state.substitutions.set(typeParameter, newSubstitution);
        }

        return state.substitutions;
    }

    private computeSubstitutionsForParameter(
        parameterType: Type,
        argumentType: Type,
        currentVariance: Variance,
        state: ComputeSubstitutionsForParametersState,
    ) {
        if (argumentType instanceof TypeVariable && state.substitutions.has(argumentType.declaration)) {
            // Can happen for lambdas without manifest parameter types. We gain no information here.
            return;
        } else if (parameterType instanceof CallableType && argumentType instanceof CallableType) {
            // Compare parameters
            const parameterTypeParameters = parameterType.inputType.entries;
            const argumentTypeParameters = argumentType.inputType.entries;
            const minParametersLength = Math.min(parameterTypeParameters.length, argumentTypeParameters.length);
            for (let i = 0; i < minParametersLength; i++) {
                const parameterEntry = parameterTypeParameters[i]!;
                const argumentEntry = argumentTypeParameters[i]!;
                this.computeSubstitutionsForParameter(
                    parameterEntry.type,
                    argumentEntry.type,
                    this.flippedVariance(currentVariance),
                    state,
                );
            }

            // Compare results
            const parameterTypeResults = parameterType.outputType.entries;
            const argumentTypeResults = argumentType.outputType.entries;
            const minResultsLength = Math.min(parameterTypeResults.length, argumentTypeResults.length);
            for (let i = 0; i < minResultsLength; i++) {
                const parameterEntry = parameterTypeResults[i]!;
                const argumentEntry = argumentTypeResults[i]!;
                this.computeSubstitutionsForParameter(parameterEntry.type, argumentEntry.type, currentVariance, state);
            }
        } else if (parameterType instanceof CallableType && argumentType instanceof StaticType) {
            if (currentVariance === 'covariant') {
                const callableArgumentType = this.computeCallableTypeForStaticType(argumentType);
                this.computeSubstitutionsForParameter(parameterType, callableArgumentType, currentVariance, state);
            }
        } else if (parameterType instanceof ClassType && argumentType instanceof ClassType) {
            let matchingParameterType: ClassType | undefined = parameterType;
            let matchingArgumentType: ClassType | undefined = argumentType;

            if (currentVariance === 'covariant') {
                matchingArgumentType = this.computeMatchingSupertype(argumentType, parameterType.declaration);
            } else if (currentVariance === 'contravariant') {
                matchingParameterType = this.computeMatchingSupertype(parameterType, argumentType.declaration);
            }

            if (!matchingParameterType || !matchingArgumentType) {
                /* c8 ignore next 2 */
                return;
            }

            const parameterTypeParameters = getTypeParameters(parameterType.declaration);
            for (const typeParameter of parameterTypeParameters) {
                const argumentTypeSubstitutions = matchingParameterType.substitutions.get(typeParameter);
                const parameterTypeSubstitutions = matchingArgumentType.substitutions.get(typeParameter);
                if (!argumentTypeSubstitutions || !parameterTypeSubstitutions) {
                    /* c8 ignore next 2 */
                    continue;
                }

                if (TypeParameter.isCovariant(typeParameter)) {
                    this.computeSubstitutionsForParameter(
                        argumentTypeSubstitutions,
                        parameterTypeSubstitutions,
                        currentVariance,
                        state,
                    );
                } else if (TypeParameter.isContravariant(typeParameter)) {
                    this.computeSubstitutionsForParameter(
                        argumentTypeSubstitutions,
                        parameterTypeSubstitutions,
                        this.flippedVariance(currentVariance),
                        state,
                    );
                }
            }
        } else if (parameterType instanceof TypeVariable) {
            const currentSubstitution = state.substitutions.get(parameterType.declaration);
            const remainingVariance = state.remainingVariances.get(parameterType.declaration);
            if (!currentSubstitution) {
                /* c8 ignore next 2 */
                return;
            }

            if (remainingVariance === 'bivariant') {
                state.substitutions.set(parameterType.declaration, argumentType);
                state.remainingVariances.set(parameterType.declaration, currentVariance);
            } else if (remainingVariance === 'covariant' && currentVariance === 'covariant') {
                const lowestCommonSupertype = this.lowestCommonSupertype([currentSubstitution, argumentType]);
                state.substitutions.set(parameterType.declaration, lowestCommonSupertype);
            } else if (remainingVariance === 'contravariant' && currentVariance === 'contravariant') {
                const highestCommonSubtype = this.highestCommonSubtype([currentSubstitution, argumentType]);
                state.substitutions.set(parameterType.declaration, highestCommonSubtype);
            }
        }
    }

    private flippedVariance(variance: Variance): Variance {
        if (variance === 'covariant') {
            return 'contravariant';
        } /* c8 ignore start */ else if (variance === 'contravariant') {
            return 'covariant';
        } else {
            return variance;
        } /* c8 ignore stop */
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Lowest common supertype
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Computes the lowest common supertype for the given types. The result is simplified as much as possible.
     */
    private lowestCommonSupertype(types: Type[], options: LowestCommonSupertypeOptions = {}): Type {
        // Simplify types
        const simplifiedTypes = this.simplifyTypesLCS(types, options);

        // A single type is its own lowest common supertype
        if (simplifiedTypes.length === 1) {
            return simplifiedTypes[0]!;
        }

        // Replace type variables by their upper bound
        const replacedTypes = this.replaceVariablesWithUpperBound(simplifiedTypes);

        // Partition types by their kind
        const partitionedTypes = this.partitionTypesLCS(replacedTypes);

        // Includes unknown type
        if (partitionedTypes.containsUnknownType) {
            return this.coreTypes.AnyOrNull;
        }

        // The result must be nullable if any of the types is nullable
        const isNullable = replacedTypes.some((it) => it.isExplicitlyNullable);

        // Includes unhandled type
        if (partitionedTypes.containsOtherType) {
            return this.Any(isNullable);
        }

        // Class-based types
        if (!isEmpty(partitionedTypes.classTypes)) {
            if (!isEmpty(partitionedTypes.enumTypes) || !isEmpty(partitionedTypes.enumVariantTypes)) {
                // Class types other than Any/Any? are never compatible to enum types/enum variant types
                return this.Any(isNullable);
            } else {
                return this.lowestCommonSupertypeForClassBasedTypes(partitionedTypes.classTypes, isNullable);
            }
        }

        // Enum-based types
        return this.lowestCommonSupertypeForEnumBasedTypes(
            partitionedTypes.enumTypes,
            partitionedTypes.enumVariantTypes,
            isNullable,
        );
    }

    /**
     * Simplifies a list of types for the purpose of computing the lowest common supertype (LCS).
     */
    private simplifyTypesLCS(types: Type[], options: LowestCommonSupertypeOptions): Type[] {
        if (options.skipTypeSimplification) {
            return types;
        }

        const simplifiedType = this.factory.createUnionType(...types).simplify();

        if (simplifiedType instanceof UnionType) {
            return simplifiedType.types;
        } else {
            return [simplifiedType];
        }
    }

    private replaceVariablesWithUpperBound(simplifiedTypes: Type[]) {
        return simplifiedTypes.map((it) => {
            if (it instanceof TypeVariable) {
                return this.computeUpperBound(it);
            } else {
                return it;
            }
        });
    }

    /**
     * Partitions the given types by their kind. This function assumes that union types have been removed. It is only
     * meant to be used when computing the lowest common supertype (LCS).
     */
    private partitionTypesLCS(types: Type[]): PartitionTypesLCSResult {
        const result: PartitionTypesLCSResult = {
            classTypes: [],
            enumTypes: [],
            enumVariantTypes: [],
            containsUnknownType: false,
            containsOtherType: false,
        };

        for (const type of types) {
            if (type.equals(this.coreTypes.Nothing) || type.equals(this.coreTypes.NothingOrNull)) {
                // Drop Nothing/Nothing? types. They are compatible to everything with appropriate nullability.
            } else if (type instanceof ClassType) {
                result.classTypes.push(type);
            } else if (type instanceof EnumType) {
                result.enumTypes.push(type);
            } else if (type instanceof EnumVariantType) {
                result.enumVariantTypes.push(type);
            } else if (type instanceof LiteralType) {
                const classType = this.computeClassTypeForLiteralType(type);
                if (classType instanceof ClassType) {
                    result.classTypes.push(classType);
                } else {
                    /* c8 ignore next 2 */
                    result.containsUnknownType = true;
                }
            } else if (type === UnknownType) {
                result.containsUnknownType = true;
            } else {
                // Since these types don't occur in legal programs, we don't need to handle them better
                result.containsOtherType = true;
                return result;
            }
        }

        return result;
    }

    /**
     * Returns the lowest common supertype for the given class-based types.
     */
    private lowestCommonSupertypeForClassBasedTypes(classTypes: ClassType[], isNullable: boolean): Type {
        if (isEmpty(classTypes)) {
            /* c8 ignore next 2 */
            return this.Nothing(isNullable);
        }

        // Find the class type that is compatible to all other types
        const firstClassType = classTypes[0]!.withExplicitNullability(isNullable);
        const candidates = [firstClassType, ...this.streamProperSupertypes(firstClassType)];
        let others = [...classTypes.slice(1)];

        for (const candidate of candidates) {
            if (this.isCommonSupertypeIgnoringTypeParameters(candidate, others)) {
                // If the class has no type parameters, we are done
                const typeParameters = getTypeParameters(candidate.declaration);
                if (isEmpty(typeParameters)) {
                    return candidate;
                }

                // Lift all types to a common class
                others = others.map((it) => this.computeMatchingSupertype(it, candidate.declaration)!);

                // Check whether all substitutions of invariant type parameters are equal
                if (!this.substitutionsForInvariantTypeParametersAreEqual(typeParameters, candidate, others)) {
                    continue;
                }

                // Unify substitutions for type parameters
                const substitutions = this.newTypeParameterSubstitutionsLCS(typeParameters, candidate, others);
                return this.factory.createClassType(candidate.declaration, substitutions, isNullable);
            }
        }
        /* c8 ignore next */
        return this.Any(isNullable);
    }

    private substitutionsForInvariantTypeParametersAreEqual(
        allTypeParameters: SdsTypeParameter[],
        candidate: ClassType,
        others: ClassType[],
    ): boolean {
        return allTypeParameters.filter(TypeParameter.isInvariant).every((typeParameter) => {
            const candidateSubstitution = candidate.substitutions.get(typeParameter);
            return (
                candidateSubstitution &&
                others.every((other) => {
                    const otherSubstitution = other.substitutions.get(typeParameter);
                    return otherSubstitution && candidateSubstitution.equals(otherSubstitution);
                })
            );
        });
    }

    private newTypeParameterSubstitutionsLCS(
        typeParameters: SdsTypeParameter[],
        candidate: ClassType,
        others: ClassType[],
    ): TypeParameterSubstitutions {
        const covariantUnifier = (types: Type[]) =>
            this.lowestCommonSupertype(types, {
                skipTypeSimplification: true,
            });
        const contravariantUnifier = (types: Type[]) => this.highestCommonSubtype(types);

        return this.newTypeParameterSubstitutions(
            typeParameters,
            candidate,
            others,
            covariantUnifier,
            contravariantUnifier,
        );
    }

    /**
     * Returns the lowest common supertype for the given enum-based types.
     */
    private lowestCommonSupertypeForEnumBasedTypes(
        enumTypes: EnumType[],
        enumVariantTypes: EnumVariantType[],
        isNullable: boolean,
    ): Type {
        // Build candidates & other
        const candidates: Type[] = [];

        if (!isEmpty(enumTypes)) {
            candidates.push(enumTypes[0]!.withExplicitNullability(isNullable));
        } else if (!isEmpty(enumVariantTypes)) {
            candidates.push(enumVariantTypes[0]!.withExplicitNullability(isNullable));

            const containingEnum = AstUtils.getContainerOfType(enumVariantTypes[0]!.declaration, isSdsEnum);
            if (containingEnum) {
                candidates.push(this.factory.createEnumType(containingEnum, isNullable));
            }
        } else {
            /* c8 ignore next 2 */
            return this.Nothing(isNullable);
        }

        const others = [...enumTypes, ...enumVariantTypes];

        // Check whether a candidate type is compatible to all other types
        for (const candidate of candidates) {
            if (this.isCommonSupertype(candidate, others)) {
                return candidate;
            }
        }

        return this.Any(isNullable);
    }

    private isCommonSupertypeIgnoringTypeParameters(candidate: Type, otherTypes: Type[]): boolean {
        return otherTypes.every((it) =>
            this.typeChecker.isSupertypeOf(candidate, it, {
                ignoreTypeParameters: true,
            }),
        );
    }

    private isCommonSupertype(candidate: Type, otherTypes: Type[]): boolean {
        return otherTypes.every((it) => this.typeChecker.isSupertypeOf(candidate, it));
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Highest common subtype
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Computes the highest common subtype for the given types. The result is simplified as much as possible. This
     * function is only meant to be called from `lowestCommonSupertype`, since we make several assumptions about the
     * input types, e.g. that they are already simplified.
     */
    private highestCommonSubtype(types: Type[]): Type {
        if (types.length === 0) {
            /* c8 ignore next 2 */
            return this.Any(true);
        } else if (types.length === 1) {
            /* c8 ignore next 2 */
            return types[0]!;
        }

        // Update nullability of all types
        const isNullable = types.every((it) => it.isExplicitlyNullable);
        const typesWithMatchingNullability = types.map((it) => it.withExplicitNullability(isNullable));

        // One of the types is already a common subtype of all others after updating nullability
        const commonSupertype = typesWithMatchingNullability.find((it) => this.isCommonSubtype(it, types));
        if (commonSupertype) {
            return commonSupertype;
        }

        // Partition types by their kind
        const partitionedTypes = this.partitionTypesHCS(typesWithMatchingNullability);

        // Contains unhandled type
        if (partitionedTypes.containsOtherType) {
            return this.Nothing(isNullable);
        }

        // Contains only class types
        if (!isEmpty(partitionedTypes.classTypes) && isEmpty(partitionedTypes.literalTypes)) {
            return this.highestCommonSubtypeForClassTypes(partitionedTypes.classTypes, isNullable);
        }

        // Contains only literal types
        if (!isEmpty(partitionedTypes.literalTypes) && isEmpty(partitionedTypes.classTypes)) {
            return this.highestCommonSubtypeForLiteralTypes(partitionedTypes.literalTypes);
        }

        // If a literal were a subtype of all other types, we would have already handled this when simplifying the types
        // in `lowestCommonSupertype`. Since we instead got here, we can conclude that there is no common subtype other
        // than `Nothing`/`Nothing?`.
        return this.Nothing(isNullable);
    }

    /**
     * Partitions the given types by their kind. This function is only meant to be used when computing the highest
     * common subtype (HCS).
     */
    private partitionTypesHCS(types: Type[]): PartitionTypesHCSResult {
        const result: PartitionTypesHCSResult = {
            classTypes: [],
            literalTypes: [],
            containsOtherType: false,
        };

        for (const type of types) {
            if (type instanceof ClassType) {
                result.classTypes.push(type);
            } else if (type instanceof LiteralType) {
                result.literalTypes.push(type);
            } else {
                result.containsOtherType = true;
                return result;
            }
        }

        return result;
    }

    private highestCommonSubtypeForClassTypes(types: ClassType[], isNullable: boolean): Type {
        if (isEmpty(types)) {
            /* c8 ignore next 2 */
            return this.Any(isNullable);
        }

        // Find the type that is compatible to all other types ignoring type parameters
        const candidate = types.find((it) => this.isCommonSubtypeIgnoringTypeParameters(it, types));
        if (!candidate || candidate.equals(this.Nothing(isNullable))) {
            return this.Nothing(isNullable);
        }

        let others = types.filter((it) => it !== candidate);

        // If the class has no type parameters, the candidate must match as is
        const typeParameters = getTypeParameters(candidate.declaration);
        if (isEmpty(typeParameters)) {
            if (this.isCommonSubtype(candidate, others)) {
                /* c8 ignore next 2 */
                return candidate;
            } else {
                return this.Nothing(isNullable);
            }
        }

        // Bring all types down to a common class
        others = this.bringTypesDownToCommonClass(candidate, others);

        // Check whether all substitutions of invariant type parameters are equal
        if (!this.substitutionsForInvariantTypeParametersAreEqual(typeParameters, candidate, others)) {
            return this.Nothing(isNullable);
        }

        // Unify substitutions for type parameters
        const newSubstitutions = this.newTypeParameterSubstitutionsHCS(typeParameters, candidate, others);
        return this.factory.createClassType(candidate.declaration, newSubstitutions, isNullable);
    }

    private bringTypesDownToCommonClass(candidate: ClassType, others: ClassType[]): ClassType[] {
        const targetTemplate = this.createTargetTemplate(candidate);
        const result: ClassType[] = [];

        for (const type of others) {
            const matchingSubtype = this.computeMatchingSubtype(type, targetTemplate)!;

            // Apply substitutions of the candidate, if type parameter types are still free
            for (const typeParameter of getTypeParameters(candidate.declaration)) {
                if (!matchingSubtype.substitutions.has(typeParameter)) {
                    const substitution = candidate.substitutions.get(typeParameter);
                    if (substitution) {
                        matchingSubtype.substitutions.set(typeParameter, substitution);
                    }
                }
            }

            result.push(matchingSubtype);
        }

        return result;
    }

    /**
     * Creates a class type with the same declaration and nullability as the given type. Type parameters, however, are
     * substituted by their own type parameter type to observe how they flow through the class hierarchy.
     */
    private createTargetTemplate(type: ClassType): ClassType {
        const declaration = type.declaration;
        const typeParameters = getTypeParameters(declaration);
        const substitutions: TypeParameterSubstitutions = new Map();

        for (const typeParameter of typeParameters) {
            substitutions.set(typeParameter, this.factory.createTypeVariable(typeParameter, false));
        }

        return this.factory.createClassType(declaration, substitutions, type.isExplicitlyNullable);
    }

    private computeMatchingSubtype(type: ClassType, targetTemplate: ClassType): ClassType | undefined {
        if (type.declaration === targetTemplate.declaration) {
            return type;
        }

        const superType = this.computeMatchingSupertype(targetTemplate, type.declaration);
        if (!superType) {
            /* c8 ignore next 2 */
            return undefined;
        }

        // See where the type parameters ended up in the computed super type
        const invertedTypeParameterMap = new Map<SdsTypeParameter, SdsTypeParameter>();
        for (const [key, value] of superType.substitutions) {
            if (value instanceof TypeVariable) {
                invertedTypeParameterMap.set(value.declaration, key);
            }
        }

        // Compute the new substitutions
        const substitutions: TypeParameterSubstitutions = new Map();
        for (const typeParameter of getTypeParameters(targetTemplate.declaration)) {
            const invertedTypeParameter = invertedTypeParameterMap.get(typeParameter);
            if (!invertedTypeParameter) {
                continue;
            }

            const substitution = type.substitutions.get(invertedTypeParameter);
            if (substitution) {
                substitutions.set(typeParameter, substitution);
            }
        }

        return this.factory.createClassType(
            targetTemplate.declaration,
            substitutions,
            targetTemplate.isExplicitlyNullable,
        );
    }

    private newTypeParameterSubstitutionsHCS(
        typeParameters: SdsTypeParameter[],
        candidate: ClassType,
        others: ClassType[],
    ): TypeParameterSubstitutions {
        const covariantUnifier = (types: Type[]) => this.highestCommonSubtype(types);
        const contravariantUnifier = (types: Type[]) =>
            this.lowestCommonSupertype(types, {
                skipTypeSimplification: true,
            });

        return this.newTypeParameterSubstitutions(
            typeParameters,
            candidate,
            others,
            covariantUnifier,
            contravariantUnifier,
        );
    }

    private highestCommonSubtypeForLiteralTypes(types: LiteralType[]): Type {
        if (isEmpty(types)) {
            /* c8 ignore next 2 */
            return this.coreTypes.AnyOrNull;
        }

        // Intersect constants
        const [first, ...other] = types;
        const constants = first!.constants.filter((constant1) =>
            other.every((type) => type.constants.some((constant2) => constant1.equals(constant2))),
        );

        return this.factory.createLiteralType(...constants).simplify();
    }

    private isCommonSubtypeIgnoringTypeParameters(candidate: Type, otherTypes: Type[]): boolean {
        return otherTypes.every((it) =>
            this.typeChecker.isSubtypeOf(candidate, it, {
                ignoreTypeParameters: true,
            }),
        );
    }

    private isCommonSubtype(candidate: Type, otherTypes: Type[]): boolean {
        return otherTypes.every((it) => this.typeChecker.isSubtypeOf(candidate, it));
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Supertypes
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Walks through the supertypes of the given `type` (including the given `type`) and returns the first class type
     * where the declaration matches the given `target`. If no such supertype exists, `undefined` is returned. Type
     * parameters on parent types get substituted.
     */
    computeMatchingSupertype(
        type: ClassType | TypeVariable | undefined,
        target: SdsClass | undefined,
    ): ClassType | undefined {
        // Handle undefined
        if (!type || !target) {
            return undefined;
        }

        // Handle type parameter types
        if (type instanceof TypeVariable) {
            const upperBound = this.computeUpperBound(type);
            if (upperBound instanceof ClassType) {
                return this.computeMatchingSupertype(upperBound, target);
            } else {
                /* c8 ignore next 2 */
                return undefined;
            }
        }

        // Handle class types
        return stream([type], this.streamProperSupertypes(type)).find((it) => it.declaration === target);
    }

    /**
     * Returns a stream of all declared supertypes of the given type. Direct ancestors are returned first, followed by
     * their ancestors and so on. The given type is never included in the stream.
     *
     * Compared to `ClassHierarchy.streamSuperTypes`, this method cannot be used to detect cycles in the inheritance
     * hierarchy. However, it can handle type parameters on parent types and substitute them accordingly.
     */
    streamProperSupertypes(type: ClassType | undefined): Stream<ClassType> {
        if (!type) {
            return EMPTY_STREAM;
        }

        return stream(this.properSupertypesGenerator(type));
    }

    private *properSupertypesGenerator(type: ClassType): Generator<ClassType, void> {
        // Compared to `ClassHierarchy.properSuperclassesGenerator`, we already include the given type in the list of
        // visited elements, since this method here is not used to detect cycles.
        const visited = new Set<SdsClass>([type.declaration]);
        let current = this.parentClassType(type);

        while (current && !visited.has(current.declaration)) {
            yield current;
            visited.add(current.declaration);
            current = this.parentClassType(current);
        }

        const Any = this.Any(type.isExplicitlyNullable);
        if (Any instanceof ClassType && !visited.has(Any.declaration)) {
            yield Any;
        }
    }

    /**
     * Tries to evaluate the first parent type of the class to a `ClassType` and returns it if successful. Type
     * parameters get substituted. If there is no parent type or the parent type is not a class, `undefined` is
     * returned.
     */
    private parentClassType(type: ClassType): ClassType | undefined {
        const [firstParentTypeNode] = getParentTypes(type.declaration);
        const firstParentType = this.computeType(firstParentTypeNode, type.substitutions);

        if (firstParentType instanceof ClassType) {
            return firstParentType.withExplicitNullability(type.isExplicitlyNullable);
        }
        return undefined;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------------------------------------------------

    private Any(isNullable: boolean): Type {
        return isNullable ? this.coreTypes.AnyOrNull : this.coreTypes.Any;
    }

    private Nothing(isNullable: boolean): Type {
        return isNullable ? this.coreTypes.NothingOrNull : this.coreTypes.Nothing;
    }

    private newTypeParameterSubstitutions(
        typeParameters: SdsTypeParameter[],
        candidate: ClassType,
        others: ClassType[],
        covariantUnifier: (types: Type[]) => Type,
        contravariantUnifier: (types: Type[]) => Type,
    ): TypeParameterSubstitutions {
        const substitutions: TypeParameterSubstitutions = new Map();

        for (const typeParameter of typeParameters) {
            const candidateSubstitution = candidate.substitutions.get(typeParameter) ?? UnknownType;

            if (TypeParameter.isCovariant(typeParameter)) {
                const otherSubstitutions = others.map((it) => it.substitutions.get(typeParameter) ?? UnknownType);
                substitutions.set(typeParameter, covariantUnifier([candidateSubstitution, ...otherSubstitutions]));
            } else if (TypeParameter.isContravariant(typeParameter)) {
                const otherSubstitutions = others.map((it) => it.substitutions.get(typeParameter) ?? UnknownType);
                substitutions.set(typeParameter, contravariantUnifier([candidateSubstitution, ...otherSubstitutions]));
            } else {
                substitutions.set(typeParameter, candidateSubstitution);
            }
        }

        return substitutions;
    }
}

/**
 * Options for {@link computeUpperBound}.
 */
interface ComputeUpperBoundOptions {
    /**
     * If `true`, the computation stops at type variables and returns them as is. Otherwise, it finds the bounds for the
     * type variable recursively.
     */
    stopAtTypeVariable?: boolean;
}

interface ComputeSubstitutionsForParametersState {
    substitutions: TypeParameterSubstitutions;
    remainingVariances: Map<SdsTypeParameter, Variance | undefined>;
}

type Variance = 'bivariant' | 'covariant' | 'contravariant' | 'invariant';

/**
 * Options for {@link lowestCommonSupertype}.
 */
interface LowestCommonSupertypeOptions {
    /**
     * If `true`, the type simplification is skipped and the given types are used as is.
     */
    skipTypeSimplification?: boolean;
}

interface PartitionTypesLCSResult {
    classTypes: ClassType[];
    enumTypes: EnumType[];
    enumVariantTypes: EnumVariantType[];
    containsUnknownType: boolean;
    containsOtherType: boolean;
}

interface PartitionTypesHCSResult {
    classTypes: ClassType[];
    literalTypes: LiteralType[];
    containsOtherType: boolean;
}

const NO_SUBSTITUTIONS: TypeParameterSubstitutions = new Map();
