import {AstNode, AstNodeLocator, getDocument, WorkspaceCache} from 'langium';
import {SafeDsServices} from '../safe-ds-module.js';
import {SafeDsCoreClasses} from '../builtins/safe-ds-core-classes.js';
import {ClassType, Type, UnresolvedType} from './model.js';
import {
    isSdsAssignee,
    isSdsBoolean,
    isSdsDeclaration,
    isSdsExpression,
    isSdsFloat,
    isSdsInt,
    isSdsNull,
    isSdsString,
    isSdsTemplateString,
    isSdsType,
    isSdsTypeArgument,
    isSdsTypeProjection,
    SdsAssignee,
    SdsClass,
    SdsDeclaration,
    SdsExpression,
    SdsType,
} from '../generated/ast.js';

/* c8 ignore start */
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
            return UnresolvedType;
        }

        const documentUri = getDocument(node).uri.toString();
        const nodePath = this.astNodeLocator.getAstNodePath(node);
        const key = `${documentUri}~${nodePath}`;
        return this.typeCache.get(key, () => this.doComputeType(node));
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
            return UnresolvedType;
            // return this.computeType(node.value);
        } else if (isSdsTypeProjection(node)) {
            return UnresolvedType;
            // return this.computeTypeOfType(node.type);
        } else {
            return this.Any();
        }
    }

    private computeTypeOfAssignee(_node: SdsAssignee): Type {
        return UnresolvedType;
    }

    private computeTypeOfDeclaration(_node: SdsDeclaration): Type {
        return UnresolvedType;
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
            return this.Nothing(true);
        } else if (isSdsString(node)) {
            return this.String();
        } else if (isSdsTemplateString(node)) {
            return this.String();
        }

        return UnresolvedType;
    }

    private computeTypeOfType(_node: SdsType): Type {
        return UnresolvedType;
    }

    private cachedAny: Type = UnresolvedType;

    private Any(): Type {
        if (this.cachedAny === UnresolvedType) {
            this.cachedAny = this.createCoreType(this.coreClasses.Any);
        }
        return this.cachedAny;
    }

    private cachedBoolean: Type = UnresolvedType;

    private Boolean(): Type {
        if (this.cachedBoolean === UnresolvedType) {
            this.cachedBoolean = this.createCoreType(this.coreClasses.Boolean);
        }
        return this.cachedBoolean;
    }

    private cachedFloat: Type = UnresolvedType;

    private Float(): Type {
        if (this.cachedFloat === UnresolvedType) {
            this.cachedFloat = this.createCoreType(this.coreClasses.Float);
        }
        return this.cachedFloat;
    }

    private cachedInt: Type = UnresolvedType;

    private Int(): Type {
        if (this.cachedInt === UnresolvedType) {
            this.cachedInt = this.createCoreType(this.coreClasses.Int);
        }
        return this.cachedInt;
    }

    private cachedNullableNothing: Type = UnresolvedType;
    private cachedNothing: Type = UnresolvedType;

    private Nothing(isNullable: boolean): Type {
        if (isNullable) {
            if (this.cachedNullableNothing === UnresolvedType) {
                this.cachedNullableNothing = this.createCoreType(this.coreClasses.Nothing, true);
            }
            return this.cachedNullableNothing;
        } else {
            if (this.cachedNothing === UnresolvedType) {
                this.cachedNothing = this.createCoreType(this.coreClasses.Nothing);
            }
            return this.cachedNothing;
        }
    }

    private cachedString: Type = UnresolvedType;

    private String(): Type {
        if (this.cachedString === UnresolvedType) {
            this.cachedString = this.createCoreType(this.coreClasses.String);
        }
        return this.cachedString;
    }

    private createCoreType(coreClass: SdsClass | undefined, isNullable: boolean = false): Type {
        if (coreClass) {
            return new ClassType(coreClass, isNullable);
        } else {
            return UnresolvedType;
        }
    }
}

/* c8 ignore stop */

