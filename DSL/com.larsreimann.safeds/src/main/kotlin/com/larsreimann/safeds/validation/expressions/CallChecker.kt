package com.larsreimann.safeds.validation.expressions

import com.larsreimann.safeds.emf.argumentsOrEmpty
import com.larsreimann.safeds.emf.parametersOrEmpty
import com.larsreimann.safeds.emf.typeArgumentsOrEmpty
import com.larsreimann.safeds.emf.typeParametersOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSPackage.Literals
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsExpressionStatement
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsMemberAccess
import com.larsreimann.safeds.staticAnalysis.CallableResult
import com.larsreimann.safeds.staticAnalysis.callableOrNull
import com.larsreimann.safeds.staticAnalysis.isRecursive
import com.larsreimann.safeds.staticAnalysis.maybeCallable
import com.larsreimann.safeds.staticAnalysis.resultsOrNull
import com.larsreimann.safeds.validation.AbstractSafeDSChecker
import com.larsreimann.safeds.validation.codes.ErrorCode
import com.larsreimann.safeds.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class CallChecker : AbstractSafeDSChecker() {

    @Check
    fun missingTypeArgumentList(sdsCall: SdsCall) {
        if (sdsCall.typeArgumentList != null) {
            return
        }

        val typeParameters = when (val callable = sdsCall.callableOrNull()) {
            is SdsClass -> callable.typeParametersOrEmpty()
            is SdsEnumVariant -> callable.typeParametersOrEmpty()
            is SdsFunction -> callable.typeParametersOrEmpty()
            else -> return
        }

        if (typeParameters.isNotEmpty()) {
            error(
                "Missing type argument list.",
                Literals.SDS_ABSTRACT_CHAINED_EXPRESSION__RECEIVER,
                ErrorCode.MISSING_TYPE_ARGUMENT_LIST,
            )
        }
    }

    @Check
    fun context(sdsCall: SdsCall) {
        val results = sdsCall.resultsOrNull() ?: return
        val source = when (sdsCall.receiver) {
            is SdsMemberAccess -> sdsCall.receiver
            else -> sdsCall
        }
        val feature = when (sdsCall.receiver) {
            is SdsMemberAccess -> Literals.SDS_MEMBER_ACCESS__MEMBER
            else -> Literals.SDS_ABSTRACT_CHAINED_EXPRESSION__RECEIVER
        }

        if (results.isEmpty() && !sdsCall.hasValidContextForCallWithoutResults()) {
            error(
                "A call that produces no results is not allowed in this context.",
                source,
                feature,
                ErrorCode.CONTEXT_OF_CALL_WITHOUT_RESULTS,
            )
        } else if (results.size > 1 && !sdsCall.hasValidContextForCallWithMultipleResults()) {
            error(
                "A call that produces multiple results is not allowed in this context.",
                source,
                feature,
                ErrorCode.CONTEXT_OF_CALL_WITH_MANY_RESULTS,
            )
        }
    }

    private fun SdsCall.hasValidContextForCallWithoutResults(): Boolean {
        val context = this.eContainer()
        return context is SdsExpressionStatement
    }

    private fun SdsCall.hasValidContextForCallWithMultipleResults(): Boolean {
        val context = this.eContainer()
        return context is SdsAssignment || context is SdsExpressionStatement || context is SdsMemberAccess
    }

    @Check
    fun recursion(sdsCall: SdsCall) {
        if (sdsCall.isRecursive()) {
            error(
                "Recursive calls are not allowed.",
                Literals.SDS_ABSTRACT_CHAINED_EXPRESSION__RECEIVER,
                ErrorCode.NO_RECURSION,
            )
        }
    }

    @Check
    fun receiver(sdsCall: SdsCall) {
        when (val maybeCallable = maybeCallable(sdsCall)) {
            CallableResult.NotCallable -> {
                error(
                    "This expression must not be called.",
                    Literals.SDS_ABSTRACT_CHAINED_EXPRESSION__RECEIVER,
                    ErrorCode.RECEIVER_MUST_BE_CALLABLE,
                )
            }
            is CallableResult.Callable -> {
                val callable = maybeCallable.callable
                if (callable is SdsClass && callable.parameterList == null) {
                    error(
                        "Cannot create an instance of a class that has no constructor.",
                        Literals.SDS_ABSTRACT_CHAINED_EXPRESSION__RECEIVER,
                        ErrorCode.CALLED_CLASS_MUST_HAVE_CONSTRUCTOR,
                    )
                }
            }
            else -> {}
        }
    }

    @Check
    fun unnecessaryArgumentList(sdsCall: SdsCall) {
        // Call has no argument list anyway
        if (sdsCall.argumentList == null) {
            return
        }

        // Call is used to pass type arguments or arguments
        if (sdsCall.typeArgumentsOrEmpty().isNotEmpty() || sdsCall.argumentsOrEmpty().isNotEmpty()) {
            return
        }

        // Receiver is not callable or cannot be resolved
        val callable = sdsCall.callableOrNull() ?: return

        // Only calls to enum variants can sometimes be omitted without changing the meaning of the program
        if (callable !is SdsEnumVariant) {
            return
        }

        // This enum variant does not need to be called
        if (callable.typeParametersOrEmpty().isEmpty() && callable.parametersOrEmpty().isEmpty()) {
            info(
                "Unnecessary argument list.",
                Literals.SDS_ABSTRACT_CALL__ARGUMENT_LIST,
                InfoCode.UnnecessaryArgumentList,
            )
        }
    }
}
