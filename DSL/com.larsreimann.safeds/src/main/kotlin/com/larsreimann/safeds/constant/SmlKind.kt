package com.larsreimann.safeds.constant

import com.larsreimann.safeds.safeDS.SdsTypeParameter

/**
 * The possible Kinds for an [SmlTypeParameter].
 */
enum class SmlKind(val kind: String?) {
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
 * Returns the [SmlKind] of this [SmlTypeParameter].
 *
 * @throws IllegalArgumentException If the kind is unknown.
 */
fun SmlTypeParameter.kind(): SmlKind {
    return SmlKind.values().firstOrNull { it.kind == this.kind }
        ?: throw IllegalArgumentException("Unknown kind '$kind'.")
}
