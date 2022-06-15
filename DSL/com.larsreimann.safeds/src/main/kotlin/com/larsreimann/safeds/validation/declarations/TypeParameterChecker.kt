package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.constant.SdsKind
import com.larsreimann.safeds.constant.SdsVariance
import com.larsreimann.safeds.constant.kind
import com.larsreimann.safeds.constant.variance
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class TypeParameterChecker : AbstractSafeDSChecker() {

    @Check
    fun mustNotHaveVarianceAndKind(smlTypeParameter: SdsTypeParameter) {
        if (smlTypeParameter.variance() != SdsVariance.Invariant && smlTypeParameter.kind() != SdsKind.NoKind) {
            error(
                "Can not use variance and kind together",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                ErrorCode.VarianceAndKind
            )
        }
    }
}
