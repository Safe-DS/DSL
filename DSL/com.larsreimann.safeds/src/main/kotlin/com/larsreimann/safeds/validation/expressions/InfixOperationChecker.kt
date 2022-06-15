package com.larsreimann.safeds.validation.expressions

import de.unibonn.simpleml.constant.SmlInfixOperationOperator.By
import de.unibonn.simpleml.constant.SmlInfixOperationOperator.Elvis
import com.larsreimann.safeds.safeDS.SdsInfixOperation
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.SmlConstantFloat
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.SmlConstantInt
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.SmlConstantNull
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.toConstantExpressionOrNull
import de.unibonn.simpleml.staticAnalysis.typing.NamedType
import de.unibonn.simpleml.staticAnalysis.typing.type
import de.unibonn.simpleml.stdlibAccess.StdlibClasses
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import de.unibonn.simpleml.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class InfixOperationChecker : AbstractSimpleMLChecker() {

    @Check
    fun dispatchCheckInfixOperation(smlInfixOperation: SmlInfixOperation) {
        when (smlInfixOperation.operator) {
            By.operator -> checkByOperator(smlInfixOperation)
            Elvis.operator -> checkElvisOperator(smlInfixOperation)
        }
    }

    private fun checkByOperator(smlInfixOperation: SmlInfixOperation) {
        val leftType = smlInfixOperation.leftOperand.type()
        if (!(leftType is NamedType && leftType.qualifiedName in setOf(StdlibClasses.Float, StdlibClasses.Int))) {
            return
        }

        val rightValue = smlInfixOperation.rightOperand.toConstantExpressionOrNull()
        if (rightValue in setOf(SmlConstantFloat(0.0), SmlConstantFloat(-0.0), SmlConstantInt(0))) {
            error(
                "Division by zero.",
                null,
                ErrorCode.DivisionByZero
            )
        }
    }

    private fun checkElvisOperator(smlInfixOperation: SmlInfixOperation) {
        val leftType = smlInfixOperation.leftOperand.type()
        if (!(leftType is NamedType && leftType.isNullable)) {
            info(
                "The left operand is never null so the elvis operator is unnecessary (keep left operand).",
                null,
                InfoCode.UnnecessaryElvisOperator
            )
            return
        }

        val leftValue = smlInfixOperation.leftOperand.toConstantExpressionOrNull()
        val rightValue = smlInfixOperation.rightOperand.toConstantExpressionOrNull()
        if (leftValue is SmlConstantNull && rightValue is SmlConstantNull) {
            info(
                "Both operands are always null so the elvis operator is unnecessary (replace with null).",
                null,
                InfoCode.UnnecessaryElvisOperator
            )
        } else if (leftValue is SmlConstantNull) {
            info(
                "The left operand is always null so the elvis operator is unnecessary (keep right operand).",
                null,
                InfoCode.UnnecessaryElvisOperator
            )
        } else if (rightValue is SmlConstantNull) {
            info(
                "The right operand is always null so the elvis operator is unnecessary (keep left operand).",
                null,
                InfoCode.UnnecessaryElvisOperator
            )
        }
    }
}
