import {
    AstNode,
    AstNodeLocator,
    EMPTY_STREAM,
    getContainerOfType,
    getDocument,
    Stream,
    stream,
    WorkspaceCache,
} from 'langium';
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
    isSdsType,
    isSdsTypeArgument,
    isSdsTypeCast,
    isSdsTypeParameter,
    isSdsTypeProjection,
    isSdsUnionType,
    isSdsYield,
    SdsAbstractResult,
    SdsAssignee,
    type SdsBlockLambda,
    SdsCall,
    SdsCallableType,
    SdsClass,
    SdsDeclaration,
    SdsExpression,
    type SdsExpressionLambda,
    SdsFunction,
    SdsIndexedAccess,
    SdsInfixOperation,
    SdsLiteralType,
    SdsMemberAccess,
    SdsNamedType,
    SdsParameter,
    SdsPrefixOperation,
    SdsReference,
    SdsSegment,
    SdsType,
    SdsTypeArgument,
    SdsTypeParameter,
    SdsTypeParameterBound,
} from '../generated/ast.js';
import {
    getAssignees,
    getLiterals,
    getParameters,
    getParentTypes,
    getResults,
    getTypeArguments,
    getTypeParameters,
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
    TypeParameterType,
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

    private readonly nodeTypeCache: WorkspaceCache<string, Type>;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.coreClasses = services.builtins.Classes;
        this.coreTypes = services.types.CoreTypes;
        this.factory = services.types.TypeFactory;
        this.nodeMapper = services.helpers.NodeMapper;
        this.partialEvaluator = services.evaluation.PartialEvaluator;
        this.typeChecker = services.types.TypeChecker;

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

        // Ignore type parameter substitutions for caching
        const unsubstitutedType = this.nodeTypeCache.get(this.getNodeId(node), () =>
            this.doComputeType(node).simplify(),
        );
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
        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        return `${documentUri}~${nodePath}`;
    }

    private doComputeType(node: AstNode): Type {
        if (isSdsAssignee(node)) {
            return this.computeTypeOfAssignee(node);
        } else if (isSdsDeclaration(node)) {
            return this.computeTypeOfDeclaration(node);
        } else if (isSdsExpression(node)) {
            return this.computeTypeOfExpression(node);
        } else if (isSdsType(node)) {
            return this.computeTypeOfType(node);
        } else if (isSdsTypeArgument(node)) {
            return this.computeType(node.value);
        } else if (isSdsTypeProjection(node)) {
            return this.computeTypeOfType(node.type);
        } /* c8 ignore start */ else {
            return UnknownType;
        } /* c8 ignore stop */
    }

    private computeTypeOfAssignee(node: SdsAssignee): Type {
        const containingAssignment = getContainerOfType(node, isSdsAssignment);
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
            return this.factory.createTypeParameterType(node, false);
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
        const containingCallable = getContainerOfType(node, isSdsCallable);
        if (!isSdsLambda(containingCallable)) {
            return UnknownType;
        }

        const containerOfLambda = containingCallable.$container;

        // Lambda passed as argument
        if (isSdsArgument(containerOfLambda)) {
            const parameter = this.nodeMapper.argumentToParameter(containerOfLambda);
            if (!parameter) {
                return UnknownType;
            }
            return this.computeType(parameter?.type);
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
        if (isSdsList(node)) {
            const elementType = this.lowestCommonSupertype(node.elements.map((it) => this.computeType(it)));
            return this.coreTypes.List(elementType);
        } else if (isSdsMap(node)) {
            let keyType = this.lowestCommonSupertype(node.entries.map((it) => this.computeType(it.key)));

            // Keeping literal types for keys is too strict: We would otherwise infer the key type of `{"a": 1, "b": 2}`
            // as `Literal<"a", "b">`. But then we would be unable to pass an unknown `String` as the key in an indexed
            // access. Where possible, we already validate the existence of keys in indexed accesses using the partial
            // evaluator.
            if (keyType instanceof LiteralType) {
                keyType = this.computeClassTypeForLiteralType(keyType);
            }

            const valueType = this.lowestCommonSupertype(node.entries.map((it) => this.computeType(it.value)));
            return this.coreTypes.Map(keyType, valueType);
        } else if (isSdsTemplateString(node)) {
            return this.coreTypes.String;
        }

        // Recursive cases
        else if (isSdsArgument(node)) {
            return this.computeType(node.value);
        } else if (isSdsBlockLambda(node)) {
            return this.computeTypeOfBlockLambda(node);
        } else if (isSdsCall(node)) {
            return this.computeTypeOfCall(node);
        } else if (isSdsExpressionLambda(node)) {
            return this.computeTypeOfExpressionLambda(node);
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
        } /* c8 ignore start */ else {
            return UnknownType;
        } /* c8 ignore stop */
    }

    private computeTypeOfBlockLambda(node: SdsBlockLambda): Type {
        const parameterEntries = getParameters(node).map(
            (it) => new NamedTupleEntry(it, it.name, this.computeType(it)),
        );
        const resultEntries = streamBlockLambdaResults(node)
            .map((it) => new NamedTupleEntry(it, it.name, this.computeType(it)))
            .toArray();

        return this.factory.createCallableType(
            node,
            undefined,
            this.factory.createNamedTupleType(...parameterEntries),
            this.factory.createNamedTupleType(...resultEntries),
        );
    }

    private computeTypeOfCall(node: SdsCall): Type {
        const receiverType = this.computeType(node.receiver);
        const nonNullableReceiverType = this.computeNonNullableType(receiverType);
        let result: Type = UnknownType;

        if (nonNullableReceiverType instanceof CallableType) {
            if (!isSdsAnnotation(nonNullableReceiverType.callable)) {
                result = nonNullableReceiverType.outputType;
            }
        } else if (nonNullableReceiverType instanceof StaticType) {
            const instanceType = nonNullableReceiverType.instanceType;
            if (isSdsCallable(instanceType.declaration)) {
                result = instanceType;
            }
        }

        // Update nullability
        return result.withExplicitNullability(receiverType.isExplicitlyNullable && node.isNullSafe);
    }

    private computeTypeOfExpressionLambda(node: SdsExpressionLambda): Type {
        const parameterEntries = getParameters(node).map(
            (it) => new NamedTupleEntry(it, it.name, this.computeType(it)),
        );
        const resultEntries = [
            new NamedTupleEntry<SdsAbstractResult>(undefined, 'result', this.computeType(node.result)),
        ];

        return this.factory.createCallableType(
            node,
            undefined,
            this.factory.createNamedTupleType(...parameterEntries),
            this.factory.createNamedTupleType(...resultEntries),
        );
    }

    private computeTypeOfIndexedAccess(node: SdsIndexedAccess): Type {
        const receiverType = this.computeType(node.receiver);
        if (!(receiverType instanceof ClassType) && !(receiverType instanceof TypeParameterType)) {
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

        // Substitute type parameters (must also work for inherited members)
        if (receiverType instanceof ClassType) {
            const classContainingMember = getContainerOfType(node.member?.target.ref, isSdsClass);
            const typeContainingMember = this.computeMatchingSupertype(receiverType, classContainingMember);

            if (typeContainingMember) {
                result = result.substituteTypeParameters(typeContainingMember.substitutions);
            }
        }

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

        const substitutions = this.getTypeParameterSubstitutionsForNamedType(node, unparameterizedType.declaration);
        return this.factory.createClassType(unparameterizedType.declaration, substitutions, node.isNullable);
    }

    private getTypeParameterSubstitutionsForNamedType(node: SdsNamedType, clazz: SdsClass): TypeParameterSubstitutions {
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
     * Returns the lowest class type for the given literal type.
     */
    computeClassTypeForLiteralType(literalType: LiteralType): Type {
        return this.lowestCommonSupertype(literalType.constants.map((it) => this.computeClassTypeForConstant(it)));
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

    // -----------------------------------------------------------------------------------------------------------------
    // Type parameter bounds
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Returns the lower bound for the given input. If no lower bound is specified explicitly, the result is `Nothing`.
     * If invalid lower bounds are specified (e.g. because of an unresolved reference or a cycle), `$unknown` is
     * returned. The result is simplified as much as possible.
     */
    computeLowerBound(nodeOrType: SdsTypeParameter | TypeParameterType, options: ComputeBoundOptions = {}): Type {
        let type: TypeParameterType;
        if (nodeOrType instanceof TypeParameterType) {
            type = nodeOrType;
        } else {
            type = this.computeType(nodeOrType) as TypeParameterType;
        }

        return this.doComputeLowerBound(type, new Set(), options);
    }

    private doComputeLowerBound(
        type: TypeParameterType,
        visited: Set<SdsTypeParameter>,
        options: ComputeBoundOptions,
    ): Type {
        // Check for cycles
        if (visited.has(type.declaration)) {
            return UnknownType;
        }
        visited.add(type.declaration);

        const lowerBounds = TypeParameter.getLowerBounds(type.declaration);
        if (isEmpty(lowerBounds)) {
            return this.coreTypes.Nothing;
        }

        const boundType = this.computeLowerBoundType(lowerBounds[0]!);
        if (!(boundType instanceof NamedType)) {
            return UnknownType;
        } else if (options.stopAtTypeParameterType || !(boundType instanceof TypeParameterType)) {
            return boundType;
        } else {
            return this.doComputeLowerBound(boundType, visited, options);
        }
    }

    private computeLowerBoundType(node: SdsTypeParameterBound): Type {
        if (node.operator === 'super') {
            return this.computeType(node.rightOperand);
        } else {
            return this.computeType(node.leftOperand?.ref);
        }
    }

    /**
     * Returns the upper bound for the given input. If no upper bound is specified explicitly, the result is `Any?`. If
     * invalid upper bounds are specified, but are invalid (e.g. because of an unresolved reference or a cycle),
     * `$unknown` is returned. The result is simplified as much as possible.
     */
    computeUpperBound(nodeOrType: SdsTypeParameter | TypeParameterType, options: ComputeBoundOptions = {}): Type {
        let type: TypeParameterType;
        if (nodeOrType instanceof TypeParameterType) {
            type = nodeOrType;
        } else {
            type = this.computeType(nodeOrType) as TypeParameterType;
        }

        const result = this.doComputeUpperBound(type, new Set(), options);
        return result.withExplicitNullability(result.isExplicitlyNullable || type.isExplicitlyNullable);
    }

    private doComputeUpperBound(
        type: TypeParameterType,
        visited: Set<SdsTypeParameter>,
        options: ComputeBoundOptions,
    ): Type {
        // Check for cycles
        if (visited.has(type.declaration)) {
            return UnknownType;
        }
        visited.add(type.declaration);

        const upperBounds = TypeParameter.getUpperBounds(type.declaration);
        if (isEmpty(upperBounds)) {
            return this.coreTypes.AnyOrNull;
        }

        const boundType = this.computeUpperBoundType(upperBounds[0]!);
        if (!(boundType instanceof NamedType)) {
            return UnknownType;
        } else if (options.stopAtTypeParameterType || !(boundType instanceof TypeParameterType)) {
            return boundType;
        } else {
            return this.doComputeUpperBound(boundType, visited, options);
        }
    }

    private computeUpperBoundType(node: SdsTypeParameterBound): Type {
        if (node.operator === 'sub') {
            return this.computeType(node.rightOperand);
        } else {
            return this.computeType(node.leftOperand?.ref);
        }
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Lowest common supertype
    // -----------------------------------------------------------------------------------------------------------------

    private lowestCommonSupertype(types: Type[]): Type {
        // Simplify types
        const simplifiedTypes = this.simplifyTypes(types);

        // A single type is its own lowest common supertype
        if (simplifiedTypes.length === 1) {
            return simplifiedTypes[0]!;
        }

        // Replace type parameter types by their upper bound
        const replacedTypes = simplifiedTypes.map((it) => {
            if (it instanceof TypeParameterType) {
                return this.computeUpperBound(it);
            } else {
                return it;
            }
        });

        // Includes type with unknown supertype
        const groupedTypes = this.groupTypes(replacedTypes);
        if (groupedTypes.hasTypeWithUnknownSupertype) {
            return UnknownType;
        }

        const isNullable = replacedTypes.some((it) => it.isExplicitlyNullable);

        // Class-based types
        if (!isEmpty(groupedTypes.classTypes)) {
            if (!isEmpty(groupedTypes.enumTypes) || !isEmpty(groupedTypes.enumVariantTypes)) {
                // Class types other than Any/Any? are never compatible to enum types/enum variant types
                return this.Any(isNullable);
            } else {
                return this.lowestCommonSupertypeForClassBasedTypes(groupedTypes.classTypes, isNullable);
            }
        }

        // Enum-based types
        return this.lowestCommonSupertypeForEnumBasedTypes(
            groupedTypes.enumTypes,
            groupedTypes.enumVariantTypes,
            isNullable,
        );
    }

    private simplifyTypes(types: Type[]) {
        const simplifiedType = this.factory.createUnionType(...types).simplify();

        if (simplifiedType instanceof UnionType) {
            return simplifiedType.types;
        } else {
            return [simplifiedType];
        }
    }

    /**
     * Group the given types by their kind. This functions assumes that union types have been removed.
     */
    private groupTypes(types: Type[]): GroupTypesResult {
        const result: GroupTypesResult = {
            classTypes: [],
            enumTypes: [],
            enumVariantTypes: [],
            hasTypeWithUnknownSupertype: false,
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
                    result.hasTypeWithUnknownSupertype = true;
                }
            } else {
                // Other types don't have a clear lowest common supertype
                result.hasTypeWithUnknownSupertype = true;
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
        let other = [...classTypes.slice(1)];

        for (const candidate of candidates) {
            if (this.isCommonSupertypeIgnoringTypeParameters(candidate, other)) {
                // If the class has no type parameters, we are done
                const typeParameters = getTypeParameters(candidate.declaration);
                if (isEmpty(typeParameters)) {
                    return candidate;
                }

                // Check whether all substitutions of invariant type parameters are equal
                other = other.map((it) => this.computeMatchingSupertype(it, candidate.declaration)!);

                if (!this.substitutionsForInvariantTypeParametersAreEqual(typeParameters, candidate, other)) {
                    continue;
                }

                // Unify substitutions for type parameters
                const substitutions = this.newTypeParameterSubstitutionsForLowestCommonSupertype(
                    typeParameters,
                    candidate,
                    other,
                );
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

    private newTypeParameterSubstitutionsForLowestCommonSupertype(
        typeParameters: SdsTypeParameter[],
        candidate: ClassType,
        others: ClassType[],
    ): TypeParameterSubstitutions {
        const substitutions: TypeParameterSubstitutions = new Map();

        for (const typeParameter of typeParameters) {
            const candidateSubstitution = candidate.substitutions.get(typeParameter) ?? UnknownType;

            if (TypeParameter.isCovariant(typeParameter)) {
                // Compute the lowest common supertype for substitutions
                const otherSubstitutions = others.map((it) => it.substitutions.get(typeParameter) ?? UnknownType);
                substitutions.set(
                    typeParameter,
                    this.lowestCommonSupertype([candidateSubstitution, ...otherSubstitutions]),
                );
            } /* c8 ignore start */ else if (TypeParameter.isContravariant(typeParameter)) {
                // Compute the highest common subtype for substitutions
                const otherSubstitutions = others.map((it) => it.substitutions.get(typeParameter) ?? UnknownType);
                substitutions.set(
                    typeParameter,
                    this.highestCommonSubtype([candidateSubstitution, ...otherSubstitutions]),
                );
            } /* c8 ignore stop */ else {
                substitutions.set(typeParameter, candidateSubstitution);
            }
        }

        return substitutions;
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

            const containingEnum = getContainerOfType(enumVariantTypes[0]!.declaration, isSdsEnum);
            if (containingEnum) {
                candidates.push(this.factory.createEnumType(containingEnum, isNullable));
            }
        } else {
            /* c8 ignore next 2 */
            return this.Nothing(isNullable);
        }

        const other = [...enumTypes, ...enumVariantTypes];

        // Check whether a candidate type is compatible to all other types
        for (const candidate of candidates) {
            if (this.isCommonSupertype(candidate, other)) {
                return candidate;
            }
        }

        return this.Any(isNullable);
    }

    private isCommonSupertypeIgnoringTypeParameters(candidate: Type, otherTypes: Type[]): boolean {
        return otherTypes.every((it) => this.typeChecker.isSupertypeOf(candidate, it, { ignoreTypeParameters: true }));
    }

    private isCommonSupertype(candidate: Type, otherTypes: Type[]): boolean {
        return otherTypes.every((it) => this.typeChecker.isSupertypeOf(candidate, it));
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Highest common subtype
    // -----------------------------------------------------------------------------------------------------------------

    /* c8 ignore start */
    private highestCommonSubtype(_types: Type[]): Type {
        // TODO(lr): Implement
        return this.coreTypes.Nothing;
    }
    /* c8 ignore stop */

    // -----------------------------------------------------------------------------------------------------------------
    // Supertypes
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Walks through the supertypes of the given `type` (including the given `type`) and returns the first class type
     * where the declaration matches the given `target`. If no such supertype exists, `undefined` is returned. Type
     * parameters on parent types get substituted.
     */
    computeMatchingSupertype(
        type: ClassType | TypeParameterType | undefined,
        target: SdsClass | undefined,
    ): ClassType | undefined {
        // Handle undefined
        if (!type || !target) {
            return undefined;
        }

        // Handle type parameter types
        if (type instanceof TypeParameterType) {
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

        const Any = this.coreTypes.Any.withExplicitNullability(type.isExplicitlyNullable);
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
}

/**
 * Options for {@link computeLowerBound} and {@link computeUpperBound}.
 */
interface ComputeBoundOptions {
    /**
     * If `true`, the computation stops at type parameter types and returns them as is. Otherwise, it finds the bounds
     * for the type parameter types recursively.
     */
    stopAtTypeParameterType?: boolean;
}

interface GroupTypesResult {
    classTypes: ClassType[];
    enumTypes: EnumType[];
    enumVariantTypes: EnumVariantType[];
    hasTypeWithUnknownSupertype: boolean;
}

const NO_SUBSTITUTIONS: TypeParameterSubstitutions = new Map();
