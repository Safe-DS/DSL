package com.larsreimann.safeds.staticAnalysis

import com.larsreimann.safeds.emf.descendants
import com.larsreimann.safeds.emf.placeholdersOrEmpty
import com.larsreimann.safeds.safeDS.SdsAbstractObject
import com.larsreimann.safeds.safeDS.SdsAbstractStatement
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsReference

fun SdsParameter.usesIn(obj: SdsAbstractObject): Sequence<SdsReference> {
    return obj
        .descendants<SdsReference>()
        .filter { it.declaration == this }
}

fun SdsPlaceholder.usesIn(obj: SdsAbstractObject): Sequence<SdsReference> {
    return obj
        .descendants<SdsAbstractStatement>()
        .dropWhile { it !is SdsAssignment || this !in it.placeholdersOrEmpty() }
        .drop(1)
        .flatMap { it.descendants<SdsReference>() }
        .filter { it.declaration == this }
}
