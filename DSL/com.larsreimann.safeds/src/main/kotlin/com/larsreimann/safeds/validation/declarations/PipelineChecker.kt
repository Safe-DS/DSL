package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.emf.placeholdersOrEmpty
import com.larsreimann.safeds.emf.statementsOrEmpty
import com.larsreimann.safeds.emf.yieldsOrEmpty
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsPipeline
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class PipelineChecker : AbstractSafeDSChecker() {

    @Check
    fun noYield(sdsPipeline: SdsPipeline) {
        sdsPipeline.statementsOrEmpty()
            .filterIsInstance<SdsAssignment>()
            .flatMap { it.yieldsOrEmpty() }
            .forEach {
                error(
                    "Yield must not be used in a pipeline.",
                    it,
                    null,
                    ErrorCode.NoYieldInPipeline,
                )
            }
    }

    @Check
    fun uniqueNames(sdsPipeline: SdsPipeline) {
        sdsPipeline.placeholdersOrEmpty()
            .reportDuplicateNames { "A declaration with name '${it.name}' exists already in this pipeline." }
    }
}
