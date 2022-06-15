package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.emf.variantsOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class EnumChecker : AbstractSafeDSChecker() {

    @Check
    fun body(sdsEnum: SdsEnum) {
        if (sdsEnum.body != null && sdsEnum.variantsOrEmpty().isEmpty()) {
            info(
                "Unnecessary enum body.",
                Literals.SDS_ENUM__BODY,
                InfoCode.UnnecessaryBody
            )
        }
    }

    @Check
    fun uniqueNames(sdsEnum: SdsEnum) {
        sdsEnum.variantsOrEmpty()
            .reportDuplicateNames { "A declaration with name '${it.name}' exists already in this enum." }
    }
}
