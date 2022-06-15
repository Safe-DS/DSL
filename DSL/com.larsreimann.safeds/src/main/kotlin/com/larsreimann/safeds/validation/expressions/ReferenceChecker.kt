package com.larsreimann.safeds.validation.expressions

import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAbstractChainedExpression
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsMemberAccess
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.emf.ecore.EObject
import org.eclipse.xtext.validation.Check

class ReferenceChecker : AbstractSafeDSChecker() {

    @Check
    fun mustNotStaticallyReferenceClass(sdsReference: SdsReference) {
        val declaration = sdsReference.declaration
        if (declaration !is SdsClass || declaration.parameterList != null) {
            return
        }

        // Reference must eventually be the receiver of a chained expression
        var previous: EObject = sdsReference
        var current: EObject = previous.eContainer()
        while (current is SdsAbstractChainedExpression) {
            if (current.receiver == previous) {
                return
            }
            previous = current
            current = current.eContainer()
        }

        error(
            "Must not statically reference class.",
            Literals.SDS_REFERENCE__DECLARATION,
            ErrorCode.MustNotStaticallyReferenceClass
        )
    }

    @Check
    fun mustNotStaticallyReferenceEnum(sdsReference: SdsReference) {
        if (sdsReference.declaration !is SdsEnum) {
            return
        }

        // Reference must eventually be the receiver of a member access
        var previous: EObject = sdsReference
        var current: EObject = previous.eContainer()
        while (current is SdsMemberAccess) {
            if (current.receiver == previous) {
                return
            }
            previous = current
            current = current.eContainer()
        }

        error(
            "Must not statically reference enum.",
            Literals.SDS_REFERENCE__DECLARATION,
            ErrorCode.MustNotStaticallyReferenceEnum
        )
    }
}
