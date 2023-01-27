@file:Suppress("unused")

/**
 * Contains shortcuts that simplify working with the EMF model. Since most of these are very straightforward, unit tests
 * are usually not required.
 */

package com.larsreimann.safeds.emf

import com.larsreimann.safeds.constant.hasSchemaKind
import com.larsreimann.safeds.safeDS.SdsAbstractAssignee
import com.larsreimann.safeds.safeDS.SdsAbstractCallable
import com.larsreimann.safeds.safeDS.SdsAbstractClassMember
import com.larsreimann.safeds.safeDS.SdsAbstractCompilationUnitMember
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAbstractLambda
import com.larsreimann.safeds.safeDS.SdsAbstractLocalVariable
import com.larsreimann.safeds.safeDS.SdsAbstractObject
import com.larsreimann.safeds.safeDS.SdsAbstractProtocolTerm
import com.larsreimann.safeds.safeDS.SdsAbstractStatement
import com.larsreimann.safeds.safeDS.SdsAbstractType
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
import com.larsreimann.safeds.safeDS.SdsSchemaType
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsTypeArgument
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import com.larsreimann.safeds.safeDS.SdsUnionType
import com.larsreimann.safeds.safeDS.SdsPipeline
import com.larsreimann.safeds.safeDS.SdsYield
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import com.larsreimann.safeds.utils.uniqueOrNull
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

fun Resource.compilationUnitOrNull(): SdsCompilationUnit? {
    return this.allContents
        ?.asSequence()
        ?.filterIsInstance<SdsCompilationUnit>()
        ?.firstOrNull()
}

// SdsAbstractCallable -----------------------------------------------------------------------------

fun SdsAbstractCallable?.parametersOrEmpty(): List<SdsParameter> {
    return this?.parameterList?.parameters.orEmpty()
}

/**
 * Returns all calls that are actually executed immediately when this [SdsAbstractCallable] is called.
 */
fun SdsAbstractCallable.immediateCalls(): List<SdsCall> {
    return descendants<SdsCall> { it is SdsAbstractLambda }.toList()
}

// SdsAbstractDeclaration --------------------------------------------------------------------------

fun SdsAbstractDeclaration?.annotationCallsOrEmpty(): List<SdsAnnotationCall> {
    return this?.annotationCallList?.annotationCalls ?: this?.annotationCalls.orEmpty()
}

// SdsAnnotationCall -------------------------------------------------------------------------------

fun SdsAnnotationCall?.argumentsOrEmpty(): List<SdsArgument> {
    return this?.argumentList?.arguments.orEmpty()
}

// SdsAssignment -----------------------------------------------------------------------------------

fun SdsAssignment?.assigneesOrEmpty(): List<SdsAbstractAssignee> {
    return this?.assigneeList?.assignees
        ?.filterIsInstance<SdsAbstractAssignee>()
        .orEmpty()
}

fun SdsAssignment?.blockLambdaResultsOrEmpty(): List<SdsBlockLambdaResult> {
    return this.assigneesOrEmpty().filterIsInstance<SdsBlockLambdaResult>()
}

fun SdsAssignment?.placeholdersOrEmpty(): List<SdsPlaceholder> {
    return this.assigneesOrEmpty().filterIsInstance<SdsPlaceholder>()
}

fun SdsAssignment?.yieldsOrEmpty(): List<SdsYield> {
    return this.assigneesOrEmpty().filterIsInstance<SdsYield>()
}

// SdsBlockLambda ----------------------------------------------------------------------------------

fun SdsBlockLambda?.blockLambdaResultsOrEmpty(): List<SdsBlockLambdaResult> {
    return this.statementsOrEmpty()
        .filterIsInstance<SdsAssignment>()
        .flatMap { it.blockLambdaResultsOrEmpty() }
}

fun SdsBlockLambda?.localVariablesOrEmpty(): List<SdsAbstractLocalVariable> {
    return this.parametersOrEmpty() + this.placeholdersOrEmpty()
}

fun SdsBlockLambda?.placeholdersOrEmpty(): List<SdsPlaceholder> {
    return this.statementsOrEmpty()
        .filterIsInstance<SdsAssignment>()
        .flatMap { it.placeholdersOrEmpty() }
}

fun SdsBlockLambda?.statementsOrEmpty(): List<SdsAbstractStatement> {
    return this?.body?.statements.orEmpty()
}

