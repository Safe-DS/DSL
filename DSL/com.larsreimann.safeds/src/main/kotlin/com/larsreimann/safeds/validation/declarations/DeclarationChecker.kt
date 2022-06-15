package com.larsreimann.safeds.validation.declarations

import com.larsreimann.safeds.emf.annotationCallsOrEmpty
import com.larsreimann.safeds.emf.isRequired
import com.larsreimann.safeds.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.stdlibAccess.StdlibAnnotations
import com.larsreimann.safeds.stdlibAccess.isRepeatable
import com.larsreimann.safeds.utils.duplicatesBy
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import org.eclipse.xtext.validation.Check

class DeclarationChecker : AbstractSafeDSChecker() {

    @Check
    fun annotationCardinality(smlDeclaration: SdsAbstractDeclaration) {
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
    fun mustNotDeprecateRequiredParameter(smlParameter: SdsParameter) {
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
