package com.larsreimann.safeds.validation.expressions

import com.larsreimann.safeds.emf.isNamed
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.staticAnalysis.linking.parameterOrNull
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.toConstantExpressionOrNull
import com.larsreimann.safeds.stdlibAccess.isConstant
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class ArgumentChecker : AbstractSafeDSChecker() {

    @Check(CheckType.NORMAL)
    fun argumentMustBeConstant(smlArgument: SdsArgument) {
        val parameterIsConstant = smlArgument.parameterOrNull()?.isConstant() ?: false

        if (parameterIsConstant && smlArgument.value?.toConstantExpressionOrNull() == null) {
            error(
                "Arguments assigned to constant parameters must be constant.",
                Literals.SDS_ARGUMENT__VALUE,
                ErrorCode.MustBeConstant
            )
        }
    }

    @Check
    fun variadicParameterMustNotBeAssignedByName(smlArgument: SdsArgument) {
        if (smlArgument.isNamed() && (smlArgument.parameterOrNull()?.isVariadic == true)) {
            error(
                "A variadic parameter must not be assigned by name.",
                Literals.SDS_ARGUMENT__PARAMETER,
                ErrorCode.VariadicParameterMustNotBeAssignedByName
            )
        }
    }
}
