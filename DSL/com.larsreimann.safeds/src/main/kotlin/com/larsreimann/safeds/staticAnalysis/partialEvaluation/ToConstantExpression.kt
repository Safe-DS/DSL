package com.larsreimann.safeds.staticAnalysis.partialEvaluation

import com.larsreimann.safeds.constant.SdsInfixOperationOperator.And
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.By
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.Elvis
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.Equals
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.GreaterThan
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.GreaterThanOrEquals
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.IdenticalTo
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.LessThan
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.LessThanOrEquals
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.NotEquals
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.NotIdenticalTo
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.Or
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.Plus
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.Times
import com.larsreimann.safeds.constant.SdsPrefixOperationOperator.Not
import com.larsreimann.safeds.constant.operator
import com.larsreimann.safeds.emf.argumentsOrEmpty
import com.larsreimann.safeds.emf.blockLambdaResultsOrEmpty
import com.larsreimann.safeds.emf.closestAncestorOrNull
import com.larsreimann.safeds.emf.isOptional
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.resultsOrEmpty
import com.larsreimann.safeds.safeDS.SdsAbstractAssignee
import com.larsreimann.safeds.safeDS.SdsAbstractExpression
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsBlockLambda
import com.larsreimann.safeds.safeDS.SdsBoolean
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsExpressionLambda
import com.larsreimann.safeds.safeDS.SdsFloat
import com.larsreimann.safeds.safeDS.SdsIndexedAccess
import com.larsreimann.safeds.safeDS.SdsInfixOperation
import com.larsreimann.safeds.safeDS.SdsInt
import com.larsreimann.safeds.safeDS.SdsMemberAccess
import com.larsreimann.safeds.safeDS.SdsNull
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsParenthesizedExpression
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsPrefixOperation
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsString
import com.larsreimann.safeds.safeDS.SdsTemplateString
import com.larsreimann.safeds.safeDS.SdsTemplateStringEnd
import com.larsreimann.safeds.safeDS.SdsTemplateStringInner
import com.larsreimann.safeds.safeDS.SdsTemplateStringStart
import com.larsreimann.safeds.staticAnalysis.callableHasNoSideEffects
import com.larsreimann.safeds.staticAnalysis.indexOrNull
import com.larsreimann.safeds.staticAnalysis.linking.parameterOrNull
import com.larsreimann.safeds.staticAnalysis.linking.uniqueYieldOrNull
import com.larsreimann.safeds.utils.uniqueOrNull
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.Minus as InfixMinus
import com.larsreimann.safeds.constant.SdsPrefixOperationOperator.Minus as PrefixMinus

/**
 * Tries to evaluate this expression. On success a [SdsConstantExpression] is returned, otherwise `null`.
 */
fun SdsAbstractExpression.toConstantExpressionOrNull(): SdsConstantExpression? {
    return toConstantExpressionOrNull(emptyMap())
}

internal fun SdsAbstractExpression.toConstantExpressionOrNull(substitutions: ParameterSubstitutions): SdsConstantExpression? {
    return when (val simplifiedExpression = simplify(substitutions)) {
        is SdsConstantExpression? -> simplifiedExpression
        is SdsIntermediateRecord -> simplifiedExpression.unwrap() as? SdsConstantExpression
        else -> null
    }
}

