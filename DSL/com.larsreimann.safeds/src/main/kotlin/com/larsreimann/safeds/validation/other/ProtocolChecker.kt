package com.larsreimann.safeds.validation.other

import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsProtocolReference
import com.larsreimann.safeds.safeDS.SdsProtocolSubtermList
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class ProtocolChecker : AbstractSimpleMLChecker() {

    @Check
    fun mustOnlyReferToInstanceMembers(smlProtocolReference: SmlProtocolReference) {
        val token = smlProtocolReference.token
        val isStaticAttribute = token is SmlAttribute && token.isStatic
        val isStaticFunction = token is SmlFunction && token.isStatic

        if (isStaticAttribute || isStaticFunction) {
            error(
                "Must only reference instance members.",
                null,
                ErrorCode.OnlyReferenceInstanceMembers
            )
        }
    }

    @Check
    fun uniqueNames(smlProtocolSubtermList: SmlProtocolSubtermList) {
        smlProtocolSubtermList.subterms.reportDuplicateNames {
            "A subterm with name '${it.name}' exists already in this protocol."
        }
    }
}
