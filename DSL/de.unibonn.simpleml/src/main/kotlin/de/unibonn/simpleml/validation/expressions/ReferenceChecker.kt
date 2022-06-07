package de.unibonn.simpleml.validation.expressions

import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import de.unibonn.simpleml.simpleML.SmlAbstractChainedExpression
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlEnum
import de.unibonn.simpleml.simpleML.SmlMemberAccess
import de.unibonn.simpleml.simpleML.SmlReference
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.validation.Check

class ReferenceChecker : AbstractSimpleMLChecker() {

    @Check
    fun mustNotStaticallyReferenceClass(smlReference: SmlReference) {
        val declaration = smlReference.declaration
        if (declaration !is SmlClass || declaration.parameterList != null) {
            return
        }

        // Reference must eventually be the receiver of a chained expression
        var previous: EObject = smlReference
        var current: EObject = previous.eContainer()
        while (current is SmlAbstractChainedExpression) {
            if (current.receiver == previous) {
                return
            }
            previous = current
            current = current.eContainer()
        }

        error(
            "Must not statically reference class.",
            Literals.SML_REFERENCE__DECLARATION,
            ErrorCode.MustNotStaticallyReferenceClass
        )
    }

    @Check
    fun mustNotStaticallyReferenceEnum(smlReference: SmlReference) {
        if (smlReference.declaration !is SmlEnum) {
            return
        }

        // Reference must eventually be the receiver of a member access
        var previous: EObject = smlReference
        var current: EObject = previous.eContainer()
        while (current is SmlMemberAccess) {
            if (current.receiver == previous) {
                return
            }
            previous = current
            current = current.eContainer()
        }

        error(
            "Must not statically reference enum.",
            Literals.SML_REFERENCE__DECLARATION,
            ErrorCode.MustNotStaticallyReferenceEnum
        )
    }
}
