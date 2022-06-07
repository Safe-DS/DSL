@file:Suppress("FunctionName")

package de.unibonn.simpleml.staticAnalysis.typing

import de.unibonn.simpleml.emf.blockLambdaResultsOrEmpty
import de.unibonn.simpleml.emf.closestAncestorOrNull
import de.unibonn.simpleml.emf.containingEnumOrNull
import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.resultsOrEmpty
import de.unibonn.simpleml.emf.typeArgumentsOrEmpty
import de.unibonn.simpleml.emf.yieldsOrEmpty
import de.unibonn.simpleml.naming.qualifiedNameOrNull
import de.unibonn.simpleml.simpleML.SmlAbstractAssignee
import de.unibonn.simpleml.simpleML.SmlAbstractCallable
import de.unibonn.simpleml.simpleML.SmlAbstractDeclaration
import de.unibonn.simpleml.simpleML.SmlAbstractExpression
import de.unibonn.simpleml.simpleML.SmlAbstractLambda
import de.unibonn.simpleml.simpleML.SmlAbstractObject
import de.unibonn.simpleml.simpleML.SmlAbstractType
import de.unibonn.simpleml.simpleML.SmlArgument
import de.unibonn.simpleml.simpleML.SmlAssignment
import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.simpleML.SmlBlockLambda
import de.unibonn.simpleml.simpleML.SmlBlockLambdaResult
import de.unibonn.simpleml.simpleML.SmlBoolean
import de.unibonn.simpleml.simpleML.SmlCall
import de.unibonn.simpleml.simpleML.SmlCallableType
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlEnum
import de.unibonn.simpleml.simpleML.SmlEnumVariant
import de.unibonn.simpleml.simpleML.SmlExpressionLambda
import de.unibonn.simpleml.simpleML.SmlFloat
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlIndexedAccess
import de.unibonn.simpleml.simpleML.SmlInfixOperation
import de.unibonn.simpleml.simpleML.SmlInt
import de.unibonn.simpleml.simpleML.SmlMemberAccess
import de.unibonn.simpleml.simpleML.SmlMemberType
import de.unibonn.simpleml.simpleML.SmlNamedType
import de.unibonn.simpleml.simpleML.SmlNull
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlParenthesizedExpression
import de.unibonn.simpleml.simpleML.SmlParenthesizedType
import de.unibonn.simpleml.simpleML.SmlPlaceholder
import de.unibonn.simpleml.simpleML.SmlPrefixOperation
import de.unibonn.simpleml.simpleML.SmlReference
import de.unibonn.simpleml.simpleML.SmlResult
import de.unibonn.simpleml.simpleML.SmlStep
import de.unibonn.simpleml.simpleML.SmlString
import de.unibonn.simpleml.simpleML.SmlTemplateString
import de.unibonn.simpleml.simpleML.SmlTypeArgument
import de.unibonn.simpleml.simpleML.SmlTypeProjection
import de.unibonn.simpleml.simpleML.SmlUnionType
import de.unibonn.simpleml.simpleML.SmlYield
import de.unibonn.simpleml.staticAnalysis.assignedOrNull
import de.unibonn.simpleml.staticAnalysis.callableOrNull
import de.unibonn.simpleml.staticAnalysis.classHierarchy.superClasses
import de.unibonn.simpleml.staticAnalysis.linking.parameterOrNull
import de.unibonn.simpleml.stdlibAccess.StdlibClasses
import de.unibonn.simpleml.stdlibAccess.getStdlibClassOrNull
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.naming.QualifiedName

fun SmlAbstractObject.type(): Type {
    return inferType(this)
}

fun SmlAbstractObject.hasPrimitiveType(): Boolean {
    val type = type()
    if (type !is ClassType) {
        return false
    }

    val qualifiedName = type.smlClass.qualifiedNameOrNull()
    return qualifiedName in setOf(
        StdlibClasses.Boolean,
        StdlibClasses.Float,
        StdlibClasses.Int,
        StdlibClasses.String
    )
}

