package com.larsreimann.safeds.validation.other

import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsProtocolReference
import com.larsreimann.safeds.safeDS.SdsProtocolSubtermList
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class ProtocolChecker : AbstractSafeDSChecker() {

    @Check
    fun mustOnlyReferToInstanceMembers(smlProtocolReference: SdsProtocolReference) {
        val token = smlProtocolReference.token
        val isStaticAttribute = token is SdsAttribute && token.isStatic
        val isStaticFunction = token is SdsFunction && token.isStatic

        if (isStaticAttribute || isStaticFunction) {
            error(
                "Must only reference instance members.",
                null,
                ErrorCode.OnlyReferenceInstanceMembers
            )
        }
    }

    @Check
    fun uniqueNames(smlProtocolSubtermList: SdsProtocolSubtermList) {
        smlProtocolSubtermList.subterms.reportDuplicateNames {
            "A subterm with name '${it.name}' exists already in this protocol."
        }
    }
}
