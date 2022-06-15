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
import com.larsreimann.safeds.stdlibAccess.isDeprecated
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check

class DeprecationChecker : AbstractSafeDSChecker() {

    @Check
    fun annotationUseReferenceDeprecatedAnnotation(sdsAnnotationCall: SdsAnnotationCall) {
        val annotation = sdsAnnotationCall.annotation ?: return
        if (annotation.isDeprecated()) {
            warning(
                "The used annotation is deprecated.",
                Literals.SDS_ANNOTATION_CALL__ANNOTATION,
                WarningCode.ReferencedDeclarationIsDeprecated
            )
        }
    }

    @Check
    fun assigneeAssignedToDeprecatedValue(sdsAssignee: SdsAbstractAssignee) {
        if (sdsAssignee is SdsWildcard) {
            return
        }

        val assigned = sdsAssignee.assignedOrNull() ?: return
        if (assigned is SdsAbstractDeclaration && assigned.isDeprecated()) {
            warning(
                "The assigned declaration is deprecated.",
                null,
                WarningCode.AssignedDeclarationIsDeprecated
            )
        }
    }

    @Check
    fun argumentReferencesDeprecatedParameter(sdsArgument: SdsArgument) {
        val parameter = sdsArgument.parameterOrNull() ?: return
        if (parameter.isDeprecated()) {
            warning(
                "The corresponding parameter is deprecated.",
                null,
                WarningCode.CorrespondingParameterIsDeprecated
            )
        }
    }

    @Check
    fun namedTypeReferencesDeprecatedDeclaration(sdsNamedType: SdsNamedType) {
        val declaration = sdsNamedType.declaration ?: return
        if (declaration.isDeprecated()) {
            warning(
                "The referenced declaration is deprecated.",
                Literals.SDS_NAMED_TYPE__DECLARATION,
                WarningCode.ReferencedDeclarationIsDeprecated
            )
        }
    }

    @Check
    fun referenceReferencesDeprecatedDeclaration(sdsReference: SdsReference) {
        val declaration = sdsReference.declaration ?: return
        if (declaration !is SdsParameter && declaration.isDeprecated()) {
            warning(
                "The referenced declaration is deprecated.",
                Literals.SDS_REFERENCE__DECLARATION,
                WarningCode.ReferencedDeclarationIsDeprecated
            )
        }
    }

    @Check
    fun typeArgumentReferencesDeprecatedTypeParameter(sdsTypeArgument: SdsTypeArgument) {
        val typeParameter = sdsTypeArgument.typeParameterOrNull() ?: return
        if (typeParameter.isDeprecated()) {
            warning(
                "The corresponding type parameter is deprecated.",
                null,
                WarningCode.CorrespondingTypeParameterIsDeprecated
            )
        }
    }
}
