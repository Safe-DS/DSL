package de.unibonn.simpleml.staticAnalysis

import de.unibonn.simpleml.emf.descendants
import de.unibonn.simpleml.emf.placeholdersOrEmpty
import de.unibonn.simpleml.simpleML.SmlAbstractObject
import de.unibonn.simpleml.simpleML.SmlAbstractStatement
import de.unibonn.simpleml.simpleML.SmlAssignment
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlPlaceholder
import de.unibonn.simpleml.simpleML.SmlReference

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
