package com.larsreimann.safeds.conversion

import com.google.inject.Singleton

/**
 * Handles the conversion between the textual representation of a string (including delimiters and escape sequences) to
 * its actual value.
 *
 * Example: The string `"myString \{"` in a DSL program has the value `myString {`.
 */
@Singleton
class SafeSDSTRINGValueConverter : AbstractSimpleMLStringValueConverter("\"", "\"")