internal fun SdsAbstractExpression.simplify(substitutions: ParameterSubstitutions): SdsSimplifiedExpression? {
    return when (this) {

        // Base cases
        is SdsBoolean -> SdsConstantBoolean(isTrue)
        is SdsFloat -> SdsConstantFloat(value)
        is SdsInt -> SdsConstantInt(value)
        is SdsNull -> SdsConstantNull
        is SdsString -> SdsConstantString(value)
        is SdsTemplateStringStart -> SdsConstantString(value)
        is SdsTemplateStringInner -> SdsConstantString(value)
        is SdsTemplateStringEnd -> SdsConstantString(value)
        is SdsBlockLambda -> simplifyBlockLambda(substitutions)
        is SdsExpressionLambda -> simplifyExpressionLambda(substitutions)

        // Simple recursive cases
        is SdsArgument -> value.simplify(substitutions)
        is SdsInfixOperation -> simplifyInfixOp(substitutions)
        is SdsParenthesizedExpression -> expression.simplify(substitutions)
        is SdsPrefixOperation -> simplifyPrefixOp(substitutions)
        is SdsTemplateString -> simplifyTemplateString(substitutions)

        // Complex recursive cases
        is SdsCall -> simplifyCall(substitutions)
        is SdsIndexedAccess -> simplifyIndexedAccess(substitutions)
        is SdsMemberAccess -> simplifyMemberAccess(substitutions)
        is SdsReference -> simplifyReference(substitutions)

        // Warn if case is missing
        else -> throw IllegalArgumentException("Missing case to handle $this.")
    }
}

private fun SdsBlockLambda.simplifyBlockLambda(substitutions: ParameterSubstitutions): SdsIntermediateBlockLambda? {
    return when {
        callableHasNoSideEffects(resultIfUnknown = true) -> SdsIntermediateBlockLambda(
            parameters = parametersOrEmpty(),
            results = blockLambdaResultsOrEmpty(),
            substitutionsOnCreation = substitutions
        )
        else -> null
    }
}

private fun SdsExpressionLambda.simplifyExpressionLambda(
    substitutions: ParameterSubstitutions
): SdsIntermediateExpressionLambda? {
    return when {
        callableHasNoSideEffects(resultIfUnknown = true) -> SdsIntermediateExpressionLambda(
            parameters = parametersOrEmpty(),
            result = result,
            substitutionsOnCreation = substitutions
        )
        else -> null
    }
}

private fun SdsInfixOperation.simplifyInfixOp(substitutions: ParameterSubstitutions): SdsConstantExpression? {

    // By design none of the operators are short-circuited
    val constantLeft = leftOperand.toConstantExpressionOrNull(substitutions) ?: return null
    val constantRight = rightOperand.toConstantExpressionOrNull(substitutions) ?: return null

    return when (operator()) {
        Or -> simplifyLogicalOp(constantLeft, Boolean::or, constantRight)
        And -> simplifyLogicalOp(constantLeft, Boolean::and, constantRight)
        Equals -> SdsConstantBoolean(constantLeft == constantRight)
        NotEquals -> SdsConstantBoolean(constantLeft != constantRight)
        IdenticalTo -> SdsConstantBoolean(constantLeft == constantRight)
        NotIdenticalTo -> SdsConstantBoolean(constantLeft != constantRight)
        LessThan -> simplifyComparisonOp(
            constantLeft,
            { a, b -> a < b },
            { a, b -> a < b },
            constantRight
        )
        LessThanOrEquals -> simplifyComparisonOp(
            constantLeft,
            { a, b -> a <= b },
            { a, b -> a <= b },
            constantRight
        )
        GreaterThanOrEquals -> simplifyComparisonOp(
            constantLeft,
            { a, b -> a >= b },
            { a, b -> a >= b },
            constantRight
        )
        GreaterThan -> simplifyComparisonOp(
            constantLeft,
            { a, b -> a > b },
            { a, b -> a > b },
            constantRight
        )
        Plus -> simplifyArithmeticOp(
            constantLeft,
            { a, b -> a + b },
            { a, b -> a + b },
            constantRight
        )
        InfixMinus -> simplifyArithmeticOp(
            constantLeft,
            { a, b -> a - b },
            { a, b -> a - b },
            constantRight
        )
        Times -> simplifyArithmeticOp(
            constantLeft,
            { a, b -> a * b },
            { a, b -> a * b },
            constantRight
        )
        By -> {
            if (constantRight == SdsConstantFloat(0.0) || constantRight == SdsConstantInt(0)) {
                return null
            }

            simplifyArithmeticOp(
                constantLeft,
                { a, b -> a / b },
                { a, b -> a / b },
                constantRight
            )
        }
        Elvis -> when (constantLeft) {
            SdsConstantNull -> constantRight
            else -> constantLeft
        }
    }
}

