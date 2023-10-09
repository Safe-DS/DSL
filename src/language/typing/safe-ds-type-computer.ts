import { AstNode, AstNodeLocator, getContainerOfType, getDocument, WorkspaceCache } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsClasses } from '../builtins/safe-ds-classes.js';
import {
    CallableType,
    ClassType,
    EnumType,
    EnumVariantType,
    NamedTupleEntry,
    NamedTupleType,
    NamedType,
    NotImplementedType,
    StaticType,
    Type,
    UnionType,
    UnknownType,
    VariadicType,
} from './model.js';
import {
    isSdsAnnotation,
    isSdsArgument,
    isSdsAssignee,
    isSdsAssignment,
    isSdsAttribute,
    isSdsBlockLambda,
    isSdsBoolean,
    isSdsCall,
    isSdsCallable,
    isSdsCallableType,
    isSdsClass,
    isSdsDeclaration,
    isSdsEnum,
    isSdsEnumVariant,
    isSdsExpression,
    isSdsExpressionLambda,
    isSdsFloat,
    isSdsFunction,
    isSdsIndexedAccess,
    isSdsInfixOperation,
    isSdsInt,
    isSdsLambda,
    isSdsList,
    isSdsLiteralType,
    isSdsMap,
    isSdsMemberAccess,
    isSdsMemberType,
    isSdsNamedType,
    isSdsNamedTypeDeclaration,
    isSdsNull,
    isSdsParameter,
    isSdsParenthesizedExpression,
    isSdsPipeline,
    isSdsPrefixOperation,
    isSdsReference,
    isSdsResult,
    isSdsSegment,
    isSdsString,
    isSdsTemplateString,
    isSdsType,
    isSdsTypeProjection,
    isSdsUnionType,
    isSdsYield,
    SdsAssignee,
    SdsCall,
    SdsCallableType,
    SdsClass,
    SdsDeclaration,
    SdsExpression,
    SdsFunction,
    SdsIndexedAccess,
    SdsInfixOperation,
    SdsParameter,
    SdsPrefixOperation,
    SdsReference,
    SdsSegment,
    SdsType,
} from '../generated/ast.js';
import { SafeDsNodeMapper } from '../helpers/safe-ds-node-mapper.js';
import {
    assigneesOrEmpty,
    blockLambdaResultsOrEmpty,
    parametersOrEmpty,
    resultsOrEmpty,
    typeArgumentsOrEmpty,
} from '../helpers/nodeProperties.js';

export class SafeDsTypeComputer {
    private readonly astNodeLocator: AstNodeLocator;
    private readonly coreClasses: SafeDsClasses;
    private readonly nodeMapper: SafeDsNodeMapper;

    readonly typeCache: WorkspaceCache<string, Type>;

    constructor(readonly services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.coreClasses = services.builtins.Classes;
        this.nodeMapper = services.helpers.NodeMapper;

        this.typeCache = new WorkspaceCache(services.shared);
    }

