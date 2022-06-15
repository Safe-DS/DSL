package com.larsreimann.safeds.validation.declarations

import de.unibonn.simpleml.emf.closestAncestorOrNull
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsBlock
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsReference
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
