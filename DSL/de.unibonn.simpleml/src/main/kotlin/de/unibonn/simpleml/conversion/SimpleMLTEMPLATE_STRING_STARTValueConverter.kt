@file:Suppress("ClassName")

package de.unibonn.simpleml.conversion

import com.google.inject.Singleton

/**
 * Handles the conversion between the textual representation of a template string start (including delimiters and escape
 * sequences) to its actual value.
 *
 * Example: The template string start `"start{{` in a DSL program has the value `start`.
 */
@Singleton
class SimpleMLTEMPLATE_STRING_STARTValueConverter : AbstractSimpleMLStringValueConverter("\"", "{{")
