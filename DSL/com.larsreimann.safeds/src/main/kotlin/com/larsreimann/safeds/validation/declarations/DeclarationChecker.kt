package com.larsreimann.safeds.validation.declarations

import de.unibonn.simpleml.emf.annotationCallsOrEmpty
import de.unibonn.simpleml.emf.isRequired
import de.unibonn.simpleml.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsParameter
import de.unibonn.simpleml.stdlibAccess.StdlibAnnotations
import de.unibonn.simpleml.stdlibAccess.isRepeatable
import de.unibonn.simpleml.utils.duplicatesBy
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class DeclarationChecker : AbstractSimpleMLChecker() {

    @Check
    fun annotationCardinality(smlDeclaration: SmlAbstractDeclaration) {
        smlDeclaration.annotationCallsOrEmpty()
            .filter { it.annotation != null && !it.annotation.eIsProxy() && !it.annotation.isRepeatable() }
            .duplicatesBy { it.annotation.qualifiedNameOrNull() }
            .forEach {
                error(
                    "This annotation can only be used once.",
                    it,
                    null,
                    ErrorCode.ANNOTATION_IS_SINGLE_USE
                )
            }
    }

    @Check
    fun mustNotDeprecateRequiredParameter(smlParameter: SmlParameter) {
        if (smlParameter.isRequired()) {
            val deprecatedAnnotationOrNull = smlParameter.annotationCallsOrEmpty().firstOrNull {
                it.annotation.qualifiedNameOrNull() == StdlibAnnotations.Deprecated
            }

            if (deprecatedAnnotationOrNull != null) {
                error(
                    "A required parameter cannot be deprecated.",
                    deprecatedAnnotationOrNull,
                    null,
                    ErrorCode.DEPRECATED_REQUIRED_PARAMETER
                )
            }
        }
    }
}
