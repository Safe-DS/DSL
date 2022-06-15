package com.larsreimann.safeds.validation.expressions

import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.typeParametersOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsMemberAccess
import com.larsreimann.safeds.staticAnalysis.typing.NamedType
import com.larsreimann.safeds.staticAnalysis.typing.type
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class MemberAccessChecker : AbstractSafeDSChecker() {

    @Check
    fun mustBeCalled(smlMemberAccess: SdsMemberAccess) {
        when (val member = smlMemberAccess.member.declaration) {
            is SdsFunction -> {
                if (!member.isStatic && smlMemberAccess.eContainer() !is SdsCall) {
                    error(
                        "An instance method must be called.",
                        Literals.SDS_MEMBER_ACCESS__MEMBER,
                        ErrorCode.INSTANCE_METHOD_MUST_BE_CALLED
                    )
                }
            }
            is SdsEnumVariant -> {
                val mustBeInstantiated =
                    member.typeParametersOrEmpty().isNotEmpty() || member.parametersOrEmpty().isNotEmpty()
                if (mustBeInstantiated && smlMemberAccess.eContainer() !is SdsCall) {
                    error(
                        "An enum variant with parameters or type parameters must be instantiated.",
                        Literals.SDS_MEMBER_ACCESS__MEMBER,
                        ErrorCode.ENUM_VARIANT_MUST_BE_INSTANTIATED
                    )
                }
            }
        }
    }

    @Check
    fun unnecessarySafeAccess(smlMemberAccess: SdsMemberAccess) {
        val type = smlMemberAccess.receiver.type()

        if (smlMemberAccess.isNullSafe) {
            if (!(type is NamedType && type.isNullable)) {
                info(
                    "The receiver is never null so the safe access is unnecessary.",
                    null,
                    InfoCode.UnnecessarySafeAccess
                )
            }
        } else {
            if (type is NamedType && type.isNullable) {
                error(
                    "The receiver can be null so a safe access must be used.",
                    null,
                    ErrorCode.MissingSafeAccess
                )
            }
        }
    }
}
