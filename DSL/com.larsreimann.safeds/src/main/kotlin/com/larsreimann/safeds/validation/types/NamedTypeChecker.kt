package com.larsreimann.safeds.validation.types

import com.larsreimann.safeds.emf.typeParametersOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSPackage
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class NamedTypeChecker : AbstractSafeDSChecker() {

    @Check
    fun missingTypeArgumentList(sdsNamedType: SdsNamedType) {
        if (sdsNamedType.typeArgumentList != null) {
            return
        }

        val declaration = sdsNamedType.declaration
        val typeParameters = when {
            declaration.eIsProxy() -> return
            declaration is SdsClass -> declaration.typeParametersOrEmpty()
            declaration is SdsEnumVariant -> declaration.typeParametersOrEmpty()
            declaration is SdsFunction -> declaration.typeParametersOrEmpty()
            else -> return
        }

        if (typeParameters.isNotEmpty()) {
            error(
                "Missing type argument list.",
                SafeDSPackage.Literals.SDS_NAMED_TYPE__DECLARATION,
                ErrorCode.MISSING_TYPE_ARGUMENT_LIST
            )
        }
    }
}
