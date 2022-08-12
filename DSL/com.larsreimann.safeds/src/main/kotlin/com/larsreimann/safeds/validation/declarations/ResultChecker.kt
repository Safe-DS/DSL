package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.emf.closestAncestorOrNull
import com.larsreimann.safeds.emf.isSchemaType
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.safeDS.SdsPredicate
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsResultList
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class ResultChecker : AbstractSafeDSChecker() {

    @Check
    fun type(sdsResult: SdsResult) {
        if (sdsResult.type == null) {
            error(
                "A result must have a type.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                ErrorCode.ResultMustHaveType,
            )
        }
    }

    @OptIn(ExperimentalSdsApi::class)
    @Check
    fun onlyPredicatesCanHaveResultOfSchemaType(sdsResult: SdsResult) {
        val resultList = sdsResult.closestAncestorOrNull<SdsResultList>() ?: return

        val type = sdsResult.type
        if (type is SdsNamedType &&
            type.isSchemaType() &&
            resultList.eContainer() !is SdsPredicate
        ) {
            error(
                "Only predicates can have result of schema type.",
                Literals.SDS_RESULT__TYPE,
                ErrorCode.OnlyPredicatesCanHaveResultOfSchemaType,
            )
        }
    }

    @OptIn(ExperimentalSdsApi::class)
    @Check
    fun resultOfSchemaTypeMustOmitName(sdsResult: SdsResult) {
        val resultList = sdsResult.closestAncestorOrNull<SdsResultList>() ?: return

        val type = sdsResult.type
        if (type is SdsNamedType &&
            type.isSchemaType() &&
            resultList.eContainer() is SdsPredicate &&
            sdsResult.name != null
        ) {
            error(
                "A result of schema type must omit name.",
                Literals.SDS_ABSTRACT_DECLARATION__NAME,
                ErrorCode.SchemaTypeMustOmitName,
            )
        }
    }
}
