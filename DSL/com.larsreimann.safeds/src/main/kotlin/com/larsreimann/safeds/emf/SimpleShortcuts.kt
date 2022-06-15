@file:Suppress("unused")

/**
 * Contains shortcuts that simplify working with the EMF model. Since most of these are very straightforward, unit tests
 * are usually not required.
 */

package com.larsreimann.safeds.emf

import com.larsreimann.safeds.safeDS.SdsAbstractAssignee
import com.larsreimann.safeds.safeDS.SdsAbstractCallable
import com.larsreimann.safeds.safeDS.SdsAbstractClassMember
import com.larsreimann.safeds.safeDS.SdsAbstractCompilationUnitMember
import com.larsreimann.safeds.safeDS.SdsAbstractConstraintGoal
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAbstractGoal
import com.larsreimann.safeds.safeDS.SdsAbstractLambda
import com.larsreimann.safeds.safeDS.SdsAbstractLocalVariable
import com.larsreimann.safeds.safeDS.SdsAbstractObject
import com.larsreimann.safeds.safeDS.SdsAbstractProtocolTerm
import com.larsreimann.safeds.safeDS.SdsAbstractStatement
import com.larsreimann.safeds.safeDS.SdsAbstractType
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.safeDS.SdsAnnotationCall
import com.larsreimann.safeds.safeDS.SdsAnnotationCallList
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsBlockLambda
import com.larsreimann.safeds.safeDS.SdsBlockLambdaResult
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsCallableType
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsClassBody
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsConstraint
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsExpressionLambda
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsFunctionBody
import com.larsreimann.safeds.safeDS.SdsImport
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsPredicate
import com.larsreimann.safeds.safeDS.SdsProtocol
import com.larsreimann.safeds.safeDS.SdsProtocolBody
import com.larsreimann.safeds.safeDS.SdsProtocolComplement
import com.larsreimann.safeds.safeDS.SdsProtocolReference
import com.larsreimann.safeds.safeDS.SdsProtocolSubterm
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsTypeArgument
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import com.larsreimann.safeds.safeDS.SdsUnionType
import com.larsreimann.safeds.safeDS.SdsWorkflow
import com.larsreimann.safeds.safeDS.SdsYield
import de.unibonn.simpleml.utils.uniqueOrNull
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.emf.ecore.resource.ResourceSet
import kotlin.contracts.ExperimentalContracts
import kotlin.contracts.contract

/* ********************************************************************************************************************
 * Accessing descendants                                                                                              *
 * ********************************************************************************************************************/

// EObject -----------------------------------------------------------------------------------------

fun EObject.resourceSetOrNull(): ResourceSet? {
    return eResource()?.resourceSet
}

// Resource ----------------------------------------------------------------------------------------

fun Resource.compilationUnitOrNull(): SmlCompilationUnit? {
    return this.allContents
        ?.asSequence()
        ?.filterIsInstance<SmlCompilationUnit>()
        ?.firstOrNull()
}

// SmlAbstractCallable -----------------------------------------------------------------------------

fun SmlAbstractCallable?.parametersOrEmpty(): List<SmlParameter> {
    return this?.parameterList?.parameters.orEmpty()
}

/**
 * Returns all calls that are actually executed immediately when this [SmlAbstractCallable] is called.
 */
fun SmlAbstractCallable.immediateCalls(): List<SmlCall> {
    return descendants<SmlCall> { it is SmlAbstractLambda }.toList()
}

// SmlAbstractDeclaration --------------------------------------------------------------------------

fun SmlAbstractDeclaration?.annotationCallsOrEmpty(): List<SmlAnnotationCall> {
    return this?.annotationCallList?.annotationCalls ?: this?.annotationCalls.orEmpty()
}

// SmlAnnotation -----------------------------------------------------------------------------------

fun SmlAnnotation?.constraintsOrEmpty(): List<SmlAbstractGoal> {
    return this?.constraint?.constraintList?.goals.orEmpty()
}

// SmlAnnotationCall -------------------------------------------------------------------------------

fun SmlAnnotationCall?.argumentsOrEmpty(): List<SmlArgument> {
    return this?.argumentList?.arguments.orEmpty()
}

// SmlAssignment -----------------------------------------------------------------------------------

fun SmlAssignment?.assigneesOrEmpty(): List<SmlAbstractAssignee> {
    return this?.assigneeList?.assignees
        ?.filterIsInstance<SmlAbstractAssignee>()
        .orEmpty()
}

