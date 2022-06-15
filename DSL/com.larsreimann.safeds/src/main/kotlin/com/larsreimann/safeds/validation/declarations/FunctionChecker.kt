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
    fun nonStaticPropagates(sdsFunction: SdsFunction) {
        if (sdsFunction.isStatic) {
            val hiddenFunction = sdsFunction.hiddenFunction()
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
    fun purePropagates(sdsFunction: SdsFunction) {
        if (!sdsFunction.isPure()) {
            val hiddenFunction = sdsFunction.hiddenFunction()
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
    fun staticPropagates(sdsFunction: SdsFunction) {
        if (!sdsFunction.isStatic) {
            val hiddenFunction = sdsFunction.hiddenFunction()
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
    fun uniqueNames(sdsFunction: SdsFunction) {
        val declarations = sdsFunction.parametersOrEmpty() + sdsFunction.resultsOrEmpty()
        declarations.reportDuplicateNames {
            "A parameter or result with name '${it.name}' exists already in this function."
        }
    }

    @Check
    fun unnecessaryResultList(sdsFunction: SdsFunction) {
        if (sdsFunction.resultList != null && sdsFunction.resultsOrEmpty().isEmpty()) {
            info(
                "Unnecessary result list.",
                Literals.SDS_FUNCTION__RESULT_LIST,
                InfoCode.UnnecessaryResultList
            )
        }
    }

    @Check
    fun unnecessaryTypeParameterList(sdsFunction: SdsFunction) {
        if (sdsFunction.typeParameterList != null && sdsFunction.typeParametersOrEmpty().isEmpty()) {
            info(
                "Unnecessary type parameter list.",
                Literals.SDS_FUNCTION__TYPE_PARAMETER_LIST,
                InfoCode.UnnecessaryTypeParameterList
            )
        }
    }
}
