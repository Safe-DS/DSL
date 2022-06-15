package com.larsreimann.safeds.validation.other

import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAbstractAssignee
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAnnotationCall
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.safeDS.SdsTypeArgument
import com.larsreimann.safeds.safeDS.SdsWildcard
import de.unibonn.simpleml.staticAnalysis.assignedOrNull
import de.unibonn.simpleml.staticAnalysis.linking.parameterOrNull
import de.unibonn.simpleml.staticAnalysis.linking.typeParameterOrNull
import de.unibonn.simpleml.stdlibAccess.isDeprecated
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check

class DeprecationChecker : AbstractSimpleMLChecker() {

    @Check
    fun annotationUseReferenceDeprecatedAnnotation(smlAnnotationCall: SmlAnnotationCall) {
        val annotation = smlAnnotationCall.annotation ?: return
        if (annotation.isDeprecated()) {
            warning(
                "The used annotation is deprecated.",
                Literals.SML_ANNOTATION_CALL__ANNOTATION,
                WarningCode.ReferencedDeclarationIsDeprecated
            )
        }
    }

    @Check
    fun assigneeAssignedToDeprecatedValue(smlAssignee: SmlAbstractAssignee) {
        if (smlAssignee is SmlWildcard) {
            return
        }

        val assigned = smlAssignee.assignedOrNull() ?: return
        if (assigned is SmlAbstractDeclaration && assigned.isDeprecated()) {
            warning(
                "The assigned declaration is deprecated.",
                null,
                WarningCode.AssignedDeclarationIsDeprecated
            )
        }
    }

    @Check
    fun argumentReferencesDeprecatedParameter(smlArgument: SmlArgument) {
        val parameter = smlArgument.parameterOrNull() ?: return
        if (parameter.isDeprecated()) {
            warning(
                "The corresponding parameter is deprecated.",
                null,
                WarningCode.CorrespondingParameterIsDeprecated
            )
        }
    }

    @Check
    fun namedTypeReferencesDeprecatedDeclaration(smlNamedType: SmlNamedType) {
        val declaration = smlNamedType.declaration ?: return
        if (declaration.isDeprecated()) {
            warning(
                "The referenced declaration is deprecated.",
                Literals.SML_NAMED_TYPE__DECLARATION,
                WarningCode.ReferencedDeclarationIsDeprecated
            )
        }
    }

    @Check
    fun referenceReferencesDeprecatedDeclaration(smlReference: SmlReference) {
        val declaration = smlReference.declaration ?: return
        if (declaration !is SmlParameter && declaration.isDeprecated()) {
            warning(
                "The referenced declaration is deprecated.",
                Literals.SML_REFERENCE__DECLARATION,
                WarningCode.ReferencedDeclarationIsDeprecated
            )
        }
    }

    @Check
    fun typeArgumentReferencesDeprecatedTypeParameter(smlTypeArgument: SmlTypeArgument) {
        val typeParameter = smlTypeArgument.typeParameterOrNull() ?: return
        if (typeParameter.isDeprecated()) {
            warning(
                "The corresponding type parameter is deprecated.",
                null,
                WarningCode.CorrespondingTypeParameterIsDeprecated
            )
        }
    }
}