    computeType(node: AstNode | undefined): Type {
        if (!node) {
            return UnknownType;
        }

        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        const key = `${documentUri}~${nodePath}`;
        return this.typeCache.get(key, () => this.doComputeType(node).unwrap());
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
            const parameterEntries = parametersOrEmpty(node).map(
                (it) => new NamedTupleEntry(it.name, this.computeType(it.type)),
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
        const parameterEntries = parametersOrEmpty(node).map(
            (it) => new NamedTupleEntry(it.name, this.computeType(it.type)),
        );
        const resultEntries = resultsOrEmpty(node.resultList).map(
            (it) => new NamedTupleEntry(it.name, this.computeType(it.type)),
        );

        return new CallableType(node, new NamedTupleType(parameterEntries), new NamedTupleType(resultEntries));
    }

    private computeTypeOfParameter(node: SdsParameter): Type {
        // Manifest type
        if (node.type) {
            const manifestParameterType = this.computeType(node.type);
            if (node.isVariadic) {
                return new VariadicType(manifestParameterType);
            } else {
                return manifestParameterType;
            }
        }

        // Infer type from context
        const containingCallable = getContainerOfType(node, isSdsCallable);
        if (!isSdsLambda(containingCallable)) {
            return UnknownType;
        }

        const containerOfLambda = containingCallable.$container;

        // Lambda passed as argument
        if (isSdsArgument(containerOfLambda)) {
            const parameter = this.nodeMapper.argumentToParameterOrUndefined(containerOfLambda);
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
            const firstAssignee = assigneesOrEmpty(containerOfLambda)[0];
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
        // Terminal cases
        if (isSdsBoolean(node)) {
            return this.Boolean();
        } else if (isSdsFloat(node)) {
            return this.Float();
        } else if (isSdsInt(node)) {
            return this.Int();
        } else if (isSdsList(node)) {
            return this.List();
        } else if (isSdsMap(node)) {
            return this.Map();
        } else if (isSdsNull(node)) {
            return this.NothingOrNull();
        } else if (isSdsString(node)) {
            return this.String();
        } else if (isSdsTemplateString(node)) {
            return this.String();
        }

        // Recursive cases
        else if (isSdsArgument(node)) {
            return this.computeType(node.value);
        } else if (isSdsCall(node)) {
            return this.computeTypeOfCall(node);
        } else if (isSdsBlockLambda(node)) {
            const parameterEntries = parametersOrEmpty(node).map(
                (it) => new NamedTupleEntry(it.name, this.computeType(it)),
            );
            const resultEntries = blockLambdaResultsOrEmpty(node).map(
                (it) => new NamedTupleEntry(it.name, this.computeType(it)),
            );

            return new CallableType(node, new NamedTupleType(parameterEntries), new NamedTupleType(resultEntries));
        } else if (isSdsExpressionLambda(node)) {
            const parameterEntries = parametersOrEmpty(node).map(
                (it) => new NamedTupleEntry(it.name, this.computeType(it)),
            );
            const resultEntries = [new NamedTupleEntry('result', this.computeType(node.result))];

            return new CallableType(node, new NamedTupleType(parameterEntries), new NamedTupleType(resultEntries));
        } else if (isSdsIndexedAccess(node)) {
            return this.computeTypeOfIndexedAccess(node);
        } else if (isSdsInfixOperation(node)) {
            switch (node.operator) {
                // Boolean operators
                case 'or':
                case 'and':
                    return this.Boolean();

                // Equality operators
                case '==':
                case '!=':
                case '===':
                case '!==':
                    return this.Boolean();

                // Comparison operators
                case '<':
                case '<=':
                case '>=':
                case '>':
                    return this.Boolean();

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
            const memberType = this.computeType(node.member);
            return memberType.copyWithNullability(node.isNullSafe || memberType.isNullable);
        } else if (isSdsParenthesizedExpression(node)) {
            return this.computeType(node.expression);
        } else if (isSdsPrefixOperation(node)) {
            switch (node.operator) {
                case 'not':
                    return this.Boolean();
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
            if (isSdsCallable(instanceType.sdsDeclaration)) {
                return instanceType;
            }
        }

        return UnknownType;
    }

    private computeTypeOfIndexedAccess(node: SdsIndexedAccess): Type {
        const receiverType = this.computeType(node.receiver);
        if (receiverType.equals(this.List()) || receiverType.equals(this.Map())) {
            return this.AnyOrNull();
        } else if (receiverType instanceof VariadicType) {
            return receiverType.elementType;
        } else {
            return UnknownType;
        }
    }

    private computeTypeOfArithmeticInfixOperation(node: SdsInfixOperation): Type {
        const leftOperandType = this.computeType(node.leftOperand);
        const rightOperandType = this.computeType(node.rightOperand);

        if (leftOperandType.equals(this.Int()) && rightOperandType.equals(this.Int())) {
            return this.Int();
        } else {
            return this.Float();
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

    private computeTypeOfArithmeticPrefixOperation(node: SdsPrefixOperation): Type {
        const leftOperandType = this.computeType(node.operand);

        if (leftOperandType.equals(this.Int())) {
            return this.Int();
        } else {
            return this.Float();
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
            /* c8 ignore next */
            return NotImplementedType;
        } else if (isSdsMemberType(node)) {
            return this.computeType(node.member);
        } else if (isSdsNamedType(node)) {
            return this.computeType(node.declaration.ref).copyWithNullability(node.isNullable);
        } else if (isSdsUnionType(node)) {
            const typeArguments = typeArgumentsOrEmpty(node.typeArgumentList);
            return new UnionType(typeArguments.map((typeArgument) => this.computeType(typeArgument.value)));
        } /* c8 ignore start */ else {
            return UnknownType;
        } /* c8 ignore stop */
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------------------------------------------------

    /* c8 ignore start */
    private lowestCommonSupertype(..._types: Type[]): Type {
        return NotImplementedType;
    }

    /* c8 ignore stop */

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

    // -----------------------------------------------------------------------------------------------------------------
    // Builtin types
    // -----------------------------------------------------------------------------------------------------------------

    private AnyOrNull(): Type {
        return this.createCoreType(this.coreClasses.Any, true);
    }

    private Boolean(): Type {
        return this.createCoreType(this.coreClasses.Boolean);
    }

    private Float(): Type {
        return this.createCoreType(this.coreClasses.Float);
    }

    private Int(): Type {
        return this.createCoreType(this.coreClasses.Int);
    }

    private List(): Type {
        return this.createCoreType(this.coreClasses.List);
    }

    private Map(): Type {
        return this.createCoreType(this.coreClasses.Map);
    }

    private NothingOrNull(): Type {
        return this.createCoreType(this.coreClasses.Nothing, true);
    }

    private String(): Type {
        return this.createCoreType(this.coreClasses.String);
    }

    private createCoreType(coreClass: SdsClass | undefined, isNullable: boolean = false): Type {
        if (coreClass) {
            return new ClassType(coreClass, isNullable);
        } /* c8 ignore start */ else {
            return UnknownType;
        } /* c8 ignore stop */
    }
}
