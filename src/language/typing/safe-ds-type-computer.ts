import { AstNode, AstNodeLocator, getContainerOfType, getDocument, WorkspaceCache } from 'langium';
import { SafeDsServices } from '../safe-ds-module.js';
import { SafeDsCoreClasses } from '../builtins/safe-ds-core-classes.js';
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
    isSdsLiteralType,
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
    SdsInfixOperation,
    SdsParameter,
    SdsPrefixOperation,
    SdsReference,
    SdsSegment,
    SdsType,
} from '../generated/ast.js';
import {
    assigneesOrEmpty,
    blockLambdaResultsOrEmpty,
    parametersOrEmpty,
    resultsOrEmpty,
    typeArgumentsOrEmpty,
} from '../helpers/shortcuts.js';

export class SafeDsTypeComputer {
    readonly astNodeLocator: AstNodeLocator;
    readonly coreClasses: SafeDsCoreClasses;

    readonly typeCache: WorkspaceCache<string, Type>;

    constructor(readonly services: SafeDsServices) {
        this.astNodeLocator = services.workspace.AstNodeLocator;
        this.coreClasses = services.builtins.CoreClasses;

        this.typeCache = new WorkspaceCache(services.shared);
    }

    computeType(node: AstNode | undefined): Type {
        if (!node) {
            return UnknownType;
        }

        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        const key = `${documentUri}~${nodePath}`;
        return this.typeCache.get(key, () => this.doComputeType(node));
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
        }

