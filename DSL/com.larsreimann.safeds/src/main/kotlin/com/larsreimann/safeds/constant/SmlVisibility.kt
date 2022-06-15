package com.larsreimann.safeds.constant

import com.larsreimann.safeds.safeDS.SdsStep

/**
 * The possible visibilities of an [SmlStep].
 */
enum class SmlVisibility(val visibility: String?) {

    /**
     * The [SmlStep] is visible everywhere.
     */
    Public(null),

    /**
     * The [SmlStep] is only visible in the same package.
     */
    Internal("internal"),

    /**
     * The [SmlStep] is only visible in the same file.
     */
    Private("private");

    override fun toString(): String {
        return name
    }
}

/**
 * Returns the [SmlVisibility] of this [SmlStep].
 *
 * @throws IllegalArgumentException If the visibility is unknown.
 */
fun SmlStep.visibility(): SmlVisibility {
    return SmlVisibility.values().firstOrNull { it.visibility == this.visibility }
        ?: throw IllegalArgumentException("Unknown visibility '$visibility'.")
}
