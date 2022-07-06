package com.larsreimann.safeds.constant

import com.larsreimann.safeds.safeDS.SdsProtocolTokenClass
import com.larsreimann.safeds.utils.ExperimentalSdsApi

/**
 * The possible values for an [SdsProtocolTokenClass].
 */
@ExperimentalSdsApi
enum class SdsProtocolTokenClassValue(val value: String) {

    /**
     * Matches any attribute or function.
     */
    Anything("."),

    /**
     * Matches any attribute.
     */
    AnyAttribute("\\a"),

    /**
     * Matches any function.
     */
    AnyFunction("\\f");

    override fun toString(): String {
        return value
    }
}

/**
 * Returns the [SdsProtocolTokenClassValue] of this [SdsProtocolTokenClass].
 *
 * @throws IllegalArgumentException If the value is unknown.
 */
@ExperimentalSdsApi
fun SdsProtocolTokenClass.value(): SdsProtocolTokenClassValue {
    return SdsProtocolTokenClassValue.values().firstOrNull { it.value == this.value }
        ?: throw IllegalArgumentException("Unknown token class value value '$value'.")
}
