package com.larsreimann.safeds.constant

import com.larsreimann.safeds.safeDS.SdsStep

/**
 * The possible visibilities of an [SdsStep].
 */
enum class SdsVisibility(val visibility: String?) {

    /**
     * The [SdsStep] is visible everywhere.
     */
    Public(null),

    /**
     * The [SdsStep] is only visible in the same package.
     */
    Internal("internal"),

    /**
     * The [SdsStep] is only visible in the same file.
     */
    Private("private");

    override fun toString(): String {
        return name
    }
}

/**
 * Returns the [SdsVisibility] of this [SdsStep].
 *
 * @throws IllegalArgumentException If the visibility is unknown.
 */
fun SdsStep.visibility(): SdsVisibility {
    return SdsVisibility.values().firstOrNull { it.visibility == this.visibility }
        ?: throw IllegalArgumentException("Unknown visibility '$visibility'.")
}