private fun EObject.inferType(context: EObject): Type {
    return when {
        this.eIsProxy() -> UnresolvedType
        this is SmlAbstractAssignee -> this.inferTypeForAssignee(context)
        this is SmlAbstractDeclaration -> this.inferTypeForDeclaration(context)
        this is SmlAbstractExpression -> this.inferTypeExpression(context)
        this is SmlAbstractType -> this.inferTypeForType(context)
        this is SmlTypeArgument -> this.value.inferType(context)
        this is SmlTypeProjection -> this.type.inferTypeForType(context)
        else -> Any(context)
    }
}

private fun SmlAbstractAssignee.inferTypeForAssignee(context: EObject): Type {
    return when {
        this.eIsProxy() -> UnresolvedType
        this is SmlBlockLambdaResult || this is SmlPlaceholder || this is SmlYield -> {
            val assigned = assignedOrNull() ?: return Nothing(context)
            assigned.inferType(context)
        }
        else -> Any(context)
    }
}

private fun SmlAbstractDeclaration.inferTypeForDeclaration(context: EObject): Type {
    return when {
        this.eIsProxy() -> UnresolvedType
        this is SmlAttribute -> type.inferTypeForType(context)
        this is SmlClass -> ClassType(this, isNullable = false)
        this is SmlEnum -> EnumType(this, isNullable = false)
        this is SmlEnumVariant -> EnumVariantType(this, isNullable = false)
        this is SmlFunction -> CallableType(
            parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            resultsOrEmpty().map { it.inferTypeForDeclaration(context) }
        )
        this is SmlParameter -> {

            // Declared parameter type
            if (this.type != null) {
                val declaredParameterType = this.type.inferTypeForType(context)
                return when {
                    this.isVariadic -> VariadicType(declaredParameterType)
                    else -> declaredParameterType
                }
            }

            // Inferred lambda parameter type
            val callable = this.closestAncestorOrNull<SmlAbstractCallable>()
            val thisIndex = callable.parametersOrEmpty().indexOf(this)
            if (callable is SmlAbstractLambda) {
                val containerType = when (val container = callable.eContainer()) {
                    is SmlArgument -> container.parameterOrNull()?.inferType(context)
                    is SmlAssignment ->
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
        this is SmlResult -> type.inferTypeForType(context)
        this is SmlStep -> CallableType(
            parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            resultsOrEmpty().map { it.inferTypeForDeclaration(context) }
        )
        else -> Any(context)
    }
}

private fun SmlAbstractExpression.inferTypeExpression(context: EObject): Type {
    return when {

        // Terminal cases
        this.eIsProxy() -> UnresolvedType
        this is SmlBoolean -> Boolean(context)
        this is SmlFloat -> Float(context)
        this is SmlInt -> Int(context)
        this is SmlNull -> Nothing(context, isNullable = true)
        this is SmlString -> String(context)
        this is SmlTemplateString -> String(context)

        // Recursive cases
        this is SmlArgument -> this.value.inferTypeExpression(context)
        this is SmlBlockLambda -> CallableType(
            this.parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            blockLambdaResultsOrEmpty().map { it.inferTypeForAssignee(context) }
        )
        this is SmlCall -> when (val callable = callableOrNull()) {
            is SmlClass -> ClassType(callable, isNullable = false)
            is SmlCallableType -> {
                val results = callable.resultsOrEmpty()
                when (results.size) {
                    1 -> results.first().inferTypeForDeclaration(context)
                    else -> RecordType(results.map { it.name to it.inferTypeForDeclaration(context) })
                }
            }
            is SmlFunction -> {
                val results = callable.resultsOrEmpty()
                when (results.size) {
                    1 -> results.first().inferTypeForDeclaration(context)
                    else -> RecordType(results.map { it.name to it.inferTypeForDeclaration(context) })
                }
            }
            is SmlBlockLambda -> {
                val results = callable.blockLambdaResultsOrEmpty()
                when (results.size) {
                    1 -> results.first().inferTypeForAssignee(context)
                    else -> RecordType(results.map { it.name to it.inferTypeForAssignee(context) })
                }
            }
            is SmlEnumVariant -> {
                EnumVariantType(callable, isNullable = false)
            }
            is SmlExpressionLambda -> {
                callable.result.inferTypeExpression(context)
            }
            is SmlStep -> {
                val results = callable.resultsOrEmpty()
                when (results.size) {
                    1 -> results.first().inferTypeForDeclaration(context)
                    else -> RecordType(results.map { it.name to it.inferTypeForDeclaration(context) })
                }
            }
            else -> Any(context)
        }
        this is SmlExpressionLambda -> CallableType(
            this.parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            listOf(result.inferTypeExpression(context))
        )
        this is SmlIndexedAccess -> {
            when (val receiverType = this.receiver.inferTypeExpression(context)) {
                is UnresolvedType -> UnresolvedType
                is VariadicType -> receiverType.elementType
                else -> Nothing(context)
            }
        }
        this is SmlInfixOperation -> when (operator) {
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
                            this.rightOperand.inferTypeExpression(context)
                        )
                    )
                } else {
                    leftOperandType
                }
            }
            else -> Nothing(context)
        }
        this is SmlMemberAccess -> {
            val memberType = this.member.inferTypeExpression(context)
            memberType.setIsNullableOnCopy(this.isNullSafe || memberType.isNullable)
        }
        this is SmlParenthesizedExpression -> this.expression.inferTypeExpression(context)
        this is SmlPrefixOperation -> when (operator) {
            "not" -> Boolean(context)
            "-" -> when (this.operand.inferTypeExpression(context)) {
                Int(context) -> Int(context)
                else -> Float(context)
            }
            else -> Nothing(context)
        }
        this is SmlReference -> this.declaration.inferType(context)
        else -> Any(context)
    }
}

