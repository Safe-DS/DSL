package de.unibonn.simpleml.validation.declarations

import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.resultsOrEmpty
import de.unibonn.simpleml.emf.typeParametersOrEmpty
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.staticAnalysis.classHierarchy.hiddenFunction
import de.unibonn.simpleml.stdlibAccess.isPure
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import de.unibonn.simpleml.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class FunctionChecker : AbstractSimpleMLChecker() {

    @Check
    fun nonStaticPropagates(smlFunction: SmlFunction) {
        if (smlFunction.isStatic) {
            val hiddenFunction = smlFunction.hiddenFunction()
            if (hiddenFunction != null && !hiddenFunction.isStatic) {
                error(
                    "One of the supertypes of this class declares a non-static function with this name, so this must be non-static as well.",
                    Literals.SML_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.NON_STATIC_PROPAGATES
                )
            }
        }
    }

    @Check
    fun purePropagates(smlFunction: SmlFunction) {
        if (!smlFunction.isPure()) {
            val hiddenFunction = smlFunction.hiddenFunction()
            if (hiddenFunction != null && hiddenFunction.isPure()) {
                error(
                    "One of the supertypes of this class declares a pure function with this name, so this must be pure as well.",
                    Literals.SML_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.PURE_PROPAGATES
                )
            }
        }
    }

    @Check
    fun staticPropagates(smlFunction: SmlFunction) {
        if (!smlFunction.isStatic) {
            val hiddenFunction = smlFunction.hiddenFunction()
            if (hiddenFunction != null && hiddenFunction.isStatic) {
                error(
                    "One of the supertypes of this class declares a static function with this name, so this must be static as well.",
                    Literals.SML_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.STATIC_PROPAGATES
                )
            }
        }
    }

    @Check
    fun uniqueNames(smlFunction: SmlFunction) {
        val declarations = smlFunction.parametersOrEmpty() + smlFunction.resultsOrEmpty()
        declarations.reportDuplicateNames {
            "A parameter or result with name '${it.name}' exists already in this function."
        }
    }

    @Check
    fun unnecessaryResultList(smlFunction: SmlFunction) {
        if (smlFunction.resultList != null && smlFunction.resultsOrEmpty().isEmpty()) {
            info(
                "Unnecessary result list.",
                Literals.SML_FUNCTION__RESULT_LIST,
                InfoCode.UnnecessaryResultList
            )
        }
    }

    @Check
    fun unnecessaryTypeParameterList(smlFunction: SmlFunction) {
        if (smlFunction.typeParameterList != null && smlFunction.typeParametersOrEmpty().isEmpty()) {
            info(
                "Unnecessary type parameter list.",
                Literals.SML_FUNCTION__TYPE_PARAMETER_LIST,
                InfoCode.UnnecessaryTypeParameterList
            )
        }
    }
}
