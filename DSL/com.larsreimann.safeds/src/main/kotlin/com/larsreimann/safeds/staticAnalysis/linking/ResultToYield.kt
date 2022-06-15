package com.larsreimann.safeds.staticAnalysis.linking

import com.larsreimann.safeds.emf.closestAncestorOrNull
import com.larsreimann.safeds.emf.yieldsOrEmpty
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsResultList
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsYield
import com.larsreimann.safeds.utils.uniqueOrNull

/**
 * Returns the unique [SdsYield] that corresponds to this [SdsResult] or `null` if no or multiple [SdsYield]s exist.
 * Note that an [SdsYield] can only be used inside an [SdsStep], so this will always return `null` for [SdsResult]s that
 * are not inside an [SdsStep].
 */
fun SdsResult.uniqueYieldOrNull(): SdsYield? {
    return yieldsOrEmpty().uniqueOrNull()
}

/**
 * Returns all [SdsYield]s that corresponds to this [SdsResult]. Note that an [SdsYield] can only be used inside an
 * [SdsStep], so this will always return an empty list for [SdsResult]s that are not inside an [SdsStep].
 */
fun SdsResult.yieldsOrEmpty(): List<SdsYield> {
    val resultList = closestAncestorOrNull<SdsResultList>() ?: return emptyList()
    val step = resultList.eContainer() as? SdsStep ?: return emptyList()

    return step.yieldsOrEmpty().filter { it.result == this }
}
