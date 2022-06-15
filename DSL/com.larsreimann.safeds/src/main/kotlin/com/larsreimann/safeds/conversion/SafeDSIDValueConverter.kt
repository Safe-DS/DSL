package com.larsreimann.safeds.conversion

import com.google.inject.Singleton
import org.eclipse.xtext.GrammarUtil
import org.eclipse.xtext.conversion.impl.IDValueConverter
import org.eclipse.xtext.nodemodel.INode

/**
 * Handles the conversion between the textual representation of an ID (including the escaping of keywords)  and its
 * actual value.
 *
 * __Example__: The ID ``` `fun` ``` in a DSL program has the value `fun`.
 *
 * __Note__: This converter is not called for qualified names since this is a data type rule and requires another
 * converter. See the Eclipse forum for more information: [https://www.eclipse.org/forums/index.php/t/1088504/].
 */
@Singleton
class SafeDSIDValueConverter : IDValueConverter() {

    /**
     * Syntax of valid identifiers.
     */
    private val identifier = Regex("[a-zA-Z_][a-zA-Z_0-9]*")

    /**
     * Adds surrounding backticks as necessary.
     */
    override fun toEscapedString(value: String): String {
        return if (mustEscape(value)) "`$value`" else value
    }

    /**
     * Removes surrounding backticks.
     */
    override fun toValue(string: String?, node: INode?): String? {
        return string?.removeSurrounding("`")
    }

    /**
     * Keywords that could be valid identifiers, e.g. `fun`.
     */
    private val textualKeywords: Set<String> by lazy {
        GrammarUtil.getAllKeywords(grammarAccess.grammar)
            .filter { it.matches(identifier) }
            .toSet()
    }

    /**
     * Checks whether the identifier must be escaped because it clashes with a keyword.
     */
    override fun mustEscape(value: String): Boolean {
        return value in textualKeywords
    }
}
