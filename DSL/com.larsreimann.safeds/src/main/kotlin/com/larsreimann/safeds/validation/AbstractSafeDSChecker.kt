package com.larsreimann.safeds.validation

import com.larsreimann.safeds.safeDS.SafeDSPackage
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.utils.duplicatesBy
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import com.larsreimann.safeds.validation.codes.WarningCode
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.EStructuralFeature
import org.eclipse.xtext.validation.EValidatorRegistrar

abstract class AbstractSafeDSChecker : AbstractSafeDSValidator() {
    override fun register(registrar: EValidatorRegistrar) {
        // This is overridden to prevent duplicate validation errors.
    }

    protected fun List<SdsAbstractDeclaration>.reportDuplicateNames(message: (SdsAbstractDeclaration) -> String) {
        this.duplicatesBy { it.name }
            .forEach {
                error(
                    message(it),
                    it,
                    SafeDSPackage.Literals.SDS_ABSTRACT_DECLARATION__NAME,
                    ErrorCode.REDECLARATION
                )
            }
    }

    fun error(message: String, feature: EStructuralFeature?, code: ErrorCode, vararg issueData: String) {
        super.error(message, feature, code.name, *issueData)
    }

    fun error(message: String, feature: EStructuralFeature?, index: Int, code: ErrorCode, vararg issueData: String) {
        super.error(message, feature, index, code.name, *issueData)
    }

    fun error(
        message: String,
        source: EObject,
        feature: EStructuralFeature?,
        code: ErrorCode,
        vararg issueData: String
    ) {
        super.error(message, source, feature, code.name, *issueData)
    }

    fun error(
        message: String,
        source: EObject,
        feature: EStructuralFeature?,
        index: Int,
        code: ErrorCode,
        vararg issueData: String
    ) {
        super.error(message, source, feature, index, code.name, *issueData)
    }

    fun warning(message: String, feature: EStructuralFeature?, code: WarningCode, vararg issueData: String) {
        super.warning(message, feature, code.name, *issueData)
    }

    fun warning(
        message: String,
        feature: EStructuralFeature?,
        index: Int,
        code: WarningCode,
        vararg issueData: String
    ) {
        super.warning(message, feature, index, code.name, *issueData)
    }

    fun warning(
        message: String,
        source: EObject,
        feature: EStructuralFeature?,
        code: WarningCode,
        vararg issueData: String
    ) {
        super.warning(message, source, feature, code.name, *issueData)
    }

    fun warning(
        message: String,
        source: EObject,
        feature: EStructuralFeature?,
        index: Int,
        code: WarningCode,
        vararg issueData: String
    ) {
        super.warning(message, source, feature, index, code.name, *issueData)
    }

    fun info(message: String, feature: EStructuralFeature?, code: InfoCode, vararg issueData: String) {
        super.info(message, feature, code.name, *issueData)
    }

    fun info(message: String, feature: EStructuralFeature?, index: Int, code: InfoCode, vararg issueData: String) {
        super.info(message, feature, index, code.name, *issueData)
    }

    fun info(message: String, source: EObject, feature: EStructuralFeature?, code: InfoCode, vararg issueData: String) {
        super.info(message, source, feature, code.name, *issueData)
    }

    fun info(
        message: String,
        source: EObject,
        feature: EStructuralFeature?,
        index: Int,
        code: InfoCode,
        vararg issueData: String
    ) {
        super.info(message, source, feature, index, code.name, *issueData)
    }
}
