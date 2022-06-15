package com.larsreimann.safeds.validation.declarations

import de.unibonn.simpleml.constant.SmlKind
import de.unibonn.simpleml.constant.SmlVariance
import de.unibonn.simpleml.constant.kind
import de.unibonn.simpleml.constant.variance
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class TypeParameterChecker : AbstractSimpleMLChecker() {

    @Check
    fun mustNotHaveVarianceAndKind(smlTypeParameter: SmlTypeParameter) {
        if (smlTypeParameter.variance() != SmlVariance.Invariant && smlTypeParameter.kind() != SmlKind.NoKind) {
            error(
                "Can not use variance and kind together",
                Literals.SML_ABSTRACT_DECLARATION__NAME,
                ErrorCode.VarianceAndKind
            )
        }
    }
}
