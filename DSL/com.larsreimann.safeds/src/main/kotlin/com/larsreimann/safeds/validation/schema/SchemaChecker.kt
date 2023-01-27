package com.larsreimann.safeds.validation.schema

import com.larsreimann.safeds.emf.statementsOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsPipeline
import com.larsreimann.safeds.staticAnalysis.schema.SchemaOwner
import com.larsreimann.safeds.staticAnalysis.schema.SchemaResult
import com.larsreimann.safeds.staticAnalysis.schema.inferSchema
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class SchemaChecker : AbstractSafeDSChecker() {

    @Check(CheckType.NORMAL)
    fun value(sdsPipeline: SdsPipeline) {
        val resolvedVars = mutableMapOf<SchemaOwner, SchemaResult>()

        for (statement in sdsPipeline.statementsOrEmpty()) {
            val resolved = inferSchema(statement, resolvedVars)

            resolved.forEach {
                val (errorMsg, errorArg, errorCode) = when (val result = it.value) {
                    is SchemaResult.Error -> Triple(result.msg, result.argument, result.code)
                    else -> return@forEach
                }
                error(errorMsg, errorArg, Literals.SDS_ARGUMENT__VALUE, errorCode)
            }

            resolved.keys.removeIf { it is SchemaOwner.TempOwner }
            resolvedVars.putAll(resolved)
        }
    }
}
