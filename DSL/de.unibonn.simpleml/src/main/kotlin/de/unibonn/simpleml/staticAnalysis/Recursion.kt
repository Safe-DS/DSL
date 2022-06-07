package de.unibonn.simpleml.staticAnalysis

import de.unibonn.simpleml.emf.containingCallableOrNull
import de.unibonn.simpleml.emf.immediateCalls
import de.unibonn.simpleml.simpleML.SmlAbstractCallable
import de.unibonn.simpleml.simpleML.SmlCall

/**
 * Returns whether this call might lead to recursion.
 */
fun SmlCall.isRecursive(): Boolean {
    val visited = buildSet {
        val containingCallable = containingCallableOrNull()
        if (containingCallable != null) {
            add(containingCallable)
        }
    }

    return isRecursive(visited)
}

/**
 * Returns whether this call might lead to recursion.
 */
private fun SmlCall.isRecursive(visited: Set<SmlAbstractCallable>): Boolean {
    return when (val callable = this.callableOrNull()) {
        is SmlAbstractCallable -> {
            callable in visited || callable.immediateCalls().any {
                it.isRecursive(visited + callable)
            }
        }
        else -> false
    }
}
