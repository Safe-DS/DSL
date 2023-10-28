import { AstNode, AstNodeLocator, getContainerOfType, getDocument, WorkspaceCache } from 'langium';
import { isEmpty } from '../../helpers/collectionUtils.js';
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
    isSdsSegment,
    isSdsTemplateString,
    isSdsType,
    isSdsTypeArgument,
    isSdsTypeProjection,
    isSdsUnionType,
    isSdsYield,
    SdsAbstractResult,
    SdsAssignee,
    SdsCall,
    SdsCallableType,
    SdsDeclaration,
    SdsExpression,
    SdsFunction,
    SdsIndexedAccess,
    SdsInfixOperation,
    SdsLiteralType,
    SdsMemberAccess,
    SdsParameter,
    SdsPrefixOperation,
    SdsReference,
    SdsSegment,
    SdsType,
} from '../generated/ast.js';
import {
    getAssignees,
    getLiterals,
    getParameters,
    getResults,
    getTypeArguments,
    streamBlockLambdaResults,
} from '../helpers/nodeProperties.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import { Constant, isConstant } from '../partialEvaluation/model.js';
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
    NotImplementedType,
    StaticType,
    Type,
    UnionType,
    UnknownType,
} from './model.js';
import { SafeDsCoreTypes } from './safe-ds-core-types.js';

export class SafeDsTypeComputer {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly coreTypes: SafeDsCoreTypes;
    private readonly nodeMapper: SafeDsNodeMapper;
    private readonly partialEvaluator: SafeDsPartialEvaluator;

    private readonly nodeTypeCache: WorkspaceCache<string, Type>;

    constructor(services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.coreTypes = services.types.CoreTypes;
        this.nodeMapper = services.helpers.NodeMapper;
        this.partialEvaluator = services.evaluation.PartialEvaluator;

        this.nodeTypeCache = new WorkspaceCache(services.shared);
    }

    /**
     * Computes the type of the given node.
     */
    computeType(node: AstNode | undefined): Type {
        if (!node) {
            return UnknownType;
        }

        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        const key = `${documentUri}~${nodePath}`;
        return this.nodeTypeCache.get(key, () => this.doComputeType(node).unwrap());
    }

    // fun SdsAbstractObject.hasPrimitiveType(): Boolean {
    //     val type = type()
    //     if (type !is ClassType) {
    //         return false
    //     }
    //
    //     val qualifiedName = type.sdsClass.qualifiedNameOrNull()
    //     return qualifiedName in setOf(
    //         StdlibClasses.Boolean,
    //         StdlibClasses.Float,
    //         StdlibClasses.Int,
    //         StdlibClasses.String,
    //     )
    // }

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
            return expressionType.getTypeOfEntryByPosition(assigneePosition) ?? UnknownType;
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