fun SmlAssignment?.blockLambdaResultsOrEmpty(): List<SmlBlockLambdaResult> {
    return this.assigneesOrEmpty().filterIsInstance<SmlBlockLambdaResult>()
}

fun SmlAssignment?.placeholdersOrEmpty(): List<SmlPlaceholder> {
    return this.assigneesOrEmpty().filterIsInstance<SmlPlaceholder>()
}

fun SmlAssignment?.yieldsOrEmpty(): List<SmlYield> {
    return this.assigneesOrEmpty().filterIsInstance<SmlYield>()
}

// SmlBlockLambda ----------------------------------------------------------------------------------

fun SmlBlockLambda?.blockLambdaResultsOrEmpty(): List<SmlBlockLambdaResult> {
    return this.statementsOrEmpty()
        .filterIsInstance<SmlAssignment>()
        .flatMap { it.blockLambdaResultsOrEmpty() }
}

fun SmlBlockLambda?.localVariablesOrEmpty(): List<SmlAbstractLocalVariable> {
    return this.parametersOrEmpty() + this.placeholdersOrEmpty()
}

fun SmlBlockLambda?.placeholdersOrEmpty(): List<SmlPlaceholder> {
    return this.statementsOrEmpty()
        .filterIsInstance<SmlAssignment>()
        .flatMap { it.placeholdersOrEmpty() }
}

fun SmlBlockLambda?.statementsOrEmpty(): List<SmlAbstractStatement> {
    return this?.body?.statements.orEmpty()
}

// SmlCall -----------------------------------------------------------------------------------------

fun SmlCall?.argumentsOrEmpty(): List<SmlArgument> {
    return this?.argumentList?.arguments.orEmpty()
}

fun SmlCall?.typeArgumentsOrEmpty(): List<SmlTypeArgument> {
    return this?.typeArgumentList?.typeArguments.orEmpty()
}

// SmlCallableType ---------------------------------------------------------------------------------

fun SmlCallableType?.resultsOrEmpty(): List<SmlResult> {
    return this?.resultList?.results.orEmpty()
}

// SmlClass ----------------------------------------------------------------------------------------

fun SmlClass?.typeParametersOrEmpty(): List<SmlTypeParameter> {
    return this?.typeParameterList?.typeParameters.orEmpty()
}

fun SmlClass?.parentTypesOrEmpty(): List<SmlAbstractType> {
    return this?.parentTypeList?.parentTypes.orEmpty()
}

fun SmlClass?.constraintsOrEmpty(): List<SmlAbstractConstraintGoal> {
    return this?.body?.members
        ?.filterIsInstance<SmlAbstractConstraintGoal>()
        .orEmpty()
}

fun SmlClass?.objectsInBodyOrEmpty(): List<SmlAbstractObject> {
    return this?.body?.members.orEmpty()
}

fun SmlClass?.classMembersOrEmpty(): List<SmlAbstractClassMember> {
    return this?.body?.members
        ?.filterIsInstance<SmlAbstractClassMember>()
        .orEmpty()
}

fun SmlClass?.protocolsOrEmpty(): List<SmlProtocol> {
    return this?.body?.members
        ?.filterIsInstance<SmlProtocol>()
        .orEmpty()
}

fun SmlClass.uniqueProtocolOrNull(): SmlProtocol? {
    return this.protocolsOrEmpty().uniqueOrNull()
}

// SmlCompilationUnit ------------------------------------------------------------------------------

fun SmlCompilationUnit?.compilationUnitMembersOrEmpty(): List<SmlAbstractCompilationUnitMember> {
    return this?.members
        ?.filterIsInstance<SmlAbstractCompilationUnitMember>()
        .orEmpty()
}

// SmlEnum -----------------------------------------------------------------------------------------

fun SmlEnum?.variantsOrEmpty(): List<SmlEnumVariant> {
    return this?.body?.variants.orEmpty()
}

// SmlEnumVariant ----------------------------------------------------------------------------------

fun SmlEnumVariant?.typeParametersOrEmpty(): List<SmlTypeParameter> {
    return this?.typeParameterList?.typeParameters.orEmpty()
}

fun SmlEnumVariant?.constraintsOrEmpty(): List<SmlAbstractGoal> {
    return this?.constraint?.constraintList?.goals.orEmpty()
}

// SmlFunction -------------------------------------------------------------------------------------

fun SmlFunction?.resultsOrEmpty(): List<SmlResult> {
    return this?.resultList?.results.orEmpty()
}

fun SmlFunction?.typeParametersOrEmpty(): List<SmlTypeParameter> {
    return this?.typeParameterList?.typeParameters.orEmpty()
}

