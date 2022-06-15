package com.larsreimann.safeds.validation.declarations

import com.google.errorprone.annotations.Var
import de.unibonn.simpleml.emf.isConstant
import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAnnotation
import de.unibonn.simpleml.staticAnalysis.typing.ClassType
import de.unibonn.simpleml.staticAnalysis.typing.EnumType
import de.unibonn.simpleml.staticAnalysis.typing.VariadicType
import de.unibonn.simpleml.staticAnalysis.typing.type
import de.unibonn.simpleml.stdlibAccess.StdlibClasses
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import de.unibonn.simpleml.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class AnnotationChecker : AbstractSimpleMLChecker() {

    @Check
    fun uniqueNames(smlAnnotation: SmlAnnotation) {
        smlAnnotation.parametersOrEmpty().reportDuplicateNames {
            "A parameter with name '${it.name}' exists already in this annotation."
        }
    }

    @Check
    fun unnecessaryParameterList(smlAnnotation: SmlAnnotation) {
        if (smlAnnotation.parameterList != null && smlAnnotation.parametersOrEmpty().isEmpty()) {
            info(
                "Unnecessary parameter list.",
                Literals.SML_ABSTRACT_CALLABLE__PARAMETER_LIST,
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
    fun parameterTypes(smlAnnotation: SmlAnnotation) {
        smlAnnotation.parametersOrEmpty().forEach {
            val unwrappedParameterType = when (val parameterType = it.type()) {
                is VariadicType -> parameterType.elementType
                else -> parameterType
            }

            val isValid = when (unwrappedParameterType) {
                is ClassType -> unwrappedParameterType.qualifiedName in validParameterTypes
                is EnumType -> unwrappedParameterType.smlEnum.isConstant()
                else -> false
            }

            if (!isValid) {
                error(
                    "Parameters of annotations must have type Boolean, Float, Int, String, or a constant enum.",
                    it,
                    Literals.SML_PARAMETER__TYPE,
                    ErrorCode.UnsupportedAnnotationParameterType
                )
            }
        }
    }
}
