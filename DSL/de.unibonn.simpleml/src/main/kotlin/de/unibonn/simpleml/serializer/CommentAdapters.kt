package de.unibonn.simpleml.serializer

import org.eclipse.emf.common.notify.impl.AdapterImpl
import org.eclipse.emf.ecore.EObject

/**
 * Stores a comment that is attached to an [EObject].
 */
sealed class CommentAdapter(val text: String) : AdapterImpl()

/**
 * Stores a single-line comment that is attached to an [EObject].
 */
class SingleLineCommentAdapter(text: String) : CommentAdapter(text) {
    override fun toString(): String {
        return "// $text"
    }
}

/**
 * Stores a multi-line comment that is attached to an [EObject].
 */
class MultiLineCommentAdapter(text: String) : CommentAdapter(text) {
    override fun toString(): String {
        return if (text.lines().size == 1) {
            "/* $text */"
        } else {
            buildString {
                appendLine("/*")
                text.lineSequence().forEach {
                    appendLine(" * $it")
                }
                appendLine(" */")
            }
        }
    }
}
