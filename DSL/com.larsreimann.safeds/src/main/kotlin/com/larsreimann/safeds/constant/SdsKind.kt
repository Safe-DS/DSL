package com.larsreimann.safeds.constant

import com.larsreimann.safeds.safeDS.SdsTypeParameter

/**
 * The possible Kinds for an [SdsTypeParameter].
 */
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
fun SdsTypeParameter.kind(): SdsKind {
    return SdsKind.values().firstOrNull { it.kind == this.kind }
        ?: throw IllegalArgumentException("Unknown kind '$kind'.")
}
