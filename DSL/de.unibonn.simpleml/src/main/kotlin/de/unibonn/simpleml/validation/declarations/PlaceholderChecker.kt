package de.unibonn.simpleml.validation.declarations

import de.unibonn.simpleml.emf.closestAncestorOrNull
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import de.unibonn.simpleml.simpleML.SmlAssignment
import de.unibonn.simpleml.simpleML.SmlBlock
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlEnum
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlParameter
import de.unibonn.simpleml.simpleML.SmlPlaceholder
import de.unibonn.simpleml.simpleML.SmlReference
import de.unibonn.simpleml.staticAnalysis.assignedOrNull
import de.unibonn.simpleml.staticAnalysis.usesIn
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check

class PlaceholderChecker : AbstractSimpleMLChecker() {

    @Check
    fun renamingOfDeclaration(smlPlaceholder: SmlPlaceholder) {
        val assigned = smlPlaceholder.assignedOrNull()
        if (assigned is SmlReference) {
            val declaration = assigned.declaration
            if (declaration is SmlClass || declaration is SmlEnum || declaration is SmlFunction || declaration is SmlParameter || declaration is SmlPlaceholder)
                warning(
                    "This placeholder only provides another name for a declaration.",
                    Literals.SML_ABSTRACT_DECLARATION__NAME,
                    WarningCode.PlaceholderIsRenamingOfDeclaration
                )
        }
    }

    @Check
    fun unused(smlPlaceholder: SmlPlaceholder) {
        val block = smlPlaceholder.closestAncestorOrNull<SmlBlock>() ?: return
        val assignment = smlPlaceholder.closestAncestorOrNull<SmlAssignment>() ?: return
        if (assignment != block.statements.lastOrNull() && smlPlaceholder.usesIn(block).none()) {
            warning(
                "This placeholder is unused.",
                Literals.SML_ABSTRACT_DECLARATION__NAME,
                WarningCode.UnusedPlaceholder
            )
        }
    }
}
