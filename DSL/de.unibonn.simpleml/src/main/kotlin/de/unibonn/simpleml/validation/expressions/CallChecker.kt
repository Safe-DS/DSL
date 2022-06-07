package de.unibonn.simpleml.validation.expressions

import de.unibonn.simpleml.emf.argumentsOrEmpty
import de.unibonn.simpleml.emf.parametersOrEmpty
import de.unibonn.simpleml.emf.typeArgumentsOrEmpty
import de.unibonn.simpleml.emf.typeParametersOrEmpty
import de.unibonn.simpleml.simpleML.SimpleMLPackage.Literals
import de.unibonn.simpleml.simpleML.SmlAssignment
import de.unibonn.simpleml.simpleML.SmlCall
import de.unibonn.simpleml.simpleML.SmlClass
import de.unibonn.simpleml.simpleML.SmlEnumVariant
import de.unibonn.simpleml.simpleML.SmlExpressionStatement
import de.unibonn.simpleml.simpleML.SmlFunction
import de.unibonn.simpleml.simpleML.SmlMemberAccess
import de.unibonn.simpleml.staticAnalysis.CallableResult
import de.unibonn.simpleml.staticAnalysis.callableOrNull
import de.unibonn.simpleml.staticAnalysis.isRecursive
import de.unibonn.simpleml.staticAnalysis.maybeCallable
import de.unibonn.simpleml.staticAnalysis.resultsOrNull
import de.unibonn.simpleml.validation.AbstractSimpleMLChecker
import de.unibonn.simpleml.validation.codes.ErrorCode
import de.unibonn.simpleml.validation.codes.InfoCode
import org.eclipse.xtext.validation.Check

class CallChecker : AbstractSimpleMLChecker() {

    @Check
    fun missingTypeArgumentList(smlCall: SmlCall) {
        if (smlCall.typeArgumentList != null) {
            return
        }

        val typeParameters = when (val callable = smlCall.callableOrNull()) {
            is SmlClass -> callable.typeParametersOrEmpty()
            is SmlEnumVariant -> callable.typeParametersOrEmpty()
            is SmlFunction -> callable.typeParametersOrEmpty()
            else -> return
        }

        if (typeParameters.isNotEmpty()) {
            error(
                "Missing type argument list.",
                Literals.SML_ABSTRACT_CHAINED_EXPRESSION__RECEIVER,
                ErrorCode.MISSING_TYPE_ARGUMENT_LIST
            )
        }
    }

    @Check
    fun context(smlCall: SmlCall) {
        val results = smlCall.resultsOrNull() ?: return
        val source = when (smlCall.receiver) {
            is SmlMemberAccess -> smlCall.receiver
            else -> smlCall
        }
        val feature = when (smlCall.receiver) {
            is SmlMemberAccess -> Literals.SML_MEMBER_ACCESS__MEMBER
            else -> Literals.SML_ABSTRACT_CHAINED_EXPRESSION__RECEIVER
        }

        if (results.isEmpty() && !smlCall.hasValidContextForCallWithoutResults()) {
            error(
                "A call that produces no results is not allowed in this context.",
                source,
                feature,
                ErrorCode.CONTEXT_OF_CALL_WITHOUT_RESULTS
            )
        } else if (results.size > 1 && !smlCall.hasValidContextForCallWithMultipleResults()) {
            error(
                "A call that produces multiple results is not allowed in this context.",
                source,
                feature,
                ErrorCode.CONTEXT_OF_CALL_WITH_MANY_RESULTS
            )
        }
    }

    private fun SmlCall.hasValidContextForCallWithoutResults(): Boolean {
        val context = this.eContainer()
        return context is SmlExpressionStatement
    }

    private fun SmlCall.hasValidContextForCallWithMultipleResults(): Boolean {
        val context = this.eContainer()
        return context is SmlAssignment || context is SmlExpressionStatement || context is SmlMemberAccess
    }

    @Check
    fun recursion(smlCall: SmlCall) {
        if (smlCall.isRecursive()) {
            error(
                "Recursive calls are not allowed.",
                Literals.SML_ABSTRACT_CHAINED_EXPRESSION__RECEIVER,
                ErrorCode.NO_RECURSION
            )
        }
    }

    @Check
    fun receiver(smlCall: SmlCall) {
        when (val maybeCallable = smlCall.maybeCallable()) {
            CallableResult.NotCallable -> {
                error(
                    "This expression must not be called.",
                    Literals.SML_ABSTRACT_CHAINED_EXPRESSION__RECEIVER,
                    ErrorCode.RECEIVER_MUST_BE_CALLABLE
                )
            }
            is CallableResult.Callable -> {
                val callable = maybeCallable.callable
                if (callable is SmlClass && callable.parameterList == null) {
                    error(
                        "Cannot create an instance of a class that has no constructor.",
                        Literals.SML_ABSTRACT_CHAINED_EXPRESSION__RECEIVER,
                        ErrorCode.CALLED_CLASS_MUST_HAVE_CONSTRUCTOR
                    )
                }
            }
            else -> {}
        }
    }

    @Check
    fun unnecessaryArgumentList(smlCall: SmlCall) {

        // Call has no argument list anyway
        if (smlCall.argumentList == null) {
            return
        }

        // Call is used to pass type arguments or arguments
        if (smlCall.typeArgumentsOrEmpty().isNotEmpty() || smlCall.argumentsOrEmpty().isNotEmpty()) {
            return
        }

        // Receiver is not callable or cannot be resolved
        val callable = smlCall.callableOrNull() ?: return

        // Only calls to enum variants can sometimes be omitted without changing the meaning of the program
        if (callable !is SmlEnumVariant) {
            return
        }

        // This enum variant does not need to be called
        if (callable.typeParametersOrEmpty().isEmpty() && callable.parametersOrEmpty().isEmpty()) {
            info(
                "Unnecessary argument list.",
                Literals.SML_ABSTRACT_CALL__ARGUMENT_LIST,
                InfoCode.UnnecessaryArgumentList
            )
        }
    }
}
