package com.larsreimann.safeds.validation.typeChecking

import com.larsreimann.safeds.constant.SdsPrefixOperationOperator
import com.larsreimann.safeds.constant.operator
import com.larsreimann.safeds.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsPrefixOperation
import com.larsreimann.safeds.staticAnalysis.typing.ClassType
import com.larsreimann.safeds.staticAnalysis.typing.UnresolvedType
import com.larsreimann.safeds.staticAnalysis.typing.type
import com.larsreimann.safeds.stdlibAccess.StdlibClasses
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class PrefixOperationTypeChecker : AbstractSafeDSChecker() {

    @Check(CheckType.NORMAL)
    fun operand(smlPrefixOperation: SdsPrefixOperation) {
        val operandType = smlPrefixOperation.operand.type()
        if (operandType is UnresolvedType) {
            return // Scoping error already shown
        }

        when (smlPrefixOperation.operator()) {
            SdsPrefixOperationOperator.Not -> {
                val hasWrongType = operandType !is ClassType ||
                    operandType.isNullable ||
                    operandType.smlClass.qualifiedNameOrNull() != StdlibClasses.Boolean

                if (hasWrongType) {
                    error(
                        "The operand of a logical negation must be an instance of the class 'Boolean'.",
                        Literals.SDS_PREFIX_OPERATION__OPERAND,
                        ErrorCode.WrongType
                    )
                }
            }
            SdsPrefixOperationOperator.Minus -> {
                val hasWrongType = operandType !is ClassType ||
                    operandType.isNullable ||
                    operandType.smlClass.qualifiedNameOrNull() !in setOf(StdlibClasses.Float, StdlibClasses.Int)

                if (hasWrongType) {
                    error(
                        "The operand of an arithmetic negation must be an instance of the class 'Float' or the class 'Int'.",
                        Literals.SDS_PREFIX_OPERATION__OPERAND,
                        ErrorCode.WrongType
                    )
                }
            }
        }
    }
}
