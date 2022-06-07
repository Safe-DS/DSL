package de.unibonn.simpleml.validation.types

import de.unibonn.simpleml.emf.isOptional
import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.resultsOrEmpty
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import de.unibonn.simpleml.simpleML.SmlCallableType
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class CallableTypeChecker : AbstractSimpleMLChecker() {

    @Check
    fun uniqueNames(smlCallableType: SmlCallableType) {
        val declarations = smlCallableType.parametersOrEmpty() + smlCallableType.resultsOrEmpty()
        declarations.reportDuplicateNames {
            "A parameter or result with name '${it.name}' exists already in this callable type."
        }
    }

    @Check
    fun noOptionalParameters(smlCallableType: SmlCallableType) {
        smlCallableType.parametersOrEmpty().forEach {
            if (it.isOptional()) {
                error(
                    "Parameters in callable types must not be optional.",
                    it,
                    Literals.SML_PARAMETER__DEFAULT_VALUE,
                    ErrorCode.NoOptionalParametersInCallableType
                )
            }
        }
    }
}
