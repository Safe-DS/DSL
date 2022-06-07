package de.unibonn.simpleml.validation.declarations

import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import de.unibonn.simpleml.simpleML.SmlResult
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class ResultChecker : AbstractSimpleMLChecker() {

    @Check
    fun type(smlResult: SmlResult) {
        if (smlResult.type == null) {
            error(
                "A result must have a type.",
                Literals.SML_ABSTRACT_DECLARATION__NAME,
                ErrorCode.ResultMustHaveType
            )
        }
    }
}
