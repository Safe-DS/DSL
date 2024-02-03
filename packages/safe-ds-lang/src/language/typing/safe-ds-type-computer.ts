import { AstNode, AstNodeLocator, getContainerOfType, getDocument, stream, WorkspaceCache } from 'langium';
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
} from '../generated/ast.js';
import {
    getAssignees,
    getLiterals,
    getParameters,
    getResults,
    getTypeArguments,
    getTypeParameters,
    streamBlockLambdaResults,
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
    UnionType,
    UnknownType,
} from './model.js';
import type { SafeDsClassHierarchy } from './safe-ds-class-hierarchy.js';
import { SafeDsCoreTypes } from './safe-ds-core-types.js';
import type { SafeDsTypeChecker } from './safe-ds-type-checker.js';

export class SafeDsTypeComputer {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly classHierarchy: SafeDsClassHierarchy;
    private readonly coreTypes: SafeDsCoreTypes;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly partialEvaluator: SafeDsPartialEvaluator;
    private readonly typeChecker: SafeDsTypeChecker;

    private readonly nodeTypeCache: WorkspaceCache<string, Type>;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.classHierarchy = services.types.ClassHierarchy;
        this.coreTypes = services.types.CoreTypes;
        this.nodeMapper = services.helpers.NodeMapper;
        this.partialEvaluator = services.evaluation.PartialEvaluator;
        this.typeChecker = services.types.TypeChecker;

