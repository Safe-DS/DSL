package com.larsreimann.safeds.validation.typeChecking

import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.staticAnalysis.typing.UnresolvedType
import com.larsreimann.safeds.staticAnalysis.typing.isSubstitutableFor
import com.larsreimann.safeds.staticAnalysis.typing.type
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class DefaultValueTypeChecker : AbstractSafeDSChecker() {

    @Check(CheckType.NORMAL)
    fun defaultValue(smlParameter: SdsParameter) {
        val defaultValue = smlParameter.defaultValue ?: return
        val defaultValueType = defaultValue.type()
        if (defaultValueType is UnresolvedType) {
            return // Scoping error already shown
        }

        val parameterType = smlParameter.type()

        if (!defaultValueType.isSubstitutableFor(parameterType)) {
            var defaultValueTypeString = defaultValueType.toSimpleString()
            var parameterTypeString = parameterType.toSimpleString()

            if (defaultValueTypeString == parameterTypeString) {
                defaultValueTypeString = defaultValueType.toString()
                parameterTypeString = parameterType.toString()
            }

            error(
                "A default value of type '$defaultValueTypeString' cannot be assigned to a parameter of type '$parameterTypeString'.",
                Literals.SDS_PARAMETER__DEFAULT_VALUE,
                ErrorCode.WrongType
            )
        }
    }
}
