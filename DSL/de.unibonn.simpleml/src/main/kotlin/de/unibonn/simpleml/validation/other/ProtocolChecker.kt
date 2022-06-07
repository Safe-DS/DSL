package de.unibonn.simpleml.validation.other

import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlProtocolReference
import de.unibonn.simpleml.simpleML.SmlProtocolSubtermList
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
