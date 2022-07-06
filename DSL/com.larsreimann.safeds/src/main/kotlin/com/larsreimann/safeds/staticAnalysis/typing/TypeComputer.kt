@file:Suppress("FunctionName")

package com.larsreimann.safeds.staticAnalysis.typing

import com.larsreimann.safeds.emf.blockLambdaResultsOrEmpty
import com.larsreimann.safeds.emf.closestAncestorOrNull
import com.larsreimann.safeds.emf.containingEnumOrNull
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.resultsOrEmpty
import com.larsreimann.safeds.emf.typeArgumentsOrEmpty
import com.larsreimann.safeds.emf.yieldsOrEmpty
import com.larsreimann.safeds.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SdsAbstractAssignee
import com.larsreimann.safeds.safeDS.SdsAbstractCallable
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAbstractExpression
import com.larsreimann.safeds.safeDS.SdsAbstractGoalExpression
import com.larsreimann.safeds.safeDS.SdsAbstractLambda
import com.larsreimann.safeds.safeDS.SdsAbstractObject
import com.larsreimann.safeds.safeDS.SdsAbstractType
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsBlockLambda
import com.larsreimann.safeds.safeDS.SdsBlockLambdaResult
import com.larsreimann.safeds.safeDS.SdsBoolean
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsCallableType
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsExpressionLambda
import com.larsreimann.safeds.safeDS.SdsFloat
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsGoalArgument
import com.larsreimann.safeds.safeDS.SdsGoalReference
import com.larsreimann.safeds.safeDS.SdsIndexedAccess
import com.larsreimann.safeds.safeDS.SdsInfixOperation
import com.larsreimann.safeds.safeDS.SdsInt
import com.larsreimann.safeds.safeDS.SdsMemberAccess
import com.larsreimann.safeds.safeDS.SdsMemberType
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.safeDS.SdsNull
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsParenthesizedExpression
import com.larsreimann.safeds.safeDS.SdsParenthesizedType
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsPrefixOperation
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsString
import com.larsreimann.safeds.safeDS.SdsTemplateString
import com.larsreimann.safeds.safeDS.SdsTypeArgument
import com.larsreimann.safeds.safeDS.SdsTypeProjection
import com.larsreimann.safeds.safeDS.SdsUnionType
import com.larsreimann.safeds.safeDS.SdsYield
import com.larsreimann.safeds.staticAnalysis.assignedOrNull
import com.larsreimann.safeds.staticAnalysis.callableOrNull
import com.larsreimann.safeds.staticAnalysis.classHierarchy.superClasses
import com.larsreimann.safeds.staticAnalysis.linking.parameterOrNull
import com.larsreimann.safeds.stdlibAccess.StdlibClasses
import com.larsreimann.safeds.stdlibAccess.getStdlibClassOrNull
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.naming.QualifiedName

fun SdsAbstractObject.type(): Type {
    return inferType(this)
}

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

private fun EObject.inferType(context: EObject): Type {
    return when {
        this.eIsProxy() -> UnresolvedType
        this is SdsAbstractAssignee -> this.inferTypeForAssignee(context)
        this is SdsAbstractDeclaration -> this.inferTypeForDeclaration(context)
        this is SdsAbstractExpression -> this.inferTypeExpression(context)
        this is SdsAbstractGoalExpression -> this.inferTypeExpression(context)
        this is SdsAbstractType -> this.inferTypeForType(context)
        this is SdsTypeArgument -> this.value.inferType(context)
        this is SdsTypeProjection -> this.type.inferTypeForType(context)
        else -> Any(context)
    }
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

private fun SdsAbstractDeclaration.inferTypeForDeclaration(context: EObject): Type {
    return when {
        this.eIsProxy() -> UnresolvedType
        this is SdsAttribute -> type.inferTypeForType(context)
        this is SdsClass -> ClassType(this, isNullable = false)
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
        this is SdsStep -> CallableType(
            parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            resultsOrEmpty().map { it.inferTypeForDeclaration(context) },
        )
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
            is SdsClass -> ClassType(callable, isNullable = false)
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
        else -> Any(context)
    }
}

private fun SdsAbstractGoalExpression.inferTypeExpression(context: EObject): Type {
    return when {
        // Terminal cases
        this.eIsProxy() -> UnresolvedType
        this is SdsBoolean -> Boolean(context)
        this is SdsFloat -> Float(context)
        this is SdsInt -> Int(context)
        this is SdsNull -> Nothing(context, isNullable = true)
        this is SdsString -> String(context)
        this is SdsTemplateString -> String(context)

        this is SdsGoalArgument -> this.value.inferTypeExpression(context)
        this is SdsGoalReference -> this.declaration.inferType(context)
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
                ClassType(superClass, candidate.isNullable)
            }
            is EnumType -> Any(context, candidate.isNullable)
            is EnumVariantType -> {
                val containingEnum = candidate.sdsEnumVariant.containingEnumOrNull()
                    ?: return Any(context, candidate.isNullable)
                EnumType(containingEnum, candidate.isNullable)
            }
            is RecordType -> Any(context, candidate.isNullable)
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

private fun Any(context: EObject, isNullable: Boolean = false) = stdlibType(
    context,
    StdlibClasses.Any,
    isNullable,
)

private fun Boolean(context: EObject) = stdlibType(context, StdlibClasses.Boolean)
private fun Float(context: EObject) = stdlibType(context, StdlibClasses.Float)
private fun Int(context: EObject) = stdlibType(context, StdlibClasses.Int)
private fun Nothing(context: EObject, isNullable: Boolean = false) = stdlibType(
    context,
    StdlibClasses.Nothing,
    isNullable,
)

private fun String(context: EObject) = stdlibType(context, StdlibClasses.String)

internal fun stdlibType(context: EObject, qualifiedName: QualifiedName, isNullable: Boolean = false): Type {
    return when (val sdsClass = context.getStdlibClassOrNull(qualifiedName)) {
        null -> UnresolvedType
        else -> ClassType(sdsClass, isNullable)
    }
}
