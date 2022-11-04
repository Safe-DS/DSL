package com.larsreimann.safeds.validation.other

import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAbstractAssignee
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAnnotationCall
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.safeDS.SdsTypeArgument
import com.larsreimann.safeds.safeDS.SdsWildcard
import com.larsreimann.safeds.staticAnalysis.assignedOrNull
import com.larsreimann.safeds.staticAnalysis.linking.parameterOrNull
import com.larsreimann.safeds.staticAnalysis.linking.typeParameterOrNull
import com.larsreimann.safeds.stdlibAccess.isExperimental
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check

class ExperimentalChecker : AbstractSafeDSChecker() {

    @Check
    fun annotationUseReferenceExperimentalAnnotation(sdsAnnotationCall: SdsAnnotationCall) {
        val annotation = sdsAnnotationCall.annotation ?: return
        if (annotation.isExperimental()) {
            warning(
                "The used annotation is experimental.",
                Literals.SDS_ANNOTATION_CALL__ANNOTATION,
                WarningCode.ReferencedDeclarationIsExperimental,
            )
        }
    }

    @Check
    fun assigneeAssignedToExperimentalValue(sdsAssignee: SdsAbstractAssignee) {
        if (sdsAssignee is SdsWildcard) {
            return
        }

        val assigned = sdsAssignee.assignedOrNull() ?: return
        if (assigned is SdsAbstractDeclaration && assigned.isExperimental()) {
            warning(
                "The assigned declaration is experimental.",
                null,
                WarningCode.AssignedDeclarationIsExperimental,
            )
        }
    }

    @Check
    fun argumentReferencesExperimentalParameter(sdsArgument: SdsArgument) {
        val parameter = sdsArgument.parameterOrNull() ?: return
        if (parameter.isExperimental()) {
            warning(
                "The corresponding parameter is experimental.",
                null,
                WarningCode.CorrespondingParameterIsExperimental,
            )
        }
    }

    @Check
    fun namedTypeReferencesExperimentalDeclaration(sdsNamedType: SdsNamedType) {
        val declaration = sdsNamedType.declaration ?: return
        if (declaration.isExperimental()) {
            warning(
                "The referenced declaration is experimental.",
                Literals.SDS_NAMED_TYPE__DECLARATION,
                WarningCode.ReferencedDeclarationIsExperimental,
            )
        }
    }

    @Check
    fun referenceReferencesExperimentalDeclaration(sdsReference: SdsReference) {
        val declaration = sdsReference.declaration ?: return
        if (declaration !is SdsParameter && declaration.isExperimental()) {
            warning(
                "The referenced declaration is experimental.",
                Literals.SDS_REFERENCE__DECLARATION,
                WarningCode.ReferencedDeclarationIsExperimental,
            )
        }
    }

    @Check
    fun typeArgumentReferencesExperimentalTypeParameter(sdsTypeArgument: SdsTypeArgument) {
        val typeParameter = sdsTypeArgument.typeParameterOrNull() ?: return
        if (typeParameter.isExperimental()) {
            warning(
                "The corresponding type parameter is experimental.",
                null,
                WarningCode.CorrespondingTypeParameterIsExperimental,
            )
        }
    }
}
