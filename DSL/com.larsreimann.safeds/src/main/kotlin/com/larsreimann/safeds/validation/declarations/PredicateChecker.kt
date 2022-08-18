package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.constant.SdsSchemaEffect
import com.larsreimann.safeds.constant.nameToSchemaEffect
import com.larsreimann.safeds.emf.isAbstract
import com.larsreimann.safeds.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsPredicate
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class PredicateChecker : AbstractSafeDSChecker() {

    @OptIn(ExperimentalSdsApi::class)
    @Check
    fun abstractPredicatedOnlyAllowedForSchemaEffects(sdsPredicate: SdsPredicate) {
        if (sdsPredicate.isAbstract() &&
            sdsPredicate.nameToSchemaEffect() == SdsSchemaEffect.NoSchemaEffect
        ) {
            error(
                "Abstract predicates can only be declared for schema effects.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                ErrorCode.AbstractPredicatesOnlyAllowedForSchemaEffects,
            )
        }
    }

    @OptIn(ExperimentalSdsApi::class)
    @Check
    fun abstractPredicatedOnlyAllowedInStdlib(sdsPredicate: SdsPredicate) {
        if (sdsPredicate.isAbstract() &&
            !(sdsPredicate.qualifiedNameOrNull()?.toString()?.startsWith("safeds.lang") ?: false)
        ) {
            error(
                "Abstract predicates can only be declared in standard library.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                ErrorCode.AbstractPredicatesOnlyAllowedInStdlib,
            )
        }
    }
}
