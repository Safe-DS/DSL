package com.larsreimann.safeds.validation.typeChecking

import com.larsreimann.safeds.safeDS.SdsYield
import com.larsreimann.safeds.staticAnalysis.assignedOrNull
import com.larsreimann.safeds.staticAnalysis.typing.UnresolvedType
import com.larsreimann.safeds.staticAnalysis.typing.isSubstitutableFor
import com.larsreimann.safeds.staticAnalysis.typing.type
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class YieldTypeChecker : AbstractSafeDSChecker() {

    @Check(CheckType.NORMAL)
    fun value(sdsYield: SdsYield) {
        val yieldedValue = sdsYield.assignedOrNull() ?: return
        val yieldedValueType = yieldedValue.type()
        if (yieldedValueType is UnresolvedType) {
            return // Scoping error already shown
        }

        val resultType = (sdsYield.result ?: return).type()

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
