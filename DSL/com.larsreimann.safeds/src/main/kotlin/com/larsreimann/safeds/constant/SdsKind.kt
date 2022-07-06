package com.larsreimann.safeds.constant

import com.larsreimann.safeds.safeDS.SdsTypeParameter
import com.larsreimann.safeds.utils.ExperimentalSdsApi

/**
 * The possible kinds for an [SdsTypeParameter].
 */
@ExperimentalSdsApi
enum class SdsKind(val kind: String?) {
    NoKind(null),
    SchemaKind("\$SchemaType"),
    ExpressionKind("\$ExpressionType"),
    IntKind("\$IntType"),
    FloatKind("\$FloatType"),
    BooleanKind("\$BooleanType"),
    StringKind("\$StringType"),
    NamedKind("\$NamedType");

    override fun toString(): String {
        return kind ?: "NoKind"
    }
}

/**
 * Returns the [SdsKind] of this [SdsTypeParameter].
 *
 * @throws IllegalArgumentException If the kind is unknown.
 */
@ExperimentalSdsApi
fun SdsTypeParameter.kind(): SdsKind {
    return SdsKind.values().firstOrNull { it.kind == this.kind }
        ?: throw IllegalArgumentException("Unknown kind '$kind'.")
}

@ExperimentalSdsApi
fun SdsTypeParameter.hasSchemaKind() = this.kind() == SdsKind.SchemaKind
