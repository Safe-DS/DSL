package de.unibonn.simpleml.validation.declarations

import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import de.unibonn.simpleml.simpleML.SmlAttribute
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class AttributeChecker : AbstractSimpleMLChecker() {

    @Check
    fun type(smlAttribute: SmlAttribute) {
        if (smlAttribute.type == null) {
            error(
                "An attribute must have a type.",
                Literals.SML_ABSTRACT_DECLARATION__NAME,
                ErrorCode.AttributeMustHaveType
            )
        }
    }
}
