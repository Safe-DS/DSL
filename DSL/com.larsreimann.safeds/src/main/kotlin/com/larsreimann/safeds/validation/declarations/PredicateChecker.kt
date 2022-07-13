package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.constant.SdsSchemaEffect
import com.larsreimann.safeds.constant.nameToSchemaEffect
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsPredicate
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class PredicateChecker : AbstractSafeDSChecker() {

    @OptIn(ExperimentalSdsApi::class)
    @Check
    fun schemaEffectMustNotBeUsedAsDeclarationName(sdsPredicate: SdsPredicate) {
        if (sdsPredicate.nameToSchemaEffect() == SdsSchemaEffect.NoSchemaEffect &&
            sdsPredicate.goalList == null) {
            error(
                "Abstract predicates can only be declared for schema effects.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                ErrorCode.AbstractPredicatesNotAllowed
            )
        }
    }
}
