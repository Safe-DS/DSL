package com.larsreimann.safeds.validation.other

import com.larsreimann.safeds.emf.argumentsOrEmpty
import com.larsreimann.safeds.emf.isRequired
import com.larsreimann.safeds.emf.isResolved
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.targetOrNull
import com.larsreimann.safeds.naming.qualifiedNameOrNull
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
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
import com.larsreimann.safeds.staticAnalysis.linking.parametersOrNull
import com.larsreimann.safeds.staticAnalysis.partialEvaluation.toConstantExpressionOrNull
import com.larsreimann.safeds.stdlibAccess.StdlibAnnotations
import com.larsreimann.safeds.stdlibAccess.StdlibEnums.AnnotationTarget
import com.larsreimann.safeds.stdlibAccess.isPure
import com.larsreimann.safeds.stdlibAccess.pythonModuleOrNull
import com.larsreimann.safeds.stdlibAccess.pythonNameOrNull
import com.larsreimann.safeds.stdlibAccess.validTargets
import com.larsreimann.safeds.utils.duplicatesBy
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import com.larsreimann.safeds.validation.codes.WarningCode
import org.eclipse.xtext.validation.Check
import org.eclipse.xtext.validation.CheckType

class AnnotationCallChecker : AbstractSafeDSChecker() {

    @Check
    fun duplicateTargetInTargetAnnotation(sdsAnnotationCall: SdsAnnotationCall) {
        val annotation = sdsAnnotationCall.annotation
        if (!annotation.isResolved() || annotation.qualifiedNameOrNull() != StdlibAnnotations.Target) {
            return
        }

        sdsAnnotationCall
            .argumentsOrEmpty()
            .map { it.value }
            .filterIsInstance<SdsMemberAccess>()
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
    fun missingArgumentList(sdsAnnotationCall: SdsAnnotationCall) {
        if (sdsAnnotationCall.argumentList != null) {
            return
        }

        val annotation = sdsAnnotationCall.annotation
        if (!annotation.isResolved()) {
            return
        }

        val parameters = sdsAnnotationCall.annotation.parametersOrEmpty()
        if (parameters.any { it.isRequired() }) {
            error(
                "Missing argument list.",
                Literals.SDS_ANNOTATION_CALL__ANNOTATION,
                ErrorCode.MISSING_ARGUMENT_LIST
            )
        }
    }

    @Check
    fun target(sdsAnnotationCall: SdsAnnotationCall) {

        // Get target of annotation use
        val actualTarget = sdsAnnotationCall.targetOrNull() ?: return

        // Get legal targets of used annotation
        val annotation = sdsAnnotationCall.annotation
        if (!annotation.isResolved()) {
            return
        }

        val legalTargets = annotation.validTargets()

        // Compare actual and legal targets
        val wrongTarget: String? = when {
            actualTarget is SdsAnnotation && AnnotationTarget.Annotation !in legalTargets -> {
                "an annotation"
            }
            actualTarget is SdsAttribute && AnnotationTarget.Attribute !in legalTargets -> {
                "an attribute"
            }
            actualTarget is SdsClass && AnnotationTarget.Class !in legalTargets -> {
                "a class"
            }
            actualTarget is SdsCompilationUnit && AnnotationTarget.CompilationUnit !in legalTargets -> {
                "a compilation unit"
            }
            actualTarget is SdsEnum && AnnotationTarget.Enum !in legalTargets -> {
                "an enum"
            }
            actualTarget is SdsEnumVariant && AnnotationTarget.EnumVariant !in legalTargets -> {
                "an enum variant"
            }
            actualTarget is SdsFunction && AnnotationTarget.Function !in legalTargets -> {
                "a function"
            }
            actualTarget is SdsParameter && AnnotationTarget.Parameter !in legalTargets -> {
                "a parameter"
            }
            actualTarget is SdsResult && AnnotationTarget.Result !in legalTargets -> {
                "a result"
            }
            actualTarget is SdsTypeParameter && AnnotationTarget.TypeParameter !in legalTargets -> {
                "a type parameter"
            }
            actualTarget is SdsWorkflow && AnnotationTarget.Workflow !in legalTargets -> {
                "a workflow"
            }
            actualTarget is SdsStep && AnnotationTarget.Step !in legalTargets -> {
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
    fun unnecessaryArgumentList(sdsAnnotationCall: SdsAnnotationCall) {
        if (sdsAnnotationCall.argumentList == null || sdsAnnotationCall.argumentsOrEmpty().isNotEmpty()) {
            return
        }

        val parametersOrNull = sdsAnnotationCall.argumentList.parametersOrNull()
        if (parametersOrNull != null && parametersOrNull.none { it.isRequired() }) {
            info(
                "Unnecessary argument list.",
                Literals.SDS_ABSTRACT_CALL__ARGUMENT_LIST,
                InfoCode.UnnecessaryArgumentList
            )
        }
    }

    @Check(CheckType.NORMAL)
    fun argumentsMustBeConstant(sdsAnnotationCall: SdsAnnotationCall) {
        sdsAnnotationCall.argumentsOrEmpty().forEach {
            if (it.value?.toConstantExpressionOrNull() == null) {
                error(
                    "Arguments in annotation call must be constant.",
                    it,
                    Literals.SDS_ARGUMENT__VALUE,
                    ErrorCode.MustBeConstant
                )
            }
        }
    }

    @Check
    fun pureImpliesNoSideEffects(sdsAnnotationCall: SdsAnnotationCall) {
        if (sdsAnnotationCall.annotation.qualifiedNameOrNull() != StdlibAnnotations.NoSideEffects) {
            return
        }

        val target = sdsAnnotationCall.targetOrNull() ?: return
        if (target is SdsFunction && target.isPure()) {
            info(
                "Purity implies absence of side effects (remove this annotation call).",
                null,
                InfoCode.PureImpliesNoSideEffects
            )
        }
    }

    @Check
    fun identicalPythonModule(sdsAnnotationCall: SdsAnnotationCall) {
        if (sdsAnnotationCall.annotation.qualifiedNameOrNull() != StdlibAnnotations.PythonModule) {
            return
        }

        val target = sdsAnnotationCall.targetOrNull() as? SdsCompilationUnit ?: return
        if (target.name == target.pythonModuleOrNull()) {
            info(
                "Python module is identical to Safe-DS package (can remove annotation call).",
                null,
                InfoCode.IdenticalPythonModule
            )
        }
    }

    @Check
    fun identicalPythonName(sdsAnnotationCall: SdsAnnotationCall) {
        if (sdsAnnotationCall.annotation.qualifiedNameOrNull() != StdlibAnnotations.PythonName) {
            return
        }

        val target = sdsAnnotationCall.targetOrNull() ?: return
        if (target.name == target.pythonNameOrNull()) {
            info(
                "Python name is identical to Safe-DS name (can remove annotation call).",
                null,
                InfoCode.IdenticalPythonName
            )
        }
    }
}