fun SmlFunction?.constraintsOrEmpty(): List<SmlAbstractConstraintGoal> {
    return this?.body?.statements
        ?.filterIsInstance<SmlAbstractConstraintGoal>()
        .orEmpty()
}

// SmlImport ---------------------------------------------------------------------------------------

fun SmlImport.aliasNameOrNull(): String? {
    return this.alias?.name
}

fun SmlImport.importedNameOrNull(): String? {
    return when (alias) {
        null -> when {
            isQualified() -> importedNamespace.split(".").last()
            else -> null
        }
        else -> aliasNameOrNull()
    }
}

// SmlNamedType ------------------------------------------------------------------------------------

fun SmlNamedType?.typeArgumentsOrEmpty(): List<SmlTypeArgument> {
    return this?.typeArgumentList?.typeArguments.orEmpty()
}

// SmlPredicate -------------------------------------------------------------------------------------

fun SmlPredicate?.goalsOrEmpty(): List<SmlAbstractGoal> {
    return this?.goalList?.goals.orEmpty()
}

// SmlProtocol -------------------------------------------------------------------------------------

fun SmlProtocol?.subtermsOrEmpty(): List<SmlProtocolSubterm> {
    return this?.body.subtermsOrEmpty()
}

fun SmlProtocol.termOrNull(): SmlAbstractProtocolTerm? {
    return this.body?.term
}

// SmlProtocolBody ---------------------------------------------------------------------------------

fun SmlProtocolBody?.subtermsOrEmpty(): List<SmlProtocolSubterm> {
    return this?.subtermList?.subterms.orEmpty()
}

// SmlProtocolComplement ---------------------------------------------------------------------------

fun SmlProtocolComplement?.referencesOrEmpty(): List<SmlProtocolReference> {
    return this?.referenceList?.references.orEmpty()
}

// SmlUnionType ------------------------------------------------------------------------------------

fun SmlUnionType?.typeArgumentsOrEmpty(): List<SmlTypeArgument> {
    return this?.typeArgumentList?.typeArguments.orEmpty()
}

// SmlWorkflow -------------------------------------------------------------------------------------

fun SmlWorkflow?.placeholdersOrEmpty(): List<SmlPlaceholder> {
    return this.statementsOrEmpty()
        .filterIsInstance<SmlAssignment>()
        .flatMap { it.placeholdersOrEmpty() }
}

fun SmlWorkflow?.statementsOrEmpty(): List<SmlAbstractStatement> {
    return this?.body?.statements.orEmpty()
}

// SmlWorkflowStep ---------------------------------------------------------------------------------

fun SmlStep?.localVariablesOrEmpty(): List<SmlAbstractLocalVariable> {
    return this.parametersOrEmpty() + this.placeholdersOrEmpty()
}

fun SmlStep?.placeholdersOrEmpty(): List<SmlPlaceholder> {
    return this.statementsOrEmpty()
        .filterIsInstance<SmlAssignment>()
        .flatMap { it.placeholdersOrEmpty() }
}

fun SmlStep?.resultsOrEmpty(): List<SmlResult> {
    return this?.resultList?.results.orEmpty()
}

fun SmlStep?.statementsOrEmpty(): List<SmlAbstractStatement> {
    return this?.body?.statements.orEmpty()
}

fun SmlStep?.yieldsOrEmpty(): List<SmlYield> {
    return this.statementsOrEmpty()
        .filterIsInstance<SmlAssignment>()
        .flatMap { it.yieldsOrEmpty() }
}

/* ********************************************************************************************************************
 * Accessing ancestors                                                                                                *
 * ********************************************************************************************************************/

fun EObject.containingBlockLambdaOrNull() = this.closestAncestorOrNull<SmlBlockLambda>()
fun EObject.containingCallableOrNull() = this.closestAncestorOrNull<SmlAbstractCallable>()
fun EObject.containingClassOrNull() = this.closestAncestorOrNull<SmlClass>()
fun EObject.containingCompilationUnitOrNull() = this.closestAncestorOrNull<SmlCompilationUnit>()
fun EObject.containingDeclarationOrNull() = this.closestAncestorOrNull<SmlAbstractDeclaration>()
fun EObject.containingEnumOrNull() = this.closestAncestorOrNull<SmlEnum>()
fun EObject.containingExpressionLambdaOrNull() = this.closestAncestorOrNull<SmlExpressionLambda>()
fun EObject.containingFunctionOrNull() = this.closestAncestorOrNull<SmlFunction>()
fun EObject.containingProtocolOrNull() = this.closestAncestorOrNull<SmlProtocol>()
fun EObject.containingStepOrNull() = this.closestAncestorOrNull<SmlStep>()
fun EObject.containingWorkflowOrNull() = this.closestAncestorOrNull<SmlWorkflow>()

