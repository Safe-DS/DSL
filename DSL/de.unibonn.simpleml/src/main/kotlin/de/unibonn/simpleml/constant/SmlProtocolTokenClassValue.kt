package de.unibonn.simpleml.constant

import de.unibonn.simpleml.simpleML.SmlProtocolTokenClass

/**
 * The possible values for an [SmlProtocolTokenClass].
 */
enum class SmlProtocolTokenClassValue(val value: String) {

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
 * Returns the [SmlProtocolTokenClassValue] of this [SmlProtocolTokenClass].
 *
 * @throws IllegalArgumentException If the value is unknown.
 */
fun SmlProtocolTokenClass.value(): SmlProtocolTokenClassValue {
    return SmlProtocolTokenClassValue.values().firstOrNull { it.value == this.value }
        ?: throw IllegalArgumentException("Unknown token class value value '$value'.")
}
