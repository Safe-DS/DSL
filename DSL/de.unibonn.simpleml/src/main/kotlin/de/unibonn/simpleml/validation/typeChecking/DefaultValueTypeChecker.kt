package de.unibonn.simpleml.validation.typeChecking

import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.staticAnalysis.typing.UnresolvedType
import de.unibonn.simpleml.staticAnalysis.typing.isSubstitutableFor
import de.unibonn.simpleml.staticAnalysis.typing.type
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class DefaultValueTypeChecker : AbstractSimpleMLChecker() {

    @Check(CheckType.NORMAL)
    fun defaultValue(smlParameter: SmlParameter) {
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
                Literals.SML_PARAMETER__DEFAULT_VALUE,
                ErrorCode.WrongType
            )
        }
    }
}
