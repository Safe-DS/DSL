package com.larsreimann.safeds.validation.types

import com.larsreimann.safeds.emf.isOptional
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.resultsOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsCallableType
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class CallableTypeChecker : AbstractSafeDSChecker() {

    @Check
    fun uniqueNames(sdsCallableType: SdsCallableType) {
        val declarations = sdsCallableType.parametersOrEmpty() + sdsCallableType.resultsOrEmpty()
        declarations.reportDuplicateNames {
            "A parameter or result with name '${it.name}' exists already in this callable type."
        }
    }

    @Check
    fun noOptionalParameters(sdsCallableType: SdsCallableType) {
        sdsCallableType.parametersOrEmpty().forEach {
            if (it.isOptional()) {
                error(
                    "Parameters in callable types must not be optional.",
                    it,
                    Literals.SDS_PARAMETER__DEFAULT_VALUE,
                    ErrorCode.NoOptionalParametersInCallableType
                )
            }
        }
    }
}