/*
fun SdsAbstractObject.hasPrimitiveType(): Boolean {
    val type = type()
    if (type !is ClassType) {
        return false
    }

    val qualifiedName = type.sdsClass.qualifiedNameOrNull()
    return qualifiedName in setOf(
        StdlibClasses.Boolean,
        StdlibClasses.Float,
        StdlibClasses.Int,
        StdlibClasses.String,
    )
}

private fun SdsAbstractAssignee.inferTypeForAssignee(context: EObject): Type {
    return when {
        this.eIsProxy() -> UnresolvedType
        this is SdsBlockLambdaResult || this is SdsPlaceholder || this is SdsYield -> {
            val assigned = assignedOrNull() ?: return Nothing(context)
            assigned.inferType(context)
        }
        else -> Any(context)
    }
}

@OptIn(ExperimentalSdsApi::class)
private fun SdsAbstractDeclaration.inferTypeForDeclaration(context: EObject): Type {
    return when {
        this.eIsProxy() -> UnresolvedType
        this is SdsAttribute -> type.inferTypeForType(context)
        this is SdsClass -> {
            val typeParametersTypes = this.typeParametersOrEmpty()
                .map { it.inferTypeForDeclaration(context) }
                .filterIsInstance<ParameterisedType>()

            ClassType(this, typeParametersTypes, isNullable = false)
        }
        this is SdsEnum -> EnumType(this, isNullable = false)
        this is SdsEnumVariant -> EnumVariantType(this, isNullable = false)
        this is SdsFunction -> CallableType(
            parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            resultsOrEmpty().map { it.inferTypeForDeclaration(context) },
        )
        this is SdsParameter -> {
            // Declared parameter type
            if (this.type != null) {
                val declaredParameterType = this.type.inferTypeForType(context)
                return when {
                    this.isVariadic -> VariadicType(declaredParameterType)
                    else -> declaredParameterType
                }
            }

            // Inferred lambda parameter type
            val callable = this.closestAncestorOrNull<SdsAbstractCallable>()
            val thisIndex = callable.parametersOrEmpty().indexOf(this)
            if (callable is SdsAbstractLambda) {
                val containerType = when (val container = callable.eContainer()) {
                    is SdsArgument -> container.parameterOrNull()?.inferType(context)
                    is SdsAssignment ->
                        container
                            .yieldsOrEmpty()
                            .find { it.assignedOrNull() == callable }
                            ?.result
                            ?.inferType(context)
                    else -> null
                }

                return when (containerType) {
                    is CallableType -> containerType.parameters.getOrElse(thisIndex) { Any(context) }
                    else -> Any(context)
                }
            }

            // We don't know better
            return Any(context)
        }
        this is SdsResult -> type.inferTypeForType(context)
        // For now all Schema placeholders are of type 'ParameterisedType(::$SchemaType)'
        this is SdsSchemaPlaceholder -> ParameterisedType(this, SdsKind.SchemaKind.toString())
        this is SdsStep -> CallableType(
            parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            resultsOrEmpty().map { it.inferTypeForDeclaration(context) },
        )
        // Todo: resolve TypeParameter for "non kind" TypeParameter too
        this is SdsTypeParameter && this.kind != null -> ParameterisedType(this, kind)
        else -> Any(context)
    }
}

private fun SdsAbstractExpression.inferTypeExpression(context: EObject): Type {
    return when {
        // Terminal cases
        this.eIsProxy() -> UnresolvedType
        this is SdsBoolean -> Boolean(context)
        this is SdsFloat -> Float(context)
        this is SdsInt -> Int(context)
        this is SdsNull -> Nothing(context, isNullable = true)
        this is SdsString -> String(context)
        this is SdsTemplateString -> String(context)

        // Recursive cases
        this is SdsArgument -> this.value.inferTypeExpression(context)
        this is SdsBlockLambda -> CallableType(
            this.parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            blockLambdaResultsOrEmpty().map { it.inferTypeForAssignee(context) },
        )
        this is SdsCall -> when (val callable = callableOrNull()) {
            is SdsClass -> {
                val typeParametersTypes = callable.typeParametersOrEmpty()
                    .map { it.inferTypeForDeclaration(context) }
                    .filterIsInstance<ParameterisedType>()

                ClassType(callable, typeParametersTypes, isNullable = false)
            }
            is SdsCallableType -> {
                val results = callable.resultsOrEmpty()
                when (results.size) {
                    1 -> results.first().inferTypeForDeclaration(context)
                    else -> RecordType(results.map { it.name to it.inferTypeForDeclaration(context) })
                }
            }
            is SdsFunction -> {
                val results = callable.resultsOrEmpty()
                when (results.size) {
                    1 -> results.first().inferTypeForDeclaration(context)
                    else -> RecordType(results.map { it.name to it.inferTypeForDeclaration(context) })
                }
            }
            is SdsBlockLambda -> {
                val results = callable.blockLambdaResultsOrEmpty()
                when (results.size) {
                    1 -> results.first().inferTypeForAssignee(context)
                    else -> RecordType(results.map { it.name to it.inferTypeForAssignee(context) })
                }
            }
            is SdsEnumVariant -> {
                EnumVariantType(callable, isNullable = false)
            }
            is SdsExpressionLambda -> {
                callable.result.inferTypeExpression(context)
            }
            is SdsStep -> {
                val results = callable.resultsOrEmpty()
                when (results.size) {
                    1 -> results.first().inferTypeForDeclaration(context)
                    else -> RecordType(results.map { it.name to it.inferTypeForDeclaration(context) })
                }
            }
            else -> Any(context)
        }
        this is SdsExpressionLambda -> CallableType(
            this.parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            listOf(result.inferTypeExpression(context)),
        )
        this is SdsIndexedAccess -> {
            when (val receiverType = this.receiver.inferTypeExpression(context)) {
                is UnresolvedType -> UnresolvedType
                is VariadicType -> receiverType.elementType
                else -> Nothing(context)
            }
        }
        this is SdsInfixOperation -> when (operator) {
            "<", "<=", ">=", ">" -> Boolean(context)
            "==", "!=" -> Boolean(context)
            "===", "!==" -> Boolean(context)
            "or", "and" -> Boolean(context)
            "+", "-", "*", "/" -> when {
                this.leftOperand.inferTypeExpression(context) == Int(context) &&
                    this.rightOperand.inferTypeExpression(context) == Int(context) -> Int(context)
                else -> Float(context)
            }
            "?:" -> {
                val leftOperandType = this.leftOperand.inferTypeExpression(context)
                if (leftOperandType.isNullable) {
                    lowestCommonSupertype(
                        context,
                        listOf(
                            leftOperandType.setIsNullableOnCopy(isNullable = false),
                            this.rightOperand.inferTypeExpression(context),
                        ),
                    )
                } else {
                    leftOperandType
                }
            }
            else -> Nothing(context)
        }
        this is SdsMemberAccess -> {
            val memberType = this.member.inferTypeExpression(context)
            memberType.setIsNullableOnCopy(this.isNullSafe || memberType.isNullable)
        }
        this is SdsParenthesizedExpression -> this.expression.inferTypeExpression(context)
        this is SdsPrefixOperation -> when (operator) {
            "not" -> Boolean(context)
            "-" -> when (this.operand.inferTypeExpression(context)) {
                Int(context) -> Int(context)
                else -> Float(context)
            }
            else -> Nothing(context)
        }
        this is SdsReference -> this.declaration.inferType(context)
        this is SdsSchemaReference -> this.type.inferTypeForType(context)
        else -> Any(context)
    }
}

private fun SdsAbstractType.inferTypeForType(context: EObject): Type {
    return when {
        this.eIsProxy() -> UnresolvedType
        this is SdsCallableType -> CallableType(
            this.parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            this.resultsOrEmpty().map { it.inferTypeForDeclaration(context) },
        )
        this is SdsMemberType -> {
            this.member.inferTypeForType(context)
        }
        this is SdsNamedType -> {
            this.declaration.inferTypeForDeclaration(context).setIsNullableOnCopy(this.isNullable)
        }
        this is SdsParenthesizedType -> {
            this.type.inferTypeForType(context)
        }
        this is SdsSchemaType -> {
            this.declaration.inferTypeForDeclaration(context)
        }
        this is SdsUnionType -> {
            UnionType(this.typeArgumentsOrEmpty().map { it.value.inferType(context) }.toSet())
        }
        else -> Any(context)
    }
}

private fun lowestCommonSupertype(context: EObject, types: List<Type>): Type {
    if (types.isEmpty()) {
        return Nothing(context)
    }

    val unwrappedTypes = unwrapUnionTypes(types)
    val isNullable = unwrappedTypes.any { it.isNullable }
    var candidate = unwrappedTypes.first().setIsNullableOnCopy(isNullable)

    while (!isLowestCommonSupertype(candidate, unwrappedTypes)) {
        candidate = when (candidate) {
            is CallableType -> Any(context, candidate.isNullable)
            is ClassType -> {
                val superClass = candidate.sdsClass.superClasses().firstOrNull()
                    ?: return Any(context, candidate.isNullable)

                val typeParametersTypes = superClass.typeParametersOrEmpty()
                    .map { it.inferTypeForDeclaration(context) }
                    .filterIsInstance<ParameterisedType>()

                ClassType(superClass, typeParametersTypes, candidate.isNullable)
            }
            is EnumType -> Any(context, candidate.isNullable)
            is EnumVariantType -> {
                val containingEnum = candidate.sdsEnumVariant.containingEnumOrNull()
                    ?: return Any(context, candidate.isNullable)
                EnumType(containingEnum, candidate.isNullable)
            }
            is RecordType -> Any(context, candidate.isNullable)
            // TODO: Correct ?
            is ParameterisedType -> Any(context, candidate.isNullable)
            is UnionType -> throw AssertionError("Union types should have been unwrapped.")
            UnresolvedType -> Any(context, candidate.isNullable)
            is VariadicType -> Any(context, candidate.isNullable)
        }
    }

    return candidate
}

private fun unwrapUnionTypes(types: List<Type>): List<Type> {
    return types.flatMap {
        when (it) {
            is UnionType -> it.possibleTypes
            else -> listOf(it)
        }
    }
}

private fun isLowestCommonSupertype(candidate: Type, otherTypes: List<Type>): Boolean {
    if (candidate is ClassType && candidate.sdsClass.qualifiedNameOrNull() == StdlibClasses.Any) {
        return true
    }

    return otherTypes.all { it.isSubstitutableFor(candidate) }
}
 */