            return new CallableType(node, new NamedTupleType(parameterEntries), new NamedTupleType([]));
        } else if (isSdsAttribute(node)) {
            return this.computeType(node.type);
        } else if (isSdsClass(node)) {
            return new ClassType(node, false);
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
        } else if (isSdsSegment(node)) {
            return this.computeTypeOfCallableWithManifestTypes(node);
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

        return new CallableType(node, new NamedTupleType(parameterEntries), new NamedTupleType(resultEntries));
    }

    private computeTypeOfParameter(node: SdsParameter): Type {
        // Manifest type
        if (node.type) {
            return this.computeType(node.type);
        }

        // Infer type from context
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

            const parameterType = this.computeType(parameter?.type);
            if (!(parameterType instanceof CallableType)) {
                return UnknownType;
            }

            const parameterPosition = node.$containerIndex ?? -1;
            return parameterType.getParameterTypeByPosition(parameterPosition) ?? UnknownType;
        }

        // Yielded lambda
        else if (isSdsAssignment(containerOfLambda)) {
            const firstAssignee = getAssignees(containerOfLambda)[0];
            if (!isSdsYield(firstAssignee)) {
                return UnknownType;
            }

            const resultType = this.computeType(firstAssignee.result?.ref);
            if (!(resultType instanceof CallableType)) {
                return UnknownType;
            }

            const parameterPosition = node.$containerIndex ?? -1;
            return resultType.getParameterTypeByPosition(parameterPosition) ?? UnknownType;
        }

        return UnknownType;
    }

    private computeTypeOfExpression(node: SdsExpression): Type {
        // Partial evaluation (definitely handles SdsBoolean, SdsFloat, SdsInt, SdsNull, and SdsString)
        const evaluatedNode = this.partialEvaluator.evaluate(node);
        if (evaluatedNode instanceof Constant) {
            return new LiteralType([evaluatedNode]);
        }

        // Terminal cases
        if (isSdsList(node)) {
            return this.coreTypes.List;
        } else if (isSdsMap(node)) {
            return this.coreTypes.Map;
        } else if (isSdsTemplateString(node)) {
            return this.coreTypes.String;
        }

        // Recursive cases
        else if (isSdsArgument(node)) {
            return this.computeType(node.value);
        } else if (isSdsCall(node)) {
            return this.computeTypeOfCall(node);
        } else if (isSdsBlockLambda(node)) {
            const parameterEntries = getParameters(node).map(
                (it) => new NamedTupleEntry(it, it.name, this.computeType(it)),
            );
            const resultEntries = streamBlockLambdaResults(node)
                .map((it) => new NamedTupleEntry(it, it.name, this.computeType(it)))
                .toArray();

            return new CallableType(node, new NamedTupleType(parameterEntries), new NamedTupleType(resultEntries));
        } else if (isSdsExpressionLambda(node)) {
            const parameterEntries = getParameters(node).map(
                (it) => new NamedTupleEntry(it, it.name, this.computeType(it)),
            );
            const resultEntries = [
                new NamedTupleEntry<SdsAbstractResult>(undefined, 'result', this.computeType(node.result)),
            ];

            return new CallableType(node, new NamedTupleType(parameterEntries), new NamedTupleType(resultEntries));
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

    private computeTypeOfCall(node: SdsCall): Type {
        const receiverType = this.computeType(node.receiver);

        if (receiverType instanceof CallableType) {
            if (!isSdsAnnotation(receiverType.sdsCallable)) {
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
            /* c8 ignore next 3 */
            const rightOperandType = this.computeType(node.rightOperand);
            return this.lowestCommonSupertype(leftOperandType.copyWithNullability(false), rightOperandType);
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
        return memberType.copyWithNullability((receiverType.isNullable && node.isNullSafe) || memberType.isNullable);
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
            return new StaticType(instanceType.copyWithNullability(false));
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
            return this.computeType(node.declaration?.ref).copyWithNullability(node.isNullable);
        } else if (isSdsUnionType(node)) {
            const typeArguments = getTypeArguments(node.typeArgumentList);
            return new UnionType(typeArguments.map((typeArgument) => this.computeType(typeArgument.value)));
        } /* c8 ignore start */ else {
            return UnknownType;
        } /* c8 ignore stop */
    }

    private computeTypeOfLiteralType(node: SdsLiteralType): Type {
        const constants = getLiterals(node).map((it) => this.partialEvaluator.evaluate(it));
        if (constants.every(isConstant)) {
            return new LiteralType(constants);
        } /* c8 ignore start */ else {
            return UnknownType;
        } /* c8 ignore stop */
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------------------------------------------------

    private lowestCommonSupertype(..._types: Type[]): Type {
        return NotImplementedType;
    }

    // private fun lowestCommonSupertype(context: EObject, types: List<Type>): Type {
    //     if (types.isEmpty()) {
    //         return Nothing(context)
    //     }
    //
    //     val unwrappedTypes = unwrapUnionTypes(types)
    //     val isNullable = unwrappedTypes.any { it.isNullable }
    //     var candidate = unwrappedTypes.first().setIsNullableOnCopy(isNullable)
    //
    //     while (!isLowestCommonSupertype(candidate, unwrappedTypes)) {
    //         candidate = when (candidate) {
    //             is CallableType -> Any(context, candidate.isNullable)
    //             is ClassType -> {
    //                 val superClass = candidate.sdsClass.superClasses().firstOrNull()
    //                     ?: return Any(context, candidate.isNullable)
    //
    //                 ClassType(superClass, typeParametersTypes, candidate.isNullable)
    //             }
    //             is EnumType -> Any(context, candidate.isNullable)
    //             is EnumVariantType -> {
    //                 val containingEnum = candidate.sdsEnumVariant.containingEnumOrNull()
    //                     ?: return Any(context, candidate.isNullable)
    //                 EnumType(containingEnum, candidate.isNullable)
    //             }
    //             is RecordType -> Any(context, candidate.isNullable)
    //             // TODO: Correct ?
    //             is UnionType -> throw AssertionError("Union types should have been unwrapped.")
    //             UnresolvedType -> Any(context, candidate.isNullable)
    //             is VariadicType -> Any(context, candidate.isNullable)
    //         }
    //     }
    //
    //     return candidate
    // }
    //
    // private fun unwrapUnionTypes(types: List<Type>): List<Type> {
    //     return types.flatMap {
    //         when (it) {
    //             is UnionType -> it.possibleTypes
    //         else -> listOf(it)
    //         }
    //     }
    // }
    //
    // private fun isLowestCommonSupertype(candidate: Type, otherTypes: List<Type>): Boolean {
    //     if (candidate is ClassType && candidate.sdsClass.qualifiedNameOrNull() == StdlibClasses.Any) {
    //         return true
    //     }
    //
    //     return otherTypes.all { it.isSubstitutableFor(candidate) }
    // }
}
