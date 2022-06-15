package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.emf.placeholdersOrEmpty
import com.larsreimann.safeds.emf.statementsOrEmpty
import com.larsreimann.safeds.emf.yieldsOrEmpty
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsWorkflow
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class WorkflowChecker : AbstractSafeDSChecker() {

    @Check
    fun noYield(sdsWorkflow: SdsWorkflow) {
        sdsWorkflow.statementsOrEmpty()
            .filterIsInstance<SdsAssignment>()
            .flatMap { it.yieldsOrEmpty() }
            .forEach {
                error(
                    "Yield must not be used in a workflow.",
                    it,
                    null,
                    ErrorCode.NO_YIELD_IN_WORKFLOW
                )
            }
    }

    @Check
    fun uniqueNames(sdsWorkflow: SdsWorkflow) {
        sdsWorkflow.placeholdersOrEmpty()
            .reportDuplicateNames { "A declaration with name '${it.name}' exists already in this workflow." }
    }
}