// SdsCall -----------------------------------------------------------------------------------------

fun SdsCall?.argumentsOrEmpty(): List<SdsArgument> {
    return this?.argumentList?.arguments.orEmpty()
}

fun SdsCall?.typeArgumentsOrEmpty(): List<SdsTypeArgument> {
    return this?.typeArgumentList?.typeArguments.orEmpty()
}

// SdsCallableType ---------------------------------------------------------------------------------

fun SdsCallableType?.resultsOrEmpty(): List<SdsResult> {
    return this?.resultList?.results.orEmpty()
}

// SdsClass ----------------------------------------------------------------------------------------

fun SdsClass?.typeParametersOrEmpty(): List<SdsTypeParameter> {
    return this?.typeParameterList?.typeParameters.orEmpty()
}

fun SdsClass?.parentTypesOrEmpty(): List<SdsAbstractType> {
    return this?.parentTypeList?.parentTypes.orEmpty()
}

fun SdsClass?.objectsInBodyOrEmpty(): List<SdsAbstractObject> {
    return this?.body?.members.orEmpty()
}

fun SdsClass?.classMembersOrEmpty(): List<SdsAbstractClassMember> {
    return this?.body?.members
        ?.filterIsInstance<SdsAbstractClassMember>()
        .orEmpty()
}

@ExperimentalSdsApi
fun SdsClass?.protocolsOrEmpty(): List<SdsProtocol> {
    return this?.body?.members
        ?.filterIsInstance<SdsProtocol>()
        .orEmpty()
}

@ExperimentalSdsApi
fun SdsClass.uniqueProtocolOrNull(): SdsProtocol? {
    return this.protocolsOrEmpty().uniqueOrNull()
}

// SdsCompilationUnit ------------------------------------------------------------------------------

fun SdsCompilationUnit?.compilationUnitMembersOrEmpty(): List<SdsAbstractCompilationUnitMember> {
    return this?.members
        ?.filterIsInstance<SdsAbstractCompilationUnitMember>()
        .orEmpty()
}

// SdsEnum -----------------------------------------------------------------------------------------

fun SdsEnum?.variantsOrEmpty(): List<SdsEnumVariant> {
    return this?.body?.variants.orEmpty()
}

// SdsEnumVariant ----------------------------------------------------------------------------------

fun SdsEnumVariant?.typeParametersOrEmpty(): List<SdsTypeParameter> {
    return this?.typeParameterList?.typeParameters.orEmpty()
}

// SdsFunction -------------------------------------------------------------------------------------

fun SdsFunction?.resultsOrEmpty(): List<SdsResult> {
    return this?.resultList?.results.orEmpty()
}

fun SdsFunction?.typeParametersOrEmpty(): List<SdsTypeParameter> {
    return this?.typeParameterList?.typeParameters.orEmpty()
}

@ExperimentalSdsApi
fun SdsFunction?.constraintStatementsOrEmpty(): List<SdsAbstractStatement> {
    return this?.body?.statements
        ?.filterIsInstance<SdsConstraint>()?.first()
        ?.body?.statements
        .orEmpty()
}

// SdsImport ---------------------------------------------------------------------------------------

fun SdsImport.aliasNameOrNull(): String? {
    return this.alias?.name
}

fun SdsImport.importedNameOrNull(): String? {
    return when (alias) {
        null -> when {
            isQualified() -> importedNamespace.split(".").last()
            else -> null
        }
        else -> aliasNameOrNull()
    }
}

// SdsNamedType ------------------------------------------------------------------------------------

fun SdsNamedType?.typeArgumentsOrEmpty(): List<SdsTypeArgument> {
    return this?.typeArgumentList?.typeArguments.orEmpty()
}

// SdsPredicate ------------------------------------------------------------------------------------

@ExperimentalSdsApi
fun SdsPredicate?.parametersOrEmpty(): List<SdsParameter> {
    return this?.parameterList?.parameters.orEmpty()
}

fun SdsPredicate?.typeParametersOrEmpty(): List<SdsTypeParameter> {
    return this?.typeParameterList?.typeParameters.orEmpty()
}

@ExperimentalSdsApi
fun SdsPredicate?.resultsOrEmpty(): List<SdsResult> {
    return this?.resultList?.results.orEmpty()
}

