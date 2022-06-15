package com.larsreimann.safeds.staticAnalysis

import de.unibonn.simpleml.emf.containingCallableOrNull
import de.unibonn.simpleml.emf.immediateCalls
import com.larsreimann.safeds.safeDS.SdsAbstractCallable
import com.larsreimann.safeds.safeDS.SdsCall

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
