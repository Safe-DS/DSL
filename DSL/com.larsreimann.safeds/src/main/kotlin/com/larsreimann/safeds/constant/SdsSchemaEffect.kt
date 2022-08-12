package com.larsreimann.safeds.constant

import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.staticAnalysis.typing.ParameterisedType
import com.larsreimann.safeds.utils.ExperimentalSdsApi

/**
 * The possible [SdsSchemaEffect].
 */
@ExperimentalSdsApi
enum class SdsSchemaEffect(val effect: String?) {
    NoSchemaEffect(null),
    ReadSchemaEffect("\$ReadSchema"),
    CheckColumnEffect("\$CheckColumn");

    override fun toString(): String {
        return effect ?: "NoSchemaEffect"
    }
}

@ExperimentalSdsApi
private fun strToSchemaEffect(str: String): SdsSchemaEffect {
    return SdsSchemaEffect.values().firstOrNull { it.effect == str }
        ?: SdsSchemaEffect.NoSchemaEffect
}

@ExperimentalSdsApi
fun SdsAbstractDeclaration.nameToSchemaEffect(): SdsSchemaEffect {
    return strToSchemaEffect(this.name)
}

@ExperimentalSdsApi
fun ParameterisedType.kindToSchemaEffect(): SdsSchemaEffect {
    return strToSchemaEffect(this.kind)
}
