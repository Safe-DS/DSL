package com.larsreimann.safeds.validation.expressions

import com.larsreimann.safeds.constant.SdsInfixOperationOperator.By
import com.larsreimann.safeds.constant.SdsInfixOperationOperator.Elvis
import com.larsreimann.safeds.safeDS.SdsInfixOperation
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.SdsConstantFloat
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.SdsConstantInt
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.SdsConstantNull
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.toConstantExpressionOrNull
import com.larsreimann.safeds.staticAnalysis.typing.NamedType
import com.larsreimann.safeds.staticAnalysis.typing.type
import com.larsreimann.safeds.stdlibAccess.StdlibClasses
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class InfixOperationChecker : AbstractSafeDSChecker() {

    @Check
    fun dispatchCheckInfixOperation(sdsInfixOperation: SdsInfixOperation) {
        when (sdsInfixOperation.operator) {
            By.operator -> checkByOperator(sdsInfixOperation)
            Elvis.operator -> checkElvisOperator(sdsInfixOperation)
        }
    }

    private fun checkByOperator(sdsInfixOperation: SdsInfixOperation) {
        val leftType = sdsInfixOperation.leftOperand.type()
        if (!(leftType is NamedType && leftType.qualifiedName in setOf(StdlibClasses.Float, StdlibClasses.Int))) {
            return
        }

        val rightValue = sdsInfixOperation.rightOperand.toConstantExpressionOrNull()
        if (rightValue in setOf(SdsConstantFloat(0.0), SdsConstantFloat(-0.0), SdsConstantInt(0))) {
            error(
                "Division by zero.",
                null,
                ErrorCode.DivisionByZero
            )
        }
    }

    private fun checkElvisOperator(sdsInfixOperation: SdsInfixOperation) {
        val leftType = sdsInfixOperation.leftOperand.type()
        if (!(leftType is NamedType && leftType.isNullable)) {
            info(
                "The left operand is never null so the elvis operator is unnecessary (keep left operand).",
                null,
                InfoCode.UnnecessaryElvisOperator
            )
            return
        }

        val leftValue = sdsInfixOperation.leftOperand.toConstantExpressionOrNull()
        val rightValue = sdsInfixOperation.rightOperand.toConstantExpressionOrNull()
        if (leftValue is SdsConstantNull && rightValue is SdsConstantNull) {
            info(
                "Both operands are always null so the elvis operator is unnecessary (replace with null).",
                null,
                InfoCode.UnnecessaryElvisOperator
            )
        } else if (leftValue is SdsConstantNull) {
            info(
                "The left operand is always null so the elvis operator is unnecessary (keep right operand).",
                null,
                InfoCode.UnnecessaryElvisOperator
            )
        } else if (rightValue is SdsConstantNull) {
            info(
                "The right operand is always null so the elvis operator is unnecessary (keep left operand).",
                null,
                InfoCode.UnnecessaryElvisOperator
            )
        }
    }
}
