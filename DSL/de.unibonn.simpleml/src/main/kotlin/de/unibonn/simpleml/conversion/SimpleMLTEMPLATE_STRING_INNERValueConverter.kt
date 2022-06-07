@file:Suppress("ClassName")

package de.unibonn.simpleml.conversion

import com.google.inject.Singleton

/**
 * Handles the conversion between the textual representation of a template string inner part (including delimiters and
 * escape sequences) to its actual value.
 *
 * Example: The template string inner part `}}inner{{` in a DSL program has the value `inner`.
 */
@Singleton
class SimpleMLTEMPLATE_STRING_INNERValueConverter : AbstractSimpleMLStringValueConverter("}}", "{{")