private fun simplifyLogicalOp(
    leftOperand: SdsConstantExpression,
    operation: (Boolean, Boolean) -> Boolean,
    rightOperand: SdsConstantExpression,
): SdsConstantExpression? {

    return when {
        leftOperand is SdsConstantBoolean && rightOperand is SdsConstantBoolean -> {
            SdsConstantBoolean(operation(leftOperand.value, rightOperand.value))
        }
        else -> null
    }
}

private fun simplifyComparisonOp(
    leftOperand: SdsConstantExpression,
    doubleOperation: (Double, Double) -> Boolean,
    intOperation: (Int, Int) -> Boolean,
    rightOperand: SdsConstantExpression,
): SdsConstantExpression? {

    return when {
        leftOperand is SdsConstantInt && rightOperand is SdsConstantInt -> {
            SdsConstantBoolean(intOperation(leftOperand.value, rightOperand.value))
        }
        leftOperand is SdsConstantNumber && rightOperand is SdsConstantNumber -> {
            SdsConstantBoolean(doubleOperation(leftOperand.value.toDouble(), rightOperand.value.toDouble()))
        }
        else -> null
    }
}

private fun simplifyArithmeticOp(
    leftOperand: SdsConstantExpression,
    doubleOperation: (Double, Double) -> Double,
    intOperation: (Int, Int) -> Int,
    rightOperand: SdsConstantExpression,
): SdsConstantExpression? {

    return when {
        leftOperand is SdsConstantInt && rightOperand is SdsConstantInt -> {
            SdsConstantInt(intOperation(leftOperand.value, rightOperand.value))
        }
        leftOperand is SdsConstantNumber && rightOperand is SdsConstantNumber -> {
            SdsConstantFloat(doubleOperation(leftOperand.value.toDouble(), rightOperand.value.toDouble()))
        }
        else -> null
    }
}

private fun SdsPrefixOperation.simplifyPrefixOp(substitutions: ParameterSubstitutions): SdsConstantExpression? {
    val constantOperand = operand.toConstantExpressionOrNull(substitutions) ?: return null

    return when (operator()) {
        Not -> when (constantOperand) {
            is SdsConstantBoolean -> SdsConstantBoolean(!constantOperand.value)
            else -> null
        }
        PrefixMinus -> when (constantOperand) {
            is SdsConstantFloat -> SdsConstantFloat(-constantOperand.value)
            is SdsConstantInt -> SdsConstantInt(-constantOperand.value)
            else -> null
        }
    }
}

private fun SdsTemplateString.simplifyTemplateString(substitutions: ParameterSubstitutions): SdsConstantExpression? {
    val constExpressions = expressions.map {
        it.toConstantExpressionOrNull(substitutions) ?: return null
    }

    return SdsConstantString(constExpressions.joinToString(""))
}

private fun SdsCall.simplifyCall(substitutions: ParameterSubstitutions): SdsSimplifiedExpression? {
    val simpleReceiver = simplifyReceiver(substitutions) ?: return null
    val newSubstitutions = buildNewSubstitutions(simpleReceiver, substitutions)

    return when (simpleReceiver) {
        is SdsIntermediateBlockLambda -> {
            SdsIntermediateRecord(
                simpleReceiver.results.map {
                    it to it.simplifyAssignee(newSubstitutions)
                }
            )
        }
        is SdsIntermediateExpressionLambda -> simpleReceiver.result.simplify(newSubstitutions)
        is SdsIntermediateStep -> {
            SdsIntermediateRecord(
                simpleReceiver.results.map {
                    it to it.uniqueYieldOrNull()?.simplifyAssignee(newSubstitutions)
                }
            )
        }
    }
}

private fun SdsCall.simplifyReceiver(substitutions: ParameterSubstitutions): SdsIntermediateCallable? {
    return when (val simpleReceiver = receiver.simplify(substitutions)) {
        is SdsIntermediateRecord -> simpleReceiver.unwrap() as? SdsIntermediateCallable
        is SdsIntermediateCallable -> simpleReceiver
        else -> return null
    }
}

