package com.larsreimann.safeds.validation.typeChecking

import de.unibonn.simpleml.constant.SmlPrefixOperationOperator
import de.unibonn.simpleml.constant.operator
import de.unibonn.simpleml.naming.qualifiedNameOrNull
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import com.larsreimann.safeds.safeDS.SdsPrefixOperation
import de.unibonn.simpleml.staticAnalysis.typing.ClassType
import de.unibonn.simpleml.staticAnalysis.typing.UnresolvedType
import de.unibonn.simpleml.staticAnalysis.typing.type
import de.unibonn.simpleml.stdlibAccess.StdlibClasses
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class PrefixOperationTypeChecker : AbstractSimpleMLChecker() {

    @Check(CheckType.NORMAL)
    fun operand(smlPrefixOperation: SmlPrefixOperation) {
        val operandType = smlPrefixOperation.operand.type()
        if (operandType is UnresolvedType) {
            return // Scoping error already shown
        }

        when (smlPrefixOperation.operator()) {
            SmlPrefixOperationOperator.Not -> {
                val hasWrongType = operandType !is ClassType ||
                    operandType.isNullable ||
                    operandType.smlClass.qualifiedNameOrNull() != StdlibClasses.Boolean

                if (hasWrongType) {
                    error(
                        "The operand of a logical negation must be an instance of the class 'Boolean'.",
                        Literals.SML_PREFIX_OPERATION__OPERAND,
                        ErrorCode.WrongType
                    )
                }
            }
            SmlPrefixOperationOperator.Minus -> {
                val hasWrongType = operandType !is ClassType ||
                    operandType.isNullable ||
                    operandType.smlClass.qualifiedNameOrNull() !in setOf(StdlibClasses.Float, StdlibClasses.Int)

                if (hasWrongType) {
                    error(
                        "The operand of an arithmetic negation must be an instance of the class 'Float' or the class 'Int'.",
                        Literals.SML_PREFIX_OPERATION__OPERAND,
                        ErrorCode.WrongType
                    )
                }
            }
        }
    }
}
