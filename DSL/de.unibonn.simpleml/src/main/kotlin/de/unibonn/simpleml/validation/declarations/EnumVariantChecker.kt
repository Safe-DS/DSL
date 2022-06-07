package de.unibonn.simpleml.validation.declarations

import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.typeParametersOrEmpty
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import de.unibonn.simpleml.simpleML.SmlEnumVariant
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class EnumVariantChecker : AbstractSimpleMLChecker() {

    @Check
    fun typeParameterList(smlEnumVariant: SmlEnumVariant) {
        if (smlEnumVariant.typeParameterList != null && smlEnumVariant.typeParametersOrEmpty().isEmpty()) {
            info(
                "Unnecessary type parameter list.",
                Literals.SML_ENUM_VARIANT__TYPE_PARAMETER_LIST,
                InfoCode.UnnecessaryTypeParameterList
            )
        }
    }

    @Check
    fun parameterList(smlEnumVariant: SmlEnumVariant) {
        if (smlEnumVariant.parameterList != null && smlEnumVariant.parametersOrEmpty().isEmpty()) {
            info(
                "Unnecessary parameter list.",
                Literals.SML_ABSTRACT_CALLABLE__PARAMETER_LIST,
                InfoCode.UnnecessaryParameterList
            )
        }
    }

    @Check
    fun uniqueNames(smlEnumVariant: SmlEnumVariant) {
        smlEnumVariant.parametersOrEmpty()
            .reportDuplicateNames { "A parameter with name '${it.name}' exists already in this enum variant." }
    }
}