@ExperimentalSdsApi
fun SdsPredicate?.assignmentsOrEmpty(): List<SdsAssignment> {
    return this?.body?.statements?.filterIsInstance<SdsAssignment>().orEmpty()
}

// SdsProtocol -------------------------------------------------------------------------------------

@ExperimentalSdsApi
fun SdsProtocol?.subtermsOrEmpty(): List<SdsProtocolSubterm> {
    return this?.body.subtermsOrEmpty()
}

@ExperimentalSdsApi
fun SdsProtocol.termOrNull(): SdsAbstractProtocolTerm? {
    return this.body?.term
}

// SdsProtocolBody ---------------------------------------------------------------------------------

@ExperimentalSdsApi
fun SdsProtocolBody?.subtermsOrEmpty(): List<SdsProtocolSubterm> {
    return this?.subtermList?.subterms.orEmpty()
}

// SdsProtocolComplement ---------------------------------------------------------------------------

@ExperimentalSdsApi
fun SdsProtocolComplement?.referencesOrEmpty(): List<SdsProtocolReference> {
    return this?.referenceList?.references.orEmpty()
}

// SdsUnionType ------------------------------------------------------------------------------------

fun SdsUnionType?.typeArgumentsOrEmpty(): List<SdsTypeArgument> {
    return this?.typeArgumentList?.typeArguments.orEmpty()
}

// SdsWorkflow -------------------------------------------------------------------------------------

fun SdsPipeline?.placeholdersOrEmpty(): List<SdsPlaceholder> {
    return this.statementsOrEmpty()
        .filterIsInstance<SdsAssignment>()
        .flatMap { it.placeholdersOrEmpty() }
}

fun SdsPipeline?.statementsOrEmpty(): List<SdsAbstractStatement> {
    return this?.body?.statements.orEmpty()
}

// SdsWorkflowStep ---------------------------------------------------------------------------------

fun SdsStep?.localVariablesOrEmpty(): List<SdsAbstractLocalVariable> {
    return this.parametersOrEmpty() + this.placeholdersOrEmpty()
}

fun SdsStep?.placeholdersOrEmpty(): List<SdsPlaceholder> {
    return this.statementsOrEmpty()
        .filterIsInstance<SdsAssignment>()
        .flatMap { it.placeholdersOrEmpty() }
}

fun SdsStep?.resultsOrEmpty(): List<SdsResult> {
    return this?.resultList?.results.orEmpty()
}

fun SdsStep?.statementsOrEmpty(): List<SdsAbstractStatement> {
    return this?.body?.statements.orEmpty()
}

fun SdsStep?.yieldsOrEmpty(): List<SdsYield> {
    return this.statementsOrEmpty()
        .filterIsInstance<SdsAssignment>()
        .flatMap { it.yieldsOrEmpty() }
}

/* ********************************************************************************************************************
 * Accessing ancestors                                                                                                *
 * ********************************************************************************************************************/

fun EObject.containingBlockLambdaOrNull() = this.closestAncestorOrNull<SdsBlockLambda>()
fun EObject.containingCallableOrNull() = this.closestAncestorOrNull<SdsAbstractCallable>()
fun EObject.containingClassOrNull() = this.closestAncestorOrNull<SdsClass>()
fun EObject.containingCompilationUnitOrNull() = this.closestAncestorOrNull<SdsCompilationUnit>()
fun EObject.containingDeclarationOrNull() = this.closestAncestorOrNull<SdsAbstractDeclaration>()
fun EObject.containingEnumOrNull() = this.closestAncestorOrNull<SdsEnum>()
fun EObject.containingExpressionLambdaOrNull() = this.closestAncestorOrNull<SdsExpressionLambda>()
fun EObject.containingFunctionOrNull() = this.closestAncestorOrNull<SdsFunction>()
fun EObject.containingProtocolOrNull() = this.closestAncestorOrNull<SdsProtocol>()
fun EObject.containingStepOrNull() = this.closestAncestorOrNull<SdsStep>()
fun EObject.containingWorkflowOrNull() = this.closestAncestorOrNull<SdsPipeline>()

fun SdsAnnotationCall.targetOrNull(): SdsAbstractDeclaration? {
    return when (val declaration = this.containingDeclarationOrNull() ?: return null) {
        is SdsAnnotationCallList -> declaration.containingDeclarationOrNull()
        else -> declaration
    }
}

