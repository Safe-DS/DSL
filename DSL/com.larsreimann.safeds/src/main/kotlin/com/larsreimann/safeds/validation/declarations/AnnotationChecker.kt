package com.larsreimann.safeds.validation.declarations

import com.google.errorprone.annotations.Var
import com.larsreimann.safeds.emf.isConstant
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.staticAnalysis.typing.ClassType
import com.larsreimann.safeds.staticAnalysis.typing.EnumType
import com.larsreimann.safeds.staticAnalysis.typing.VariadicType
import com.larsreimann.safeds.staticAnalysis.typing.type
import com.larsreimann.safeds.stdlibAccess.StdlibClasses
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class AnnotationChecker : AbstractSafeDSChecker() {

    @Check
    fun uniqueNames(sdsAnnotation: SdsAnnotation) {
        sdsAnnotation.parametersOrEmpty().reportDuplicateNames {
            "A parameter with name '${it.name}' exists already in this annotation."
        }
    }

    @Check
    fun unnecessaryParameterList(sdsAnnotation: SdsAnnotation) {
        if (sdsAnnotation.parameterList != null && sdsAnnotation.parametersOrEmpty().isEmpty()) {
            info(
                "Unnecessary parameter list.",
                Literals.SDS_ABSTRACT_CALLABLE__PARAMETER_LIST,
                InfoCode.UnnecessaryParameterList
            )
        }
    }

    private val validParameterTypes = setOf(
        StdlibClasses.Boolean,
        StdlibClasses.Float,
        StdlibClasses.Int,
        StdlibClasses.String,
    )

    @Check
    fun parameterTypes(sdsAnnotation: SdsAnnotation) {
        sdsAnnotation.parametersOrEmpty().forEach {
            val unwrappedParameterType = when (val parameterType = it.type()) {
                is VariadicType -> parameterType.elementType
                else -> parameterType
            }

            val isValid = when (unwrappedParameterType) {
                is ClassType -> unwrappedParameterType.qualifiedName in validParameterTypes
                is EnumType -> unwrappedParameterType.sdsEnum.isConstant()
                else -> false
            }

            if (!isValid) {
                error(
                    "Parameters of annotations must have type Boolean, Float, Int, String, or a constant enum.",
                    it,
                    Literals.SDS_PARAMETER__TYPE,
                    ErrorCode.UnsupportedAnnotationParameterType
                )
            }
        }
    }
}
