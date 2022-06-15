package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.resultsOrEmpty
import com.larsreimann.safeds.emf.typeParametersOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.staticAnalysis.classHierarchy.hiddenFunction
import com.larsreimann.safeds.stdlibAccess.isPure
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class FunctionChecker : AbstractSafeDSChecker() {

    @Check
    fun nonStaticPropagates(smlFunction: SdsFunction) {
        if (smlFunction.isStatic) {
            val hiddenFunction = smlFunction.hiddenFunction()
            if (hiddenFunction != null && !hiddenFunction.isStatic) {
                error(
                    "One of the supertypes of this class declares a non-static function with this name, so this must be non-static as well.",
                    Literals.SDS_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.NON_STATIC_PROPAGATES
                )
            }
        }
    }

    @Check
    fun purePropagates(smlFunction: SdsFunction) {
        if (!smlFunction.isPure()) {
            val hiddenFunction = smlFunction.hiddenFunction()
            if (hiddenFunction != null && hiddenFunction.isPure()) {
                error(
                    "One of the supertypes of this class declares a pure function with this name, so this must be pure as well.",
                    Literals.SDS_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.PURE_PROPAGATES
                )
            }
        }
    }

    @Check
    fun staticPropagates(smlFunction: SdsFunction) {
        if (!smlFunction.isStatic) {
            val hiddenFunction = smlFunction.hiddenFunction()
            if (hiddenFunction != null && hiddenFunction.isStatic) {
                error(
                    "One of the supertypes of this class declares a static function with this name, so this must be static as well.",
                    Literals.SDS_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.STATIC_PROPAGATES
                )
            }
        }
    }

    @Check
    fun uniqueNames(smlFunction: SdsFunction) {
        val declarations = smlFunction.parametersOrEmpty() + smlFunction.resultsOrEmpty()
        declarations.reportDuplicateNames {
            "A parameter or result with name '${it.name}' exists already in this function."
        }
    }

    @Check
    fun unnecessaryResultList(smlFunction: SdsFunction) {
        if (smlFunction.resultList != null && smlFunction.resultsOrEmpty().isEmpty()) {
            info(
                "Unnecessary result list.",
                Literals.SDS_FUNCTION__RESULT_LIST,
                InfoCode.UnnecessaryResultList
            )
        }
    }

    @Check
    fun unnecessaryTypeParameterList(smlFunction: SdsFunction) {
        if (smlFunction.typeParameterList != null && smlFunction.typeParametersOrEmpty().isEmpty()) {
            info(
                "Unnecessary type parameter list.",
                Literals.SDS_FUNCTION__TYPE_PARAMETER_LIST,
                InfoCode.UnnecessaryTypeParameterList
            )
        }
    }
}
