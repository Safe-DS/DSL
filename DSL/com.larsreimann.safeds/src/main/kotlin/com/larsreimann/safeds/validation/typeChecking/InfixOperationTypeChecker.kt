package com.larsreimann.safeds.validation.typeChecking

import com.larsreimann.safeds.constant.SdsInfixOperationOperator
import com.larsreimann.safeds.constant.operator
import com.larsreimann.safeds.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAbstractExpression
import com.larsreimann.safeds.safeDS.SdsInfixOperation
import com.larsreimann.safeds.staticAnalysis.typing.ClassType
import com.larsreimann.safeds.staticAnalysis.typing.UnresolvedType
import com.larsreimann.safeds.staticAnalysis.typing.type
import com.larsreimann.safeds.stdlibAccess.StdlibClasses
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.emf.ecore.EReference
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class InfixOperationTypeChecker : AbstractSafeDSChecker() {

    @Check(CheckType.NORMAL)
    fun leftOperand(sdsInfixOperation: SdsInfixOperation) {
        checkOperand(sdsInfixOperation, Literals.SDS_INFIX_OPERATION__LEFT_OPERAND)
    }

    @Check(CheckType.NORMAL)
    fun rightOperand(sdsInfixOperation: SdsInfixOperation) {
        checkOperand(sdsInfixOperation, Literals.SDS_INFIX_OPERATION__RIGHT_OPERAND)
    }

    private fun checkOperand(sdsInfixOperation: SdsInfixOperation, feature: EReference) {
        val operandType = operand(sdsInfixOperation, feature).type()
        if (operandType is UnresolvedType) {
            return // Scoping error already shown
        }

        when (sdsInfixOperation.operator()) {
            SdsInfixOperationOperator.Or,
            SdsInfixOperationOperator.And -> {
                val hasWrongType = operandType !is ClassType ||
                    operandType.isNullable ||
                    operandType.sdsClass.qualifiedNameOrNull() != StdlibClasses.Boolean

                if (hasWrongType) {
                    error(
                        "The ${operandPositionToString(feature)} operand of a logical infix operation must be an instance of the class 'Boolean'.",
                        feature,
                        ErrorCode.WrongType
                    )
                }
            }

            SdsInfixOperationOperator.Plus,
            SdsInfixOperationOperator.Minus,
            SdsInfixOperationOperator.Times,
            SdsInfixOperationOperator.By -> {
                val hasWrongType = operandType !is ClassType ||
                    operandType.isNullable ||
                    operandType.sdsClass.qualifiedNameOrNull() !in setOf(StdlibClasses.Float, StdlibClasses.Int)

                if (hasWrongType) {
                    error(
                        "The ${operandPositionToString(feature)} operand of an arithmetic infix operation must be an instance of the class 'Float' or the class 'Int'.",
                        feature,
                        ErrorCode.WrongType
                    )
                }
            }

            SdsInfixOperationOperator.LessThan,
            SdsInfixOperationOperator.LessThanOrEquals,
            SdsInfixOperationOperator.GreaterThanOrEquals,
            SdsInfixOperationOperator.GreaterThan -> {
                val hasWrongType = operandType !is ClassType ||
                    operandType.isNullable ||
                    operandType.sdsClass.qualifiedNameOrNull() !in setOf(StdlibClasses.Float, StdlibClasses.Int)

                if (hasWrongType) {
                    error(
                        "The ${operandPositionToString(feature)} operand of a comparison must be an instance of the class 'Float' or the class 'Int'.",
                        feature,
                        ErrorCode.WrongType
                    )
                }
            }

            else -> {}
        }
    }

    private fun operand(sdsInfixOperation: SdsInfixOperation, feature: EReference): SdsAbstractExpression {
        return when (feature) {
            Literals.SDS_INFIX_OPERATION__LEFT_OPERAND -> sdsInfixOperation.leftOperand
            Literals.SDS_INFIX_OPERATION__RIGHT_OPERAND -> sdsInfixOperation.rightOperand
            else -> throw IllegalArgumentException("Cannot handle feature '$feature'.")
        }
    }

    private fun operandPositionToString(feature: EReference): String {
        return when (feature) {
            Literals.SDS_INFIX_OPERATION__LEFT_OPERAND -> "left"
            Literals.SDS_INFIX_OPERATION__RIGHT_OPERAND -> "right"
            else -> throw IllegalArgumentException("Cannot handle feature '$feature'.")
        }
    }
}