fun SmlAnnotationCall.targetOrNull(): SmlAbstractDeclaration? {
    return when (val declaration = this.containingDeclarationOrNull() ?: return null) {
        is SmlAnnotationCallList -> declaration.containingDeclarationOrNull()
        else -> declaration
    }
}

/* ********************************************************************************************************************
 * Accessing siblings                                                                                                 *
 * ********************************************************************************************************************/

fun SmlConstraint.typeParametersOrNull(): List<SmlTypeParameter>? {
    return when (val parent = this.eContainer()) {
        is SmlClassBody -> {
            val parentClass: EObject = parent.eContainer()
            if (parentClass is SmlClass) {
                parentClass.typeParametersOrEmpty()
            } else {
                null
            }
        }
        is SmlEnumVariant -> return parent.typeParametersOrEmpty()
        is SmlFunctionBody -> {
            val parentFunction: EObject = parent.eContainer()
            if (parentFunction is SmlFunction) {
                parentFunction.typeParametersOrEmpty()
            } else {
                null
            }
        }
        else -> null
    }
}

/* ********************************************************************************************************************
 * Checks                                                                                                             *
 * ********************************************************************************************************************/

// SmlAbstractClassMember --------------------------------------------------------------------------

/**
 * Returns whether this [SmlAbstractClassMember] is truly contained in a class and static.
 */
fun SmlAbstractClassMember.isStatic(): Boolean {
    return when {
        !this.isClassMember() -> false
        this is SmlClass || this is SmlEnum -> true
        this is SmlAttribute && this.isStatic -> true
        this is SmlFunction && this.isStatic -> true
        else -> false
    }
}

// SmlAbstractDeclaration --------------------------------------------------------------------------

/**
 * Returns whether this [SmlAbstractDeclaration] is contained in a class.
 */
fun SmlAbstractDeclaration.isClassMember(): Boolean {
    return this is SmlAbstractClassMember && containingClassOrNull() != null
}

/**
 * Returns whether this [SmlAbstractDeclaration] is a global declaration.
 */
fun SmlAbstractDeclaration.isGlobal(): Boolean {
    return !isClassMember() && this is SmlAbstractCompilationUnitMember
}

/**
 * Returns whether this [SmlAbstractDeclaration] is resolved, i.e. not a proxy.
 */
@OptIn(ExperimentalContracts::class)
fun SmlAbstractDeclaration?.isResolved(): Boolean {
    contract {
        returns(true) implies (this@isResolved != null)
    }

    return (this != null) && !this.eIsProxy()
}

// SmlArgument -------------------------------------------------------------------------------------

fun SmlArgument.isNamed() = parameter != null
fun SmlArgument.isPositional() = parameter == null

// SmlEnum -----------------------------------------------------------------------------------------

/**
 * Returns whether no [SmlEnumVariant]s of this [SmlEnum] have non-empty parameter list. Only those enums can be
 * processed by the compiler, so non-constant [SmlEnum]s cannot be used as the type of parameters of annotations.
 */
fun SmlEnum.isConstant(): Boolean {
    return variantsOrEmpty().all { it.parametersOrEmpty().isEmpty() }
}

// SmlFunction -----------------------------------------------------------------------------------

fun SmlFunction.isMethod() = containingClassOrNull() != null

// SmlImport ---------------------------------------------------------------------------------------

fun SmlImport.isQualified() = !importedNamespace.endsWith(".*")
fun SmlImport.isWildcard() = importedNamespace.endsWith(".*")

// SmlParameter ------------------------------------------------------------------------------------

fun SmlParameter.isRequired() = defaultValue == null && !isVariadic
fun SmlParameter.isOptional() = defaultValue != null

// SmlTypeArgument ---------------------------------------------------------------------------------

fun SmlTypeArgument.isNamed() = typeParameter != null
fun SmlTypeArgument.isPositional() = typeParameter == null

/* ********************************************************************************************************************
 * Conversions                                                                                                        *
 * ********************************************************************************************************************/

// SmlAbstractDeclaration --------------------------------------------------------------------------

/**
 * Returns this [SmlAbstractDeclaration] if it is resolved, otherwise `null`.
 *
 * @see isResolved
 */
fun <T : SmlAbstractDeclaration> T.asResolvedOrNull(): T? {
    return when {
        isResolved() -> this
        else -> null
    }
}
