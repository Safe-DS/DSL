package com.larsreimann.safeds.validation.types

import com.larsreimann.safeds.emf.typeArgumentsOrEmpty
import com.larsreimann.safeds.safeDS.SdsUnionType
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class UnionTypeChecker : AbstractSafeDSChecker() {

    @Check
    fun numberOfTypeArguments(sdsUnionType: SdsUnionType) {
        when (sdsUnionType.typeArgumentsOrEmpty().size) {
            0 -> {
                error(
                    "A union type must have least one type argument.",
                    null,
                    ErrorCode.UNION_TYPE_WITHOUT_TYPE_ARGUMENTS
                )
            }
            1 -> {
                info(
                    "A union type with one type argument is equivalent to the the type argument itself.",
                    null,
                    InfoCode.UnnecessaryUnionType
                )
            }
        }
    }
}
