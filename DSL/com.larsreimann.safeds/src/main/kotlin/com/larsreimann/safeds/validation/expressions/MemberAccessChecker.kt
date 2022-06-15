package com.larsreimann.safeds.validation.expressions

import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.typeParametersOrEmpty
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsMemberAccess
import de.unibonn.simpleml.staticAnalysis.typing.NamedType
import de.unibonn.simpleml.staticAnalysis.typing.type
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import de.unibonn.simpleml.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class MemberAccessChecker : AbstractSimpleMLChecker() {

    @Check
    fun mustBeCalled(smlMemberAccess: SmlMemberAccess) {
        when (val member = smlMemberAccess.member.declaration) {
            is SmlFunction -> {
                if (!member.isStatic && smlMemberAccess.eContainer() !is SmlCall) {
                    error(
                        "An instance method must be called.",
                        Literals.SML_MEMBER_ACCESS__MEMBER,
                        ErrorCode.INSTANCE_METHOD_MUST_BE_CALLED
                    )
                }
            }
            is SmlEnumVariant -> {
                val mustBeInstantiated =
                    member.typeParametersOrEmpty().isNotEmpty() || member.parametersOrEmpty().isNotEmpty()
                if (mustBeInstantiated && smlMemberAccess.eContainer() !is SmlCall) {
                    error(
                        "An enum variant with parameters or type parameters must be instantiated.",
                        Literals.SML_MEMBER_ACCESS__MEMBER,
                        ErrorCode.ENUM_VARIANT_MUST_BE_INSTANTIATED
                    )
                }
            }
        }
    }

    @Check
    fun unnecessarySafeAccess(smlMemberAccess: SmlMemberAccess) {
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
