package de.unibonn.simpleml.validation.expressions

import de.unibonn.simpleml.emf.isNamed
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import de.unibonn.simpleml.simpleML.SmlArgument
import de.unibonn.simpleml.staticAnalysis.linking.parameterOrNull
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.toConstantExpressionOrNull
import de.unibonn.simpleml.stdlibAccess.isConstant
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class ArgumentChecker : AbstractSimpleMLChecker() {

    @Check(CheckType.NORMAL)
    fun argumentMustBeConstant(smlArgument: SmlArgument) {
        val parameterIsConstant = smlArgument.parameterOrNull()?.isConstant() ?: false

        if (parameterIsConstant && smlArgument.value?.toConstantExpressionOrNull() == null) {
            error(
                "Arguments assigned to constant parameters must be constant.",
                Literals.SML_ARGUMENT__VALUE,
                ErrorCode.MustBeConstant
            )
        }
    }

    @Check
    fun variadicParameterMustNotBeAssignedByName(smlArgument: SmlArgument) {
        if (smlArgument.isNamed() && (smlArgument.parameterOrNull()?.isVariadic == true)) {
            error(
                "A variadic parameter must not be assigned by name.",
                Literals.SML_ARGUMENT__PARAMETER,
                ErrorCode.VariadicParameterMustNotBeAssignedByName
            )
        }
    }
}
