package com.larsreimann.safeds.validation.other

import de.unibonn.simpleml.emf.argumentsOrEmpty
import de.unibonn.simpleml.emf.isRequired
import de.unibonn.simpleml.emf.isResolved
import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.targetOrNull
import de.unibonn.simpleml.naming.qualifiedNameOrNull
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.safeDS.SdsAnnotationCall
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsMemberAccess
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import com.larsreimann.safeds.safeDS.SdsWorkflow
import de.unibonn.simpleml.staticAnalysis.linking.parametersOrNull
import de.unibonn.simpleml.staticAnalysis.partialEvaluation.toConstantExpressionOrNull
import de.unibonn.simpleml.stdlibAccess.StdlibAnnotations
import de.unibonn.simpleml.stdlibAccess.StdlibEnums.AnnotationTarget
import de.unibonn.simpleml.stdlibAccess.isPure
import de.unibonn.simpleml.stdlibAccess.pythonModuleOrNull
import de.unibonn.simpleml.stdlibAccess.pythonNameOrNull
import de.unibonn.simpleml.stdlibAccess.validTargets
import de.unibonn.simpleml.utils.duplicatesBy
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import de.unibonn.simpleml.validation.codes.InfoCode
import de.unibonn.simpleml.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class AnnotationCallChecker : AbstractSimpleMLChecker() {

    @Check
    fun duplicateTargetInTargetAnnotation(smlAnnotationCall: SmlAnnotationCall) {
        val annotation = smlAnnotationCall.annotation
        if (!annotation.isResolved() || annotation.qualifiedNameOrNull() != StdlibAnnotations.Target) {
            return
        }

        smlAnnotationCall
            .argumentsOrEmpty()
            .map { it.value }
            .filterIsInstance<SmlMemberAccess>()
            .duplicatesBy { it.member.declaration.qualifiedNameOrNull() }
            .forEach {
                warning(
                    "This annotation target is used multiple times.",
                    it,
                    null,
                    WarningCode.DuplicateTarget
                )
            }
    }

    @Check
    fun missingArgumentList(smlAnnotationCall: SmlAnnotationCall) {
        if (smlAnnotationCall.argumentList != null) {
            return
        }

        val annotation = smlAnnotationCall.annotation
        if (!annotation.isResolved()) {
            return
        }

        val parameters = smlAnnotationCall.annotation.parametersOrEmpty()
        if (parameters.any { it.isRequired() }) {
            error(
                "Missing argument list.",
                Literals.SML_ANNOTATION_CALL__ANNOTATION,
                ErrorCode.MISSING_ARGUMENT_LIST
            )
        }
    }

    @Check
    fun target(smlAnnotationCall: SmlAnnotationCall) {

        // Get target of annotation use
        val actualTarget = smlAnnotationCall.targetOrNull() ?: return

        // Get legal targets of used annotation
        val annotation = smlAnnotationCall.annotation
        if (!annotation.isResolved()) {
            return
        }

        val legalTargets = annotation.validTargets()

        // Compare actual and legal targets
        val wrongTarget: String? = when {
            actualTarget is SmlAnnotation && AnnotationTarget.Annotation !in legalTargets -> {
                "an annotation"
            }
            actualTarget is SmlAttribute && AnnotationTarget.Attribute !in legalTargets -> {
                "an attribute"
            }
            actualTarget is SmlClass && AnnotationTarget.Class !in legalTargets -> {
                "a class"
            }
            actualTarget is SmlCompilationUnit && AnnotationTarget.CompilationUnit !in legalTargets -> {
                "a compilation unit"
            }
            actualTarget is SmlEnum && AnnotationTarget.Enum !in legalTargets -> {
                "an enum"
            }
            actualTarget is SmlEnumVariant && AnnotationTarget.EnumVariant !in legalTargets -> {
                "an enum variant"
            }
            actualTarget is SmlFunction && AnnotationTarget.Function !in legalTargets -> {
                "a function"
            }
            actualTarget is SmlParameter && AnnotationTarget.Parameter !in legalTargets -> {
                "a parameter"
            }
            actualTarget is SmlResult && AnnotationTarget.Result !in legalTargets -> {
                "a result"
            }
            actualTarget is SmlTypeParameter && AnnotationTarget.TypeParameter !in legalTargets -> {
                "a type parameter"
            }
            actualTarget is SmlWorkflow && AnnotationTarget.Workflow !in legalTargets -> {
                "a workflow"
            }
            actualTarget is SmlStep && AnnotationTarget.Step !in legalTargets -> {
                "a step"
            }
            else -> null
        }

        // Show error
        if (wrongTarget != null) {
            error(
                "This annotation cannot be applied to $wrongTarget.",
                null,
                ErrorCode.WRONG_TARGET
            )
        }
    }

    @Check
    fun unnecessaryArgumentList(smlAnnotationCall: SmlAnnotationCall) {
        if (smlAnnotationCall.argumentList == null || smlAnnotationCall.argumentsOrEmpty().isNotEmpty()) {
            return
        }

        val parametersOrNull = smlAnnotationCall.argumentList.parametersOrNull()
        if (parametersOrNull != null && parametersOrNull.none { it.isRequired() }) {
            info(
                "Unnecessary argument list.",
                Literals.SML_ABSTRACT_CALL__ARGUMENT_LIST,
                InfoCode.UnnecessaryArgumentList
            )
        }
    }

    @Check(CheckType.NORMAL)
    fun argumentsMustBeConstant(smlAnnotationCall: SmlAnnotationCall) {
        smlAnnotationCall.argumentsOrEmpty().forEach {
            if (it.value?.toConstantExpressionOrNull() == null) {
                error(
                    "Arguments in annotation call must be constant.",
                    it,
                    Literals.SML_ARGUMENT__VALUE,
                    ErrorCode.MustBeConstant
                )
            }
        }
    }

    @Check
    fun pureImpliesNoSideEffects(smlAnnotationCall: SmlAnnotationCall) {
        if (smlAnnotationCall.annotation.qualifiedNameOrNull() != StdlibAnnotations.NoSideEffects) {
            return
        }

        val target = smlAnnotationCall.targetOrNull() ?: return
        if (target is SmlFunction && target.isPure()) {
            info(
                "Purity implies absence of side effects (remove this annotation call).",
                null,
                InfoCode.PureImpliesNoSideEffects
            )
        }
    }

    @Check
    fun identicalPythonModule(smlAnnotationCall: SmlAnnotationCall) {
        if (smlAnnotationCall.annotation.qualifiedNameOrNull() != StdlibAnnotations.PythonModule) {
            return
        }

        val target = smlAnnotationCall.targetOrNull() as? SmlCompilationUnit ?: return
        if (target.name == target.pythonModuleOrNull()) {
            info(
                "Python module is identical to Simple-ML package (can remove annotation call).",
                null,
                InfoCode.IdenticalPythonModule
            )
        }
    }

    @Check
    fun identicalPythonName(smlAnnotationCall: SmlAnnotationCall) {
        if (smlAnnotationCall.annotation.qualifiedNameOrNull() != StdlibAnnotations.PythonName) {
            return
        }

        val target = smlAnnotationCall.targetOrNull() ?: return
        if (target.name == target.pythonNameOrNull()) {
            info(
                "Python name is identical to Simple-ML name (can remove annotation call).",
                null,
                InfoCode.IdenticalPythonName
            )
        }
    }
}
