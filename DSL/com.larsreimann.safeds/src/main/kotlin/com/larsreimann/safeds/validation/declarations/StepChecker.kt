package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.emf.asResolvedOrNull
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.placeholdersOrEmpty
import com.larsreimann.safeds.emf.resultsOrEmpty
import com.larsreimann.safeds.emf.yieldsOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.staticAnalysis.linking.yieldsOrEmpty
import com.larsreimann.safeds.staticAnalysis.usesIn
import com.larsreimann.safeds.utils.duplicatesBy
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import com.larsreimann.safeds.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check

class StepChecker : AbstractSafeDSChecker() {

    @Check
    fun parameterIsUnused(sdsStep: SdsStep) {
        sdsStep.parametersOrEmpty()
            .filter { it.usesIn(sdsStep).none() }
            .forEach {
                warning(
                    "This parameter is unused.",
                    it,
                    Literals.SDS_ABSTRACT_DECLARATION__NAME,
                    WarningCode.UnusedParameter
                )
            }
    }

    @Check
    fun uniqueNames(sdsStep: SdsStep) {
        val declarations =
            sdsStep.parametersOrEmpty() + sdsStep.resultsOrEmpty() + sdsStep.placeholdersOrEmpty()
        declarations.reportDuplicateNames {
            "A parameter, result or placeholder with name '${it.name}' exists already in this step."
        }
    }

    @Check
    fun unnecessaryResultList(sdsStep: SdsStep) {
        if (sdsStep.resultList != null && sdsStep.resultsOrEmpty().isEmpty()) {
            info(
                "Unnecessary result list.",
                Literals.SDS_STEP__RESULT_LIST,
                InfoCode.UnnecessaryResultList
            )
        }
    }

    @Check
    fun unassignedResult(sdsStep: SdsStep) {
        sdsStep.resultsOrEmpty().forEach {
            if (it.yieldsOrEmpty().isEmpty()) {
                error(
                    "No value is assigned to this result.",
                    it,
                    Literals.SDS_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.UnassignedResult
                )
            }
        }
    }

    @Check
    fun duplicateResultAssignment(sdsStep: SdsStep) {
        sdsStep.yieldsOrEmpty()
            .duplicatesBy { it.result.asResolvedOrNull() }
            .forEach {
                error(
                    "This result is assigned multiple times.",
                    it,
                    Literals.SDS_YIELD__RESULT,
                    ErrorCode.DuplicateResultAssignment
                )
            }
    }
}