        this.nodeTypeCache = new WorkspaceCache(services.shared);
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Compute type
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Computes the type of the given node.
     */
    computeType(node: AstNode | undefined): Type {
        if (!node) {
            return UnknownType;
        }
        return this.nodeTypeCache.get(this.getNodeId(node), () => this.doComputeType(node).unwrap());
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

            return new CallableType(node, undefined, new NamedTupleType(...parameterEntries), new NamedTupleType());
        } else if (isSdsAttribute(node)) {
            return this.computeType(node.type);
        } else if (isSdsClass(node)) {
            return new ClassType(node, NO_SUBSTITUTIONS, false);
        } else if (isSdsEnum(node)) {
            return new EnumType(node, false);
        } else if (isSdsEnumVariant(node)) {
            return new EnumVariantType(node, false);
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
            return UnknownType;
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

        return new CallableType(
            node,
            undefined,
            new NamedTupleType(...parameterEntries),
            new NamedTupleType(...resultEntries),
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
            return new CallableType(type.callable, node, type.inputType, type.outputType);
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
            return new LiteralType(evaluatedNode);
        }

        // Terminal cases
        if (isSdsList(node)) {
            // TODO: compute type parameter
            return this.coreTypes.List;
        } else if (isSdsMap(node)) {
            // TODO: compute type parameter
            return this.coreTypes.Map;
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

        return new CallableType(
            node,
            undefined,
            new NamedTupleType(...parameterEntries),
            new NamedTupleType(...resultEntries),
        );
    }

    private computeTypeOfCall(node: SdsCall): Type {
        const receiverType = this.computeType(node.receiver);

        if (receiverType instanceof CallableType) {
            if (!isSdsAnnotation(receiverType.callable)) {
                return receiverType.outputType;
            }
        } else if (receiverType instanceof StaticType) {
            const instanceType = receiverType.instanceType;
            if (isSdsCallable(instanceType.declaration)) {
                return instanceType;
            }
        }

        return UnknownType;
    }

    private computeTypeOfExpressionLambda(node: SdsExpressionLambda): Type {
        const parameterEntries = getParameters(node).map(
            (it) => new NamedTupleEntry(it, it.name, this.computeType(it)),
        );
        const resultEntries = [
            new NamedTupleEntry<SdsAbstractResult>(undefined, 'result', this.computeType(node.result)),
        ];

        return new CallableType(
            node,
            undefined,
            new NamedTupleType(...parameterEntries),
            new NamedTupleType(...resultEntries),
        );
    }

    private computeTypeOfIndexedAccess(node: SdsIndexedAccess): Type {
        const receiverType = this.computeType(node.receiver);
        if (receiverType.equals(this.coreTypes.List) || receiverType.equals(this.coreTypes.Map)) {
            // TODO: access type arguments
            return this.coreTypes.AnyOrNull;
        } else {
            return UnknownType;
        }
    }

    private computeTypeOfArithmeticInfixOperation(node: SdsInfixOperation): Type {
        const leftOperandType = this.computeType(node.leftOperand);
        const rightOperandType = this.computeType(node.rightOperand);

        if (leftOperandType.equals(this.coreTypes.Int) && rightOperandType.equals(this.coreTypes.Int)) {
            return this.coreTypes.Int;
        } else {
            return this.coreTypes.Float;
        }
    }

    private computeTypeOfElvisOperation(node: SdsInfixOperation): Type {
        const leftOperandType = this.computeType(node.leftOperand);
        if (leftOperandType.isNullable) {
            const rightOperandType = this.computeType(node.rightOperand);
            return this.lowestCommonSupertype(leftOperandType.updateNullability(false), rightOperandType);
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
        return memberType.updateNullability((receiverType.isNullable && node.isNullSafe) || memberType.isNullable);
    }

    private computeTypeOfArithmeticPrefixOperation(node: SdsPrefixOperation): Type {
        const leftOperandType = this.computeType(node.operand);

        if (leftOperandType.equals(this.coreTypes.Int)) {
            return this.coreTypes.Int;
        } else {
            return this.coreTypes.Float;
        }
    }

    private computeTypeOfReference(node: SdsReference): Type {
        const target = node.target.ref;
        const instanceType = this.computeType(target);

        if (isSdsNamedTypeDeclaration(target) && instanceType instanceof NamedType) {
            return new StaticType(instanceType.updateNullability(false));
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
            return new UnionType(...typeArguments.map((typeArgument) => this.computeType(typeArgument.value)));
        } /* c8 ignore start */ else {
            return UnknownType;
        } /* c8 ignore stop */
    }

    private computeTypeOfLiteralType(node: SdsLiteralType): Type {
        const constants = getLiterals(node).map((it) => this.partialEvaluator.evaluate(it));
        if (constants.every(isConstant)) {
            return new LiteralType(...constants);
        } /* c8 ignore start */ else {
            return UnknownType;
        } /* c8 ignore stop */
    }

    private computeTypeOfNamedType(node: SdsNamedType) {
        const unparameterizedType = this.computeType(node.declaration?.ref).updateNullability(node.isNullable);
        if (!(unparameterizedType instanceof ClassType)) {
            return unparameterizedType;
        }

        const substitutions = this.getTypeParameterSubstitutionsForNamedType(node, unparameterizedType.declaration);
        return new ClassType(unparameterizedType.declaration, substitutions, node.isNullable);
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
    // Compute class types for literal types and their constants
    // -----------------------------------------------------------------------------------------------------------------

    computeClassTypeForLiteralType(literalType: LiteralType): Type {
        return this.lowestCommonSupertype(...literalType.constants.map((it) => this.computeClassTypeForConstant(it)));
    }

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
    // Lowest common supertype
    // -----------------------------------------------------------------------------------------------------------------

    lowestCommonSupertype(...types: Type[]): Type {
        // No types given
        const flattenedAndUnwrappedTypes = [...this.flattenUnionTypesAndUnwrap(types)];
        if (isEmpty(flattenedAndUnwrappedTypes)) {
            return this.coreTypes.Nothing;
        }

        // Includes type with unknown supertype
        const groupedTypes = this.groupTypes(flattenedAndUnwrappedTypes);
        if (groupedTypes.hasTypeWithUnknownSupertype) {
            return UnknownType;
        }

        // Some shortcuts to avoid unnecessary computation
        if (
            isEmpty(groupedTypes.classTypes) &&
            isEmpty(groupedTypes.constants) &&
            isEmpty(groupedTypes.enumTypes) &&
            isEmpty(groupedTypes.enumVariantTypes)
        ) {
            return this.coreTypes.Nothing;
        } else if (flattenedAndUnwrappedTypes.length === 1) {
            return flattenedAndUnwrappedTypes[0]!;
        }

        const isNullable = flattenedAndUnwrappedTypes.some((it) => it.isNullable);

        // Class-based types
        if (!isEmpty(groupedTypes.classTypes) || !isEmpty(groupedTypes.constants)) {
            if (!isEmpty(groupedTypes.enumTypes) || !isEmpty(groupedTypes.enumVariantTypes)) {
                return this.getAny(isNullable);
            } else {
                return this.lowestCommonSupertypeForClassBasedTypes(
                    groupedTypes.classTypes,
                    groupedTypes.constants,
                    isNullable,
                );
            }
        }

        // Enum-based types
        return this.lowestCommonSupertypeForEnumBasedTypes(
            groupedTypes.enumTypes,
            groupedTypes.enumVariantTypes,
            isNullable,
        );
    }

    /**
     * Flattens union types and unwraps all others.
     */
    private *flattenUnionTypesAndUnwrap(types: Type[]): Generator<Type, void, undefined> {
        for (const type of types) {
            if (type instanceof UnionType) {
                yield* this.flattenUnionTypesAndUnwrap(type.possibleTypes);
            } else {
                yield type.unwrap();
            }
        }
    }

    /**
     * Group the given types by their kind.
     */
    private groupTypes(types: Type[]): GroupTypesResult {
        const result: GroupTypesResult = {
            classTypes: [],
            constants: [],
            enumTypes: [],
            enumVariantTypes: [],
            hasTypeWithUnknownSupertype: false,
        };

        for (const type of types) {
            if (type instanceof ClassType) {
                result.classTypes.push(type);
            } else if (type instanceof EnumType) {
                result.enumTypes.push(type);
            } else if (type instanceof EnumVariantType) {
                result.enumVariantTypes.push(type);
            } else if (type instanceof LiteralType) {
                result.constants.push(...type.constants);
            } else {
                // Other types don't have a clear lowest common supertype
                result.hasTypeWithUnknownSupertype = true;
                return result;
            }
        }

        return result;
    }

    private lowestCommonSupertypeForClassBasedTypes(
        classTypes: ClassType[],
        constants: Constant[],
        isNullable: boolean,
    ): Type {
        // If there are only constants, return a literal type
        const literalType = new LiteralType(...constants);
        if (isEmpty(classTypes)) {
            return literalType;
        }

        // Find the class type that is compatible to all other types
        const candidateClasses = stream(
            [classTypes[0]!.declaration],
            this.classHierarchy.streamSuperclasses(classTypes[0]!.declaration),
        );
        const other = [...classTypes.slice(1), literalType];

        for (const candidateClass of candidateClasses) {
            // TODO: handle type parameters
            const candidateType = new ClassType(candidateClass, NO_SUBSTITUTIONS, isNullable);
            if (this.isCommonSupertype(candidateType, other)) {
                return candidateType;
            }
        }
        /* c8 ignore next */
        return this.getAny(isNullable);
    }

    private lowestCommonSupertypeForEnumBasedTypes(
        enumTypes: EnumType[],
        enumVariantTypes: EnumVariantType[],
        isNullable: boolean,
    ): Type {
        // Build candidates & other
        const candidates: Type[] = [];
        if (!isEmpty(enumTypes)) {
            candidates.push(enumTypes[0]!.updateNullability(isNullable));
        } else {
            if (!isEmpty(enumVariantTypes)) {
                candidates.push(enumVariantTypes[0]!.updateNullability(isNullable));

                const containingEnum = getContainerOfType(enumVariantTypes[0]!.declaration, isSdsEnum);
                if (containingEnum) {
                    candidates.push(new EnumType(containingEnum, isNullable));
                }
            }
        }
        const other = [...enumTypes, ...enumVariantTypes];

        // Check whether a candidate type is compatible to all other types
        for (const candidate of candidates) {
            if (this.isCommonSupertype(candidate, other)) {
                return candidate;
            }
        }

        return this.getAny(isNullable);
    }

    private isCommonSupertype(candidate: Type, otherTypes: Type[]): boolean {
        return otherTypes.every((it) => this.typeChecker.isAssignableTo(it, candidate));
    }

    private getAny(isNullable: boolean): Type {
        return isNullable ? this.coreTypes.AnyOrNull : this.coreTypes.Any;
    }
}

interface GroupTypesResult {
    classTypes: ClassType[];
    constants: Constant[];
    enumTypes: EnumType[];
    enumVariantTypes: EnumVariantType[];
    hasTypeWithUnknownSupertype: boolean;
}

const NO_SUBSTITUTIONS: TypeParameterSubstitutions = new Map();
