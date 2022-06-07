package de.unibonn.simpleml.staticAnalysis.linking

import de.unibonn.simpleml.emf.closestAncestorOrNull
import de.unibonn.simpleml.emf.yieldsOrEmpty
import de.unibonn.simpleml.simpleML.SmlResult
import de.unibonn.simpleml.simpleML.SmlResultList
import de.unibonn.simpleml.simpleML.SmlStep
import de.unibonn.simpleml.simpleML.SmlYield
import de.unibonn.simpleml.utils.uniqueOrNull

/**
 * Returns the unique [SmlYield] that corresponds to this [SmlResult] or `null` if no or multiple [SmlYield]s exist.
 * Note that an [SmlYield] can only be used inside an [SmlStep], so this will always return `null` for [SmlResult]s that
 * are not inside an [SmlStep].
 */
fun SmlResult.uniqueYieldOrNull(): SmlYield? {
    return yieldsOrEmpty().uniqueOrNull()
}

/**
 * Returns all [SmlYield]s that corresponds to this [SmlResult]. Note that an [SmlYield] can only be used inside an
 * [SmlStep], so this will always return an empty list for [SmlResult]s that are not inside an [SmlStep].
 */
fun SmlResult.yieldsOrEmpty(): List<SmlYield> {
    val resultList = closestAncestorOrNull<SmlResultList>() ?: return emptyList()
    val step = resultList.eContainer() as? SmlStep ?: return emptyList()

    return step.yieldsOrEmpty().filter { it.result == this }
}
