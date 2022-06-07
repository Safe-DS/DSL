package de.unibonn.simpleml.utils

import kotlin.math.max

/**
 * Creates a list of all elements in the iterable that the labeler maps to the same label as at least one other element.
 * Values that are mapped to `null` by the labeler are removed.
 */
internal fun <I, K> Iterable<I>.duplicatesBy(labeler: (I) -> K): List<I> {
    return this
        .groupBy(labeler)
        .filterKeys { it != null }
        .values
        .filter { it.size > 1 }
        .flatten()
}

/**
 * Creates a list of all elements in the iterable that the labeler maps to a unique label. Values that are mapped to
 * `null` by the labeler are removed.
 */
internal fun <I, K> Iterable<I>.uniqueBy(labeler: (I) -> K): List<I> {
    return this
        .groupBy(labeler)
        .filterKeys { it != null }
        .values
        .filter { it.size == 1 }
        .flatten()
}

/**
 * Returns the unique element in the iterable that matches the filter or `null` if none or multiple exist.
 */
internal fun <I> Iterable<I>.uniqueOrNull(filter: (I) -> Boolean = { true }): I? {
    val candidates = this.filter(filter)
    return when (candidates.size) {
        1 -> candidates[0]
        else -> null
    }
}

/**
 * Returns `null` if this [List] is empty. Otherwise, calls [init] on the list.
 */
internal fun <I, O> List<I>.nullIfEmptyElse(init: (List<I>) -> O): O? {
    return ifEmpty { null }?.let { init(it) }
}

/**
 * Maps corresponding elements of the left and right list using the given zipper. The shorter list is padded with
 * `null`s at the end, so the resulting list has the same length as the longer list.
 */
internal fun <L, R, O> outerZipBy(left: List<L>, right: List<R>, zipper: (L?, R?) -> O): List<O> {
    val maxSize = max(left.size, right.size)
    return (0 until maxSize).map { i ->
        zipper(left.getOrNull(i), right.getOrNull(i))
    }
}
