package com.larsreimann.safeds.validation.declarations

import de.unibonn.simpleml.emf.isOptional
import de.unibonn.simpleml.emf.isRequired
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import com.larsreimann.safeds.safeDS.SdsParameterList
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class ParameterListChecker : AbstractSimpleMLChecker() {

    @Check
    fun noRequiredOrVariadicParametersAfterFirstOptionalParameter(smlParameterList: SmlParameterList) {
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
                        Literals.SML_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.NoRequiredParametersAfterFirstOptionalParameter
                    )
                } else if (it.isVariadic) {
                    error(
                        "A callable with optional parameters must not have a variadic parameter.",
                        it,
                        Literals.SML_ABSTRACT_DECLARATION__NAME,
                        ErrorCode.NoVariadicParameterAfterOptionalParameter
                    )
                }
            }
    }

    @Check
    fun noMoreParametersAfterVariadic(smlParameterList: SmlParameterList) {
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
                    Literals.SML_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.NoMoreParametersAfterVariadicParameter
                )
            }
    }
}
