package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class AttributeChecker : AbstractSafeDSChecker() {

    @Check
    fun type(sdsAttribute: SdsAttribute) {
        if (sdsAttribute.type == null) {
            error(
                "An attribute must have a type.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                ErrorCode.AttributeMustHaveType
            )
        }
    }
}