private fun SmlAbstractType.inferTypeForType(context: EObject): Type {
    return when {
        this.eIsProxy() -> UnresolvedType
        this is SmlCallableType -> CallableType(
            this.parametersOrEmpty().map { it.inferTypeForDeclaration(context) },
            this.resultsOrEmpty().map { it.inferTypeForDeclaration(context) }
        )
        this is SmlMemberType -> {
            this.member.inferTypeForType(context)
        }
        this is SmlNamedType -> {
            this.declaration.inferTypeForDeclaration(context).setIsNullableOnCopy(this.isNullable)
        }
        this is SmlParenthesizedType -> {
            this.type.inferTypeForType(context)
        }
        this is SmlUnionType -> {
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
                val superClass = candidate.smlClass.superClasses().firstOrNull()
                    ?: return Any(context, candidate.isNullable)
                ClassType(superClass, candidate.isNullable)
            }
            is EnumType -> Any(context, candidate.isNullable)
            is EnumVariantType -> {
                val containingEnum = candidate.smlEnumVariant.containingEnumOrNull()
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
    if (candidate is ClassType && candidate.smlClass.qualifiedNameOrNull() == StdlibClasses.Any) {
        return true
    }

    return otherTypes.all { it.isSubstitutableFor(candidate) }
}

private fun Any(context: EObject, isNullable: Boolean = false) = stdlibType(
    context,
    StdlibClasses.Any,
    isNullable
)

private fun Boolean(context: EObject) = stdlibType(context, StdlibClasses.Boolean)
private fun Float(context: EObject) = stdlibType(context, StdlibClasses.Float)
private fun Int(context: EObject) = stdlibType(context, StdlibClasses.Int)
private fun Nothing(context: EObject, isNullable: Boolean = false) = stdlibType(
    context,
    StdlibClasses.Nothing,
    isNullable
)

private fun String(context: EObject) = stdlibType(context, StdlibClasses.String)

internal fun stdlibType(context: EObject, qualifiedName: QualifiedName, isNullable: Boolean = false): Type {
    return when (val smlClass = context.getStdlibClassOrNull(qualifiedName)) {
        null -> UnresolvedType
        else -> ClassType(smlClass, isNullable)
    }
}
