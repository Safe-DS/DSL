package com.larsreimann.safeds.validation.typeChecking

import de.unibonn.simpleml.constant.SmlInfixOperationOperator
import de.unibonn.simpleml.constant.operator
import de.unibonn.simpleml.naming.qualifiedNameOrNull
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAbstractExpression
import com.larsreimann.safeds.safeDS.SdsInfixOperation
import de.unibonn.simpleml.staticAnalysis.typing.ClassType
import de.unibonn.simpleml.staticAnalysis.typing.UnresolvedType
import de.unibonn.simpleml.staticAnalysis.typing.type
import de.unibonn.simpleml.stdlibAccess.StdlibClasses
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.emf.ecore.EReference
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class InfixOperationTypeChecker : AbstractSimpleMLChecker() {

    @Check(CheckType.NORMAL)
    fun leftOperand(smlInfixOperation: SmlInfixOperation) {
        checkOperand(smlInfixOperation, Literals.SML_INFIX_OPERATION__LEFT_OPERAND)
    }

    @Check(CheckType.NORMAL)
    fun rightOperand(smlInfixOperation: SmlInfixOperation) {
        checkOperand(smlInfixOperation, Literals.SML_INFIX_OPERATION__RIGHT_OPERAND)
    }

    private fun checkOperand(smlInfixOperation: SmlInfixOperation, feature: EReference) {
        val operandType = operand(smlInfixOperation, feature).type()
        if (operandType is UnresolvedType) {
            return // Scoping error already shown
        }

        when (smlInfixOperation.operator()) {
            SmlInfixOperationOperator.Or,
            SmlInfixOperationOperator.And -> {
                val hasWrongType = operandType !is ClassType ||
                    operandType.isNullable ||
                    operandType.smlClass.qualifiedNameOrNull() != StdlibClasses.Boolean

                if (hasWrongType) {
                    error(
                        "The ${operandPositionToString(feature)} operand of a logical infix operation must be an instance of the class 'Boolean'.",
                        feature,
                        ErrorCode.WrongType
                    )
                }
            }

            SmlInfixOperationOperator.Plus,
            SmlInfixOperationOperator.Minus,
            SmlInfixOperationOperator.Times,
            SmlInfixOperationOperator.By -> {
                val hasWrongType = operandType !is ClassType ||
                    operandType.isNullable ||
                    operandType.smlClass.qualifiedNameOrNull() !in setOf(StdlibClasses.Float, StdlibClasses.Int)

                if (hasWrongType) {
                    error(
                        "The ${operandPositionToString(feature)} operand of an arithmetic infix operation must be an instance of the class 'Float' or the class 'Int'.",
                        feature,
                        ErrorCode.WrongType
                    )
                }
            }

            SmlInfixOperationOperator.LessThan,
            SmlInfixOperationOperator.LessThanOrEquals,
            SmlInfixOperationOperator.GreaterThanOrEquals,
            SmlInfixOperationOperator.GreaterThan -> {
                val hasWrongType = operandType !is ClassType ||
                    operandType.isNullable ||
                    operandType.smlClass.qualifiedNameOrNull() !in setOf(StdlibClasses.Float, StdlibClasses.Int)

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

    private fun operand(smlInfixOperation: SmlInfixOperation, feature: EReference): SmlAbstractExpression {
        return when (feature) {
            Literals.SML_INFIX_OPERATION__LEFT_OPERAND -> smlInfixOperation.leftOperand
            Literals.SML_INFIX_OPERATION__RIGHT_OPERAND -> smlInfixOperation.rightOperand
            else -> throw IllegalArgumentException("Cannot handle feature '$feature'.")
        }
    }

    private fun operandPositionToString(feature: EReference): String {
        return when (feature) {
            Literals.SML_INFIX_OPERATION__LEFT_OPERAND -> "left"
            Literals.SML_INFIX_OPERATION__RIGHT_OPERAND -> "right"
            else -> throw IllegalArgumentException("Cannot handle feature '$feature'.")
        }
    }
}
