package de.unibonn.simpleml.validation.types

import de.unibonn.simpleml.emf.typeParametersOrEmpty
import de.unibonn.simpleml.simpleML.SimpleMLPackage
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlEnumVariant
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlNamedType
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class NamedTypeChecker : AbstractSimpleMLChecker() {

    @Check
    fun missingTypeArgumentList(smlNamedType: SmlNamedType) {
        if (smlNamedType.typeArgumentList != null) {
            return
        }

        val declaration = smlNamedType.declaration
        val typeParameters = when {
            declaration.eIsProxy() -> return
            declaration is SmlClass -> declaration.typeParametersOrEmpty()
            declaration is SmlEnumVariant -> declaration.typeParametersOrEmpty()
            declaration is SmlFunction -> declaration.typeParametersOrEmpty()
            else -> return
        }

        if (typeParameters.isNotEmpty()) {
            error(
                "Missing type argument list.",
                SimpleMLPackage.Literals.SML_NAMED_TYPE__DECLARATION,
                ErrorCode.MISSING_TYPE_ARGUMENT_LIST
            )
        }
    }
}
