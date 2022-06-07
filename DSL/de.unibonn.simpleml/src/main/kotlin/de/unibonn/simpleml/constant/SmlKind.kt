package de.unibonn.simpleml.constant

import de.unibonn.simpleml.simpleML.SmlTypeParameter

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
        if (kind != null) {
            return kind
        } else {
            return "NoKind"
        }
    }
}

/**
 * Returns the [SmlKind] of this [SmlTypeParameter].
 *
 * @throws IllegalArgumentException If the Kind is unknown.
 */
fun SmlTypeParameter.kind(): SmlKind {
    return SmlKind.values().firstOrNull { it.kind == this.kind }
        ?: throw IllegalArgumentException("Unknown kind '$kind'.")
}
