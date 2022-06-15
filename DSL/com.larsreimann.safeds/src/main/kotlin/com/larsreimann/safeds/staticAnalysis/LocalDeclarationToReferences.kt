package com.larsreimann.safeds.staticAnalysis

import de.unibonn.simpleml.emf.descendants
import de.unibonn.simpleml.emf.placeholdersOrEmpty
import com.larsreimann.safeds.safeDS.SdsAbstractObject
import com.larsreimann.safeds.safeDS.SdsAbstractStatement
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsReference

fun SmlParameter.usesIn(obj: SmlAbstractObject): Sequence<SmlReference> {
    return obj
        .descendants<SmlReference>()
        .filter { it.declaration == this }
}

fun SmlPlaceholder.usesIn(obj: SmlAbstractObject): Sequence<SmlReference> {
    return obj
        .descendants<SmlAbstractStatement>()
        .dropWhile { it !is SmlAssignment || this !in it.placeholdersOrEmpty() }
        .drop(1)
        .flatMap { it.descendants<SmlReference>() }
        .filter { it.declaration == this }
}
