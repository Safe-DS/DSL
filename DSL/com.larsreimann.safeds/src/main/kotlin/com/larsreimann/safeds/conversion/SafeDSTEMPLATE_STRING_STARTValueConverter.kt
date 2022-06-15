@file:Suppress("ClassName")

package com.larsreimann.safeds.conversion

import com.google.inject.Singleton

/**
 * Handles the conversion between the textual representation of a template string start (including delimiters and escape
 * sequences) to its actual value.
 *
 * Example: The template string start `"start{{` in a DSL program has the value `start`.
 */
@Singleton
class SafeSDTEMPLATE_STRING_STARTValueConverter : AbstractSafeDSStringValueConverter("\"", "{{")
