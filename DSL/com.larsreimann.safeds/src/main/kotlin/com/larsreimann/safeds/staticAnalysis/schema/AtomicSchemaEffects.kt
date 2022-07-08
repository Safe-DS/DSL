package com.larsreimann.safeds.staticAnalysis.schema

import com.larsreimann.safeds.constant.SdsSchemaEffect
import com.larsreimann.safeds.constant.effect
import com.larsreimann.safeds.safeDS.SdsAtomicSchemaEffect
import com.larsreimann.safeds.staticAnalysis.typing.ClassType
import com.larsreimann.safeds.staticAnalysis.typing.Type
import com.larsreimann.safeds.staticAnalysis.typing.VariadicType
import com.larsreimann.safeds.stdlibAccess.StdlibClasses
import com.larsreimann.safeds.stdlibAccess.getStdlibClassOrNull
import com.larsreimann.safeds.utils.ExperimentalSdsApi

@ExperimentalSdsApi
fun SdsAtomicSchemaEffect.ParameterTypesOrEmpty(): List<Type> {
    val parameters = when (effect()) {
        SdsSchemaEffect.ReadSchemaEffect -> listOf(
            Pair(StdlibClasses.String, false), // "datasetName"
            Pair(StdlibClasses.String, false), // "datasetPath"
        )
        else -> emptyList()
    }

    return parameters.mapNotNull { (qualifiedName, isVariadic) ->
        val sdsClass = this.getStdlibClassOrNull(qualifiedName)
        when {
            sdsClass != null && isVariadic ->  VariadicType( ClassType(sdsClass, false))
            sdsClass != null -> ClassType(sdsClass, false)
            else -> null
        }
    }
}
