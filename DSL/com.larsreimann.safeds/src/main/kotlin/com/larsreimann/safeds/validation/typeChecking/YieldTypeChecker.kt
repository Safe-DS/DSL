package com.larsreimann.safeds.validation.typeChecking

import com.larsreimann.safeds.safeDS.SdsYield
import de.unibonn.simpleml.staticAnalysis.assignedOrNull
import de.unibonn.simpleml.staticAnalysis.typing.UnresolvedType
import de.unibonn.simpleml.staticAnalysis.typing.isSubstitutableFor
import de.unibonn.simpleml.staticAnalysis.typing.type
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class YieldTypeChecker : AbstractSimpleMLChecker() {

    @Check(CheckType.NORMAL)
    fun value(smlYield: SmlYield) {
        val yieldedValue = smlYield.assignedOrNull() ?: return
        val yieldedValueType = yieldedValue.type()
        if (yieldedValueType is UnresolvedType) {
            return // Scoping error already shown
        }

        val resultType = (smlYield.result ?: return).type()

        if (!yieldedValueType.isSubstitutableFor(resultType)) {
            var yieldedValueTypeString = yieldedValueType.toSimpleString()
            var resultTypeString = resultType.toSimpleString()

            if (yieldedValueTypeString == resultTypeString) {
                yieldedValueTypeString = yieldedValueType.toString()
                resultTypeString = resultType.toString()
            }

            error(
                "A value of type '$yieldedValueTypeString' cannot be assigned to a result of type '$resultTypeString'.",
                yieldedValue,
                null,
                ErrorCode.WrongType
            )
        }
    }
}