private fun SdsCall.buildNewSubstitutions(
    simpleReceiver: SdsIntermediateCallable,
    oldSubstitutions: ParameterSubstitutions
): ParameterSubstitutions {

    val substitutionsOnCreation = when (simpleReceiver) {
        is SdsIntermediateBlockLambda -> simpleReceiver.substitutionsOnCreation
        is SdsIntermediateExpressionLambda -> simpleReceiver.substitutionsOnCreation
        else -> emptyMap()
    }

    val substitutionsOnCall = argumentsOrEmpty()
        .groupBy { it.parameterOrNull() }
        .mapValues { (parameter, arguments) ->
            when {
                parameter == null -> null
                parameter.isVariadic -> SdsIntermediateVariadicArguments(
                    arguments.map { it.simplify(oldSubstitutions) }
                )
                else -> arguments.uniqueOrNull()?.simplify(oldSubstitutions)
            }
        }

    return buildMap {
        putAll(substitutionsOnCreation)
        substitutionsOnCall.entries.forEach { (parameter, argument) ->
            if (parameter != null) {
                put(parameter, argument)
            }
        }
    }
}

private fun SdsIndexedAccess.simplifyIndexedAccess(substitutions: ParameterSubstitutions): SdsSimplifiedExpression? {
    val simpleReceiver = receiver.simplify(substitutions) as? SdsIntermediateVariadicArguments ?: return null
    val simpleIndex = index.simplify(substitutions) as? SdsConstantInt ?: return null

    return simpleReceiver.getArgumentByIndexOrNull(simpleIndex.value)
}

private fun SdsMemberAccess.simplifyMemberAccess(substitutions: ParameterSubstitutions): SdsSimplifiedExpression? {
    if (member.declaration is SdsEnumVariant) {
        return member.simplifyReference(substitutions)
    }

    return when (val simpleReceiver = receiver.simplify(substitutions)) {
        SdsConstantNull -> when {
            isNullSafe -> SdsConstantNull
            else -> null
        }
        is SdsIntermediateRecord -> simpleReceiver.getSubstitutionByReferenceOrNull(member)
        else -> null
    }
}

private fun SdsReference.simplifyReference(substitutions: ParameterSubstitutions): SdsSimplifiedExpression? {
    return when (val declaration = this.declaration) {
        is SdsEnumVariant -> when {
            declaration.parametersOrEmpty().isEmpty() -> SdsConstantEnumVariant(declaration)
            else -> null
        }
        is SdsPlaceholder -> declaration.simplifyAssignee(substitutions)
        is SdsParameter -> declaration.simplifyParameter(substitutions)
        is SdsStep -> declaration.simplifyStep()
        else -> null
    }
}

private fun SdsAbstractAssignee.simplifyAssignee(substitutions: ParameterSubstitutions): SdsSimplifiedExpression? {
    val simpleFullAssignedExpression = closestAncestorOrNull<SdsAssignment>()
        ?.expression
        ?.simplify(substitutions)
        ?: return null

    return when (simpleFullAssignedExpression) {
        is SdsIntermediateRecord -> simpleFullAssignedExpression.getSubstitutionByIndexOrNull(indexOrNull())
        else -> when {
            indexOrNull() == 0 -> simpleFullAssignedExpression
            else -> null
        }
    }
}

private fun SdsParameter.simplifyParameter(substitutions: ParameterSubstitutions): SdsSimplifiedExpression? {
    return when {
        this in substitutions -> substitutions[this]
        isOptional() -> defaultValue?.simplify(substitutions)
        else -> null
    }
}

private fun SdsStep.simplifyStep(): SdsIntermediateStep? {
    return when {
        callableHasNoSideEffects(resultIfUnknown = true) -> SdsIntermediateStep(
            parameters = parametersOrEmpty(),
            results = resultsOrEmpty()
        )
        else -> null
    }
}
