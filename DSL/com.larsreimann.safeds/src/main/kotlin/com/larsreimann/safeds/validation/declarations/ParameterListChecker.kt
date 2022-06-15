package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.emf.isOptional
import com.larsreimann.safeds.emf.isRequired
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsParameterList
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class ParameterListChecker : AbstractSafeDSChecker() {

    @Check
    fun noRequiredOrVariadicParametersAfterFirstOptionalParameter(smlParameterList: SdsParameterList) {
        val firstOptionalParameterIndex = smlParameterList.parameters.indexOfFirst { it.isOptional() }
        if (firstOptionalParameterIndex == -1) {
            return
        }

        smlParameterList.parameters
            .drop(firstOptionalParameterIndex + 1)
            .forEach {
                if (it.isRequired()) {
                    error(
                        "After the first optional parameter all parameters must be optional.",
                        it,
                        Literals.SDS_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.NoRequiredParametersAfterFirstOptionalParameter
                    )
                } else if (it.isVariadic) {
                    error(
                        "A callable with optional parameters must not have a variadic parameter.",
                        it,
                        Literals.SDS_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.NoVariadicParameterAfterOptionalParameter
                    )
                }
            }
    }

    @Check
    fun noMoreParametersAfterVariadic(smlParameterList: SdsParameterList) {
        val firstVariadicParameterIndex = smlParameterList.parameters.indexOfFirst { it.isVariadic }
        if (firstVariadicParameterIndex == -1) {
            return
        }

        smlParameterList.parameters
            .drop(firstVariadicParameterIndex + 1)
            .forEach {
                error(
                    "After a variadic parameter no more parameters must be specified.",
                    it,
                    Literals.SDS_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.NoMoreParametersAfterVariadicParameter
                )
            }
    }
}
