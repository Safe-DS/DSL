package com.larsreimann.safeds.constant

import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.utils.ExperimentalSdsApi

/**
 * The possible [SdsSchemaEffect].
 */
@ExperimentalSdsApi
@Suppress("ktlint:trailing-comma-on-declaration-site")
enum class SdsSchemaEffect(val effect: String?) {
    NoSchemaEffect(null),
    ReadSchemaEffect("\$readSchema"),
    CheckColumnEffect("\$checkColumn"),
    RemoveColumnEffect("\$removeColumn"),
    KeepColumnEffect("\$keepColumn"),
    RenameColumnEffect("\$renameColumn"),
    AddColumnEffect("\$addColumn"),
    ChangeColumnTypeEffect("\$changeColumnType");

    override fun toString(): String {
        return effect ?: "NoSchemaEffect"
    }
}

@ExperimentalSdsApi
fun SdsAbstractDeclaration.nameToSchemaEffect(): SdsSchemaEffect {
    return SdsSchemaEffect.values().firstOrNull { it.effect == this.name }
        ?: SdsSchemaEffect.NoSchemaEffect
}
