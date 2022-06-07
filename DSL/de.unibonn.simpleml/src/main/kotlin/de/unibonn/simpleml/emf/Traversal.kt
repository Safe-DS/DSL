package de.unibonn.simpleml.emf

import org.eclipse.emf.ecore.EObject

/**
 * Returns all descendants of this [EObject] with the given type.
 *
 * @param prune Whether the subtree with the current object as root should be pruned.
 */
inline fun <reified T : EObject> EObject.descendants(crossinline prune: (EObject) -> Boolean = { false }) = sequence {
    val iterator = this@descendants.eAllContents()
    for (obj in iterator) {
        if (prune(obj)) {
            iterator.prune()
        } else if (obj is T) {
            yield(obj)
        }
    }
}

/**
 * Returns the closest ancestor of this [EObject] with the given type or `null` if none exists. This cannot return the
 * receiver.
 */
inline fun <reified T : EObject> EObject.closestAncestorOrNull(): T? {
    var current: EObject? = this.eContainer()
    while (current != null && current !is T) {
        current = current.eContainer()
    }
    return current as T?
}

/**
 * Returns the closest ancestor of this [EObject] that matches the given [predicate] or `null` if none
 * exists. This cannot return the receiver.
 */
inline fun EObject.closestAncestorOrNull(crossinline predicate: (EObject) -> Boolean = { true }): EObject? {
    var current: EObject? = this.eContainer()
    while (current != null && !predicate(current)) {
        current = current.eContainer()
    }
    return current
}
