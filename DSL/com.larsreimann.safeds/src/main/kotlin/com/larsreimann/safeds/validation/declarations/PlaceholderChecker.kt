package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.emf.closestAncestorOrNull
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsBlock
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.staticAnalysis.assignedOrNull
import com.larsreimann.safeds.staticAnalysis.usesIn
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check

class PlaceholderChecker : AbstractSafeDSChecker() {

    @Check
    fun renamingOfDeclaration(sdsPlaceholder: SdsPlaceholder) {
        val assigned = sdsPlaceholder.assignedOrNull()
        if (assigned is SdsReference) {
            val declaration = assigned.declaration
            if (declaration is SdsClass || declaration is SdsEnum || declaration is SdsFunction || declaration is SdsParameter || declaration is SdsPlaceholder)
                warning(
                    "This placeholder only provides another name for a declaration.",
                    Literals.SDS_ABSTRACT_DECLARATION__NAME,
                    WarningCode.PlaceholderIsRenamingOfDeclaration
                )
        }
    }

    @Check
    fun unused(sdsPlaceholder: SdsPlaceholder) {
        val block = sdsPlaceholder.closestAncestorOrNull<SdsBlock>() ?: return
        val assignment = sdsPlaceholder.closestAncestorOrNull<SdsAssignment>() ?: return
        if (assignment != block.statements.lastOrNull() && sdsPlaceholder.usesIn(block).none()) {
            warning(
                "This placeholder is unused.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                WarningCode.UnusedPlaceholder
            )
        }
    }
}
