package de.unibonn.simpleml.validation.declarations

import de.unibonn.simpleml.emf.variantsOrEmpty
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import de.unibonn.simpleml.simpleML.SmlEnum
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class EnumChecker : AbstractSimpleMLChecker() {

    @Check
    fun body(smlEnum: SmlEnum) {
        if (smlEnum.body != null && smlEnum.variantsOrEmpty().isEmpty()) {
            info(
                "Unnecessary enum body.",
                Literals.SML_ENUM__BODY,
                InfoCode.UnnecessaryBody
            )
        }
    }

    @Check
    fun uniqueNames(smlEnum: SmlEnum) {
        smlEnum.variantsOrEmpty()
            .reportDuplicateNames { "A declaration with name '${it.name}' exists already in this enum." }
    }
}
