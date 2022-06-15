package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.typeParametersOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class EnumVariantChecker : AbstractSafeDSChecker() {

    @Check
    fun typeParameterList(sdsEnumVariant: SdsEnumVariant) {
        if (sdsEnumVariant.typeParameterList != null && sdsEnumVariant.typeParametersOrEmpty().isEmpty()) {
            info(
                "Unnecessary type parameter list.",
                Literals.SDS_ENUM_VARIANT__TYPE_PARAMETER_LIST,
                InfoCode.UnnecessaryTypeParameterList
            )
        }
    }

    @Check
    fun parameterList(sdsEnumVariant: SdsEnumVariant) {
        if (sdsEnumVariant.parameterList != null && sdsEnumVariant.parametersOrEmpty().isEmpty()) {
            info(
                "Unnecessary parameter list.",
                Literals.SDS_ABSTRACT_CALLABLE__PARAMETER_LIST,
                InfoCode.UnnecessaryParameterList
            )
        }
    }

    @Check
    fun uniqueNames(sdsEnumVariant: SdsEnumVariant) {
        sdsEnumVariant.parametersOrEmpty()
            .reportDuplicateNames { "A parameter with name '${it.name}' exists already in this enum variant." }
    }
}
