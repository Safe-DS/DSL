@file:Suppress("ClassName")

package com.larsreimann.safeds.conversion

import com.google.inject.Singleton

/**
 * Handles the conversion between the textual representation of a template string end (including delimiters and escape
 * sequences) to its actual value.
 *
 * Example: The template string end `}}end"` in a DSL program has the value `end`.
 */
@Singleton
class SafeDSTEMPLATE_STRING_ENDValueConverter : AbstractSafeDSStringValueConverter("}}", "\"")
