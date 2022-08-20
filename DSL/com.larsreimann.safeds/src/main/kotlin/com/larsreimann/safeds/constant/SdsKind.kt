package com.larsreimann.safeds.constant

import com.larsreimann.safeds.safeDS.SdsTypeParameter
import com.larsreimann.safeds.staticAnalysis.typing.ParameterisedType
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
 */
@ExperimentalSdsApi
fun SdsTypeParameter.kind(): SdsKind {
    return stringToKind(this.kind)
}

/**
 * Returns the [SdsKind] of this [ParameterisedType].
 */
@ExperimentalSdsApi
fun ParameterisedType.kind(): SdsKind {
    return stringToKind(this.kind)
}

@OptIn(ExperimentalSdsApi::class)
private fun stringToKind(string: String?): SdsKind {
    return SdsKind.values().firstOrNull { it.kind == string }
        ?: SdsKind.NoKind
}

@ExperimentalSdsApi
fun SdsTypeParameter.hasSchemaKind() = this.kind() == SdsKind.SchemaKind
