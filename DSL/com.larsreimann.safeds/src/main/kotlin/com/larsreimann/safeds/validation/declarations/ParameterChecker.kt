package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.emf.closestAncestorOrNull
import com.larsreimann.safeds.emf.isOptional
import com.larsreimann.safeds.emf.isRequired
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAbstractLambda
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsParameterList
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.toConstantExpressionOrNull
import com.larsreimann.safeds.stdlibAccess.StdlibAnnotations
import com.larsreimann.safeds.stdlibAccess.annotationCallsOrEmpty
import com.larsreimann.safeds.stdlibAccess.isExpert
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class ParameterChecker : AbstractSafeDSChecker() {

    @Check
    fun type(sdsParameter: SdsParameter) {
        val parameterList = sdsParameter.closestAncestorOrNull<SdsParameterList>() ?: return
        if (sdsParameter.type == null && parameterList.eContainer() !is SdsAbstractLambda) {
            error(
                "A parameter must have a type.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                ErrorCode.ParameterMustHaveType
            )
        }
    }

    @Check(CheckType.NORMAL)
    fun defaultValueMustBeConstant(sdsParameter: SdsParameter) {
        val defaultValue = sdsParameter.defaultValue ?: return
        if (defaultValue.toConstantExpressionOrNull() == null) {
            error(
                "Default values of parameters must be constant.",
                Literals.SDS_PARAMETER__DEFAULT_VALUE,
                ErrorCode.MustBeConstant
            )
        }
    }

    @Check
    fun variadicParametersMustHaveNoDefaultValue(sdsParameter: SdsParameter) {
        if (sdsParameter.isVariadic && sdsParameter.isOptional()) {
            error(
                "Variadic parameters must not have default values.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                ErrorCode.VariadicParametersMustNotHaveDefaultValue
            )
        }
    }

    @Check
    fun expertMustBeOptional(sdsParameter: SdsParameter) {
        if (sdsParameter.isRequired() && sdsParameter.isExpert()) {
            sdsParameter.annotationCallsOrEmpty(StdlibAnnotations.Expert).forEach {
                error(
                    "An expert parameter must be optional.",
                    it,
                    null,
                    ErrorCode.MustBeConstant
                )
            }
        }
    }
}