/* ********************************************************************************************************************
 * Accessing siblings                                                                                                 *
 * ********************************************************************************************************************/

fun SdsConstraint.typeParametersOrNull(): List<SdsTypeParameter>? {
    return when (val parent = this.eContainer()) {
        is SdsClassBody -> {
            val parentClass: EObject = parent.eContainer()
            if (parentClass is SdsClass) {
                parentClass.typeParametersOrEmpty()
            } else {
                null
            }
        }
        is SdsEnumVariant -> return parent.typeParametersOrEmpty()
        is SdsFunctionBody -> {
            val parentFunction: EObject = parent.eContainer()
            if (parentFunction is SdsFunction) {
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

// SdsAbstractClassMember --------------------------------------------------------------------------

/**
 * Returns whether this [SdsAbstractClassMember] is truly contained in a class and static.
 */
fun SdsAbstractClassMember.isStatic(): Boolean {
    return when {
        !this.isClassMember() -> false
        this is SdsClass || this is SdsEnum -> true
        this is SdsAttribute && this.isStatic -> true
        this is SdsFunction && this.isStatic -> true
        else -> false
    }
}

// SdsAbstractDeclaration --------------------------------------------------------------------------

/**
 * Returns whether this [SdsAbstractDeclaration] is contained in a class.
 */
fun SdsAbstractDeclaration.isClassMember(): Boolean {
    return this is SdsAbstractClassMember && containingClassOrNull() != null
}

/**
 * Returns whether this [SdsAbstractDeclaration] is a global declaration.
 */
fun SdsAbstractDeclaration.isGlobal(): Boolean {
    return !isClassMember() && this is SdsAbstractCompilationUnitMember
}

/**
 * Returns whether this [SdsAbstractDeclaration] is resolved, i.e. not a proxy.
 */
@OptIn(ExperimentalContracts::class)
fun SdsAbstractDeclaration?.isResolved(): Boolean {
    contract {
        returns(true) implies (this@isResolved != null)
    }

    return (this != null) && !this.eIsProxy()
}

// SdsArgument -------------------------------------------------------------------------------------

fun SdsArgument.isNamed() = parameter != null
fun SdsArgument.isPositional() = parameter == null

// SdsEnum -----------------------------------------------------------------------------------------

/**
 * Returns whether no [SdsEnumVariant]s of this [SdsEnum] have non-empty parameter list. Only those enums can be
 * processed by the compiler, so non-constant [SdsEnum]s cannot be used as the type of parameters of annotations.
 */
fun SdsEnum.isConstant(): Boolean {
    return variantsOrEmpty().all { it.parametersOrEmpty().isEmpty() }
}

// SdsFunction -------------------------------------------------------------------------------------

fun SdsFunction.isMethod() = containingClassOrNull() != null

// SdsImport ---------------------------------------------------------------------------------------

fun SdsImport.isQualified() = !importedNamespace.endsWith(".*")
fun SdsImport.isWildcard() = importedNamespace.endsWith(".*")

// SdsParameter ------------------------------------------------------------------------------------

fun SdsParameter.isRequired() = defaultValue == null && !isVariadic
fun SdsParameter.isOptional() = defaultValue != null

// SdsPredicate ------------------------------------------------------------------------------------

@ExperimentalSdsApi
fun SdsPredicate?.isAbstract(): Boolean {
    return this?.body == null
}

// SdsSchemaType ------------------------------------------------------------------------------------

@OptIn(ExperimentalSdsApi::class)
fun SdsSchemaType.hasSchemaKind(): Boolean {
    val declaration = this.declaration
    return declaration is SdsTypeParameter && declaration.hasSchemaKind()
}

// SdsTypeArgument ---------------------------------------------------------------------------------

fun SdsTypeArgument.isNamed() = typeParameter != null
fun SdsTypeArgument.isPositional() = typeParameter == null

/* ********************************************************************************************************************
 * Conversions                                                                                                        *
 * ********************************************************************************************************************/

// SdsAbstractDeclaration --------------------------------------------------------------------------

/**
 * Returns this [SdsAbstractDeclaration] if it is resolved, otherwise `null`.
 *
 * @see isResolved
 */
fun <T : SdsAbstractDeclaration> T.asResolvedOrNull(): T? {
    return when {
        isResolved() -> this
        else -> null
    }
}
