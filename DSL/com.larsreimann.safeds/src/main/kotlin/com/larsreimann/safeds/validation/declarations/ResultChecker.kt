package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class ResultChecker : AbstractSafeDSChecker() {

    @Check
    fun type(sdsResult: SdsResult) {
        if (sdsResult.type == null) {
            error(
                "A result must have a type.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                ErrorCode.ResultMustHaveType,
            )
        }
    }
}
