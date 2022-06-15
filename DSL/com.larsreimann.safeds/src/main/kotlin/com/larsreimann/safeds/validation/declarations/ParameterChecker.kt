package com.larsreimann.safeds.validation.declarations

import de.unibonn.simpleml.emf.closestAncestorOrNull
import de.unibonn.simpleml.emf.isOptional
import de.unibonn.simpleml.emf.isRequired
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAbstractLambda
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsParameterList
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.toConstantExpressionOrNull
import de.unibonn.simpleml.stdlibAccess.StdlibAnnotations
import de.unibonn.simpleml.stdlibAccess.annotationCallsOrEmpty
import de.unibonn.simpleml.stdlibAccess.isExpert
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class ParameterChecker : AbstractSimpleMLChecker() {

    @Check
    fun type(smlParameter: SmlParameter) {
        val parameterList = smlParameter.closestAncestorOrNull<SmlParameterList>() ?: return
        if (smlParameter.type == null && parameterList.eContainer() !is SmlAbstractLambda) {
            error(
                "A parameter must have a type.",
                Literals.SML_ABSTRACT_DECLARATION__NAME,
                ErrorCode.ParameterMustHaveType
            )
        }
    }

    @Check(CheckType.NORMAL)
    fun defaultValueMustBeConstant(smlParameter: SmlParameter) {
        val defaultValue = smlParameter.defaultValue ?: return
        if (defaultValue.toConstantExpressionOrNull() == null) {
            error(
                "Default values of parameters must be constant.",
                Literals.SML_PARAMETER__DEFAULT_VALUE,
                ErrorCode.MustBeConstant
            )
        }
    }

    @Check
    fun variadicParametersMustHaveNoDefaultValue(smlParameter: SmlParameter) {
        if (smlParameter.isVariadic && smlParameter.isOptional()) {
            error(
                "Variadic parameters must not have default values.",
                Literals.SML_ABSTRACT_DECLARATION__NAME,
                ErrorCode.VariadicParametersMustNotHaveDefaultValue
            )
        }
    }

    @Check
    fun expertMustBeOptional(smlParameter: SmlParameter) {
        if (smlParameter.isRequired() && smlParameter.isExpert()) {
            smlParameter.annotationCallsOrEmpty(StdlibAnnotations.Expert).forEach {
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
