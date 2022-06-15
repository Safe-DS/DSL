package com.larsreimann.safeds.staticAnalysis

import com.larsreimann.safeds.emf.containingCallableOrNull
import com.larsreimann.safeds.emf.immediateCalls
import com.larsreimann.safeds.safeDS.SdsAbstractCallable
import com.larsreimann.safeds.safeDS.SdsCall

/**
 * Returns whether this call might lead to recursion.
 */
fun SdsCall.isRecursive(): Boolean {
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
private fun SdsCall.isRecursive(visited: Set<SdsAbstractCallable>): Boolean {
    return when (val callable = this.callableOrNull()) {
        is SdsAbstractCallable -> {
            callable in visited || callable.immediateCalls().any {
                it.isRecursive(visited + callable)
            }
        }
        else -> false
    }
}