        /* c8 skip next */
        return UnknownType;
    }

    private computeTypeOfAssignee(node: SdsAssignee): Type {
        const containingAssignment = getContainerOfType(node, isSdsAssignment);
        if (!containingAssignment) {
            /* c8 skip next */
            return UnknownType;
        }

        const nodePosition = node.$containerIndex ?? -1;
        const expressionType = this.computeType(containingAssignment?.expression);
        if (expressionType instanceof NamedTupleType) {
            return expressionType.getTypeOfEntryByPosition(nodePosition) ?? UnknownType;
        } else if (nodePosition === 0) {
            return expressionType;
        }

        return UnknownType;
    }

    private computeTypeOfDeclaration(node: SdsDeclaration): Type {
        if (isSdsAnnotation(node)) {
            const parameterEntries = parametersOrEmpty(node.parameterList).map(
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
        }

        /* c8 skip next */
        return UnknownType;
    }

    private computeTypeOfCallableWithManifestTypes(node: SdsFunction | SdsSegment | SdsCallableType): Type {
        const parameterEntries = parametersOrEmpty(node.parameterList).map(
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
            // val containerType = when (val container = callable.eContainer()) {
            //     is SdsArgument -> container.parameterOrNull()?.inferType(context)
            // }
            //
            // return when (containerType) {
            //     is CallableType -> containerType.parameters.getOrElse(thisIndex) { Any(context) }
            // else -> Any(context)
            // }

            return NotImplementedType;
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
            const parameterEntries = parametersOrEmpty(node.parameterList).map(
                (it) => new NamedTupleEntry(it.name, this.computeType(it)),
            );
            const resultEntries = blockLambdaResultsOrEmpty(node).map(
                (it) => new NamedTupleEntry(it.name, this.computeType(it)),
            );

            return new CallableType(node, new NamedTupleType(parameterEntries), new NamedTupleType(resultEntries));
        } else if (isSdsExpressionLambda(node)) {
            const parameterEntries = parametersOrEmpty(node.parameterList).map(
                (it) => new NamedTupleEntry(it.name, this.computeType(it)),
            );
            const resultEntries = [new NamedTupleEntry('result', this.computeType(node.result))];

            return new CallableType(node, new NamedTupleType(parameterEntries), new NamedTupleType(resultEntries));
        } else if (isSdsIndexedAccess(node)) {
            const receiverType = this.computeType(node.receiver);
            if (receiverType instanceof VariadicType) {
                return receiverType.elementType;
            } else {
                return UnknownType;
            }
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
            }
        } else if (isSdsReference(node)) {
            return this.computeTypeOfReference(node);
        }

        /* c8 skip next */
        return UnknownType;
    }

    private computeTypeOfCall(node: SdsCall): Type {
        const receiverType = this.computeType(node.receiver);

        if (receiverType instanceof CallableType) {
            if (!isSdsAnnotation(receiverType.callable)) {
                return receiverType.outputType;
            }
        } else if (receiverType instanceof StaticType) {
            const instanceType = receiverType.instanceType;
            const declaration = instanceType.sdsDeclaration;

            if (isSdsClass(declaration) || isSdsEnumVariant(declaration)) {
                return instanceType;
            }
        }

        return UnknownType;
    }

    private computeTypeOfArithmeticInfixOperation(node: SdsInfixOperation): Type {
        const leftOperandType = this.computeType(node.leftOperand);
        const rightOperandType = this.computeType(node.rightOperand);

        if (leftOperandType === this.Int() && rightOperandType === this.Int()) {
            return this.Int();
        } else {
            return this.Float();
        }
    }

    private computeTypeOfElvisOperation(node: SdsInfixOperation): Type {
        const leftOperandType = this.computeType(node.leftOperand);
        if (leftOperandType.isNullable) {
            const rightOperandType = this.computeType(node.rightOperand);
            return this.lowestCommonSupertype(leftOperandType.copyWithNullability(false), rightOperandType);
        } else {
            return leftOperandType;
        }
    }

    private computeTypeOfArithmeticPrefixOperation(node: SdsPrefixOperation): Type {
        const leftOperandType = this.computeType(node.operand);

        if (leftOperandType === this.Int()) {
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
            return NotImplementedType;
        } else if (isSdsMemberType(node)) {
            return this.computeType(node.member);
        } else if (isSdsNamedType(node)) {
            return this.computeType(node.declaration.ref).copyWithNullability(node.isNullable);
        } else if (isSdsUnionType(node)) {
            const typeArguments = typeArgumentsOrEmpty(node.typeArgumentList);
            return new UnionType(typeArguments.map((typeArgument) => this.computeType(typeArgument.value)));
        }

        /* c8 skip next */
        return UnknownType;
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

    // -----------------------------------------------------------------------------------------------------------------
    // Builtin types
    // -----------------------------------------------------------------------------------------------------------------

    private cachedBoolean: Type = UnknownType;

    private Boolean(): Type {
        if (this.cachedBoolean === UnknownType) {
            this.cachedBoolean = this.createCoreType(this.coreClasses.Boolean);
        }
        return this.cachedBoolean;
    }

    private cachedFloat: Type = UnknownType;

    private Float(): Type {
        if (this.cachedFloat === UnknownType) {
            this.cachedFloat = this.createCoreType(this.coreClasses.Float);
        }
        return this.cachedFloat;
    }

    private cachedInt: Type = UnknownType;

    private Int(): Type {
        if (this.cachedInt === UnknownType) {
            this.cachedInt = this.createCoreType(this.coreClasses.Int);
        }
        return this.cachedInt;
    }

    private cachedNothing: Type = UnknownType;

    private Nothing(): Type {
        if (this.cachedNothing === UnknownType) {
            this.cachedNothing = this.createCoreType(this.coreClasses.Nothing);
        }
        return this.cachedNothing;
    }

    private cachedNothingOrNull: Type = UnknownType;

    private NothingOrNull(): Type {
        if (this.cachedNothingOrNull === UnknownType) {
            this.cachedNothingOrNull = this.createCoreType(this.coreClasses.Nothing, true);
        }
        return this.cachedNothingOrNull;
    }

    private cachedString: Type = UnknownType;

    private String(): Type {
        if (this.cachedString === UnknownType) {
            this.cachedString = this.createCoreType(this.coreClasses.String);
        }
        return this.cachedString;
    }

    private createCoreType(coreClass: SdsClass | undefined, isNullable: boolean = false): Type {
        if (coreClass) {
            return new ClassType(coreClass, isNullable);
        } else {
            return UnknownType;
        }
    }
}
