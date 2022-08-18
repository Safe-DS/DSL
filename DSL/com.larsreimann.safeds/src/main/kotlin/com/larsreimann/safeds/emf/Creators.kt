@file:Suppress("unused")

package com.larsreimann.safeds.emf

import com.larsreimann.safeds.constant.SdsFileExtension
import com.larsreimann.safeds.constant.SdsInfixOperationOperator
import com.larsreimann.safeds.constant.SdsKind
import com.larsreimann.safeds.constant.SdsPrefixOperationOperator
import com.larsreimann.safeds.constant.SdsProtocolQuantifiedTermQuantifier
import com.larsreimann.safeds.constant.SdsProtocolTokenClassValue
import com.larsreimann.safeds.constant.SdsTypeParameterConstraintOperator
import com.larsreimann.safeds.constant.SdsVariance
import com.larsreimann.safeds.constant.SdsVisibility
import com.larsreimann.safeds.safeDS.SafeDSFactory
import com.larsreimann.safeds.safeDS.SdsAbstractAssignee
import com.larsreimann.safeds.safeDS.SdsAbstractClassMember
import com.larsreimann.safeds.safeDS.SdsAbstractCompilationUnitMember
import com.larsreimann.safeds.safeDS.SdsAbstractConstraintGoal
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsAbstractExpression
import com.larsreimann.safeds.safeDS.SdsAbstractGoal
import com.larsreimann.safeds.safeDS.SdsAbstractGoalExpression
import com.larsreimann.safeds.safeDS.SdsAbstractLambda
import com.larsreimann.safeds.safeDS.SdsAbstractNamedTypeDeclaration
import com.larsreimann.safeds.safeDS.SdsAbstractObject
import com.larsreimann.safeds.safeDS.SdsAbstractProtocolTerm
import com.larsreimann.safeds.safeDS.SdsAbstractProtocolToken
import com.larsreimann.safeds.safeDS.SdsAbstractStatement
import com.larsreimann.safeds.safeDS.SdsAbstractType
import com.larsreimann.safeds.safeDS.SdsAbstractTypeArgumentValue
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.safeDS.SdsAnnotationCall
import com.larsreimann.safeds.safeDS.SdsAnnotationCallList
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsArgumentList
import com.larsreimann.safeds.safeDS.SdsAssigneeList
import com.larsreimann.safeds.safeDS.SdsAssignment
import com.larsreimann.safeds.safeDS.SdsAssignmentGoal
import com.larsreimann.safeds.safeDS.SdsAttribute
import com.larsreimann.safeds.safeDS.SdsBlock
import com.larsreimann.safeds.safeDS.SdsBlockLambda
import com.larsreimann.safeds.safeDS.SdsBlockLambdaResult
import com.larsreimann.safeds.safeDS.SdsBoolean
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsCallableType
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsColumn
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsConstraint
import com.larsreimann.safeds.safeDS.SdsEnum
import com.larsreimann.safeds.safeDS.SdsEnumVariant
import com.larsreimann.safeds.safeDS.SdsExpressionGoal
import com.larsreimann.safeds.safeDS.SdsExpressionLambda
import com.larsreimann.safeds.safeDS.SdsExpressionStatement
import com.larsreimann.safeds.safeDS.SdsFloat
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsGoalArgument
import com.larsreimann.safeds.safeDS.SdsGoalArgumentList
import com.larsreimann.safeds.safeDS.SdsGoalCall
import com.larsreimann.safeds.safeDS.SdsGoalList
import com.larsreimann.safeds.safeDS.SdsGoalReference
import com.larsreimann.safeds.safeDS.SdsImport
import com.larsreimann.safeds.safeDS.SdsImportAlias
import com.larsreimann.safeds.safeDS.SdsIndexedAccess
import com.larsreimann.safeds.safeDS.SdsInfixOperation
import com.larsreimann.safeds.safeDS.SdsInt
import com.larsreimann.safeds.safeDS.SdsLambdaParameterList
import com.larsreimann.safeds.safeDS.SdsMemberAccess
import com.larsreimann.safeds.safeDS.SdsMemberType
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.safeDS.SdsNull
import com.larsreimann.safeds.safeDS.SdsParameter
import com.larsreimann.safeds.safeDS.SdsParameterList
import com.larsreimann.safeds.safeDS.SdsParameterizedType
import com.larsreimann.safeds.safeDS.SdsParentTypeList
import com.larsreimann.safeds.safeDS.SdsParenthesizedExpression
import com.larsreimann.safeds.safeDS.SdsParenthesizedGoalExpression
import com.larsreimann.safeds.safeDS.SdsParenthesizedType
import com.larsreimann.safeds.safeDS.SdsPlaceholder
import com.larsreimann.safeds.safeDS.SdsPredicate
import com.larsreimann.safeds.safeDS.SdsPrefixOperation
import com.larsreimann.safeds.safeDS.SdsProtocol
import com.larsreimann.safeds.safeDS.SdsProtocolAlternative
import com.larsreimann.safeds.safeDS.SdsProtocolComplement
import com.larsreimann.safeds.safeDS.SdsProtocolParenthesizedTerm
import com.larsreimann.safeds.safeDS.SdsProtocolQuantifiedTerm
import com.larsreimann.safeds.safeDS.SdsProtocolReference
import com.larsreimann.safeds.safeDS.SdsProtocolReferenceList
import com.larsreimann.safeds.safeDS.SdsProtocolSequence
import com.larsreimann.safeds.safeDS.SdsProtocolSubterm
import com.larsreimann.safeds.safeDS.SdsProtocolTokenClass
import com.larsreimann.safeds.safeDS.SdsReference
import com.larsreimann.safeds.safeDS.SdsResult
import com.larsreimann.safeds.safeDS.SdsResultList
import com.larsreimann.safeds.safeDS.SdsSchema
import com.larsreimann.safeds.safeDS.SdsStarProjection
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsString
import com.larsreimann.safeds.safeDS.SdsTemplateString
import com.larsreimann.safeds.safeDS.SdsTypeArgument
import com.larsreimann.safeds.safeDS.SdsTypeArgumentList
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import com.larsreimann.safeds.safeDS.SdsTypeParameterConstraintGoal
import com.larsreimann.safeds.safeDS.SdsTypeParameterList
import com.larsreimann.safeds.safeDS.SdsTypeProjection
import com.larsreimann.safeds.safeDS.SdsUnionType
import com.larsreimann.safeds.safeDS.SdsWildcard
import com.larsreimann.safeds.safeDS.SdsWorkflow
import com.larsreimann.safeds.safeDS.SdsYield
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import com.larsreimann.safeds.utils.nullIfEmptyElse
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtext.resource.XtextResource
import kotlin.math.absoluteValue

private val factory = SafeDSFactory.eINSTANCE

/**
 * Returns a new [Resource].
 *
 * This can be useful to serialize EObjects that were initialized with the creators in this file rather than generated
 * by the parser, since serialization requires EObjects to be contained in a resource.
 */
fun createSdsDummyResource(
    fileName: String,
    fileExtension: SdsFileExtension,
    compilationUnit: SdsCompilationUnit,
): Resource {
    val uri = URI.createURI("dummy:/$fileName.${fileExtension.extension}")
    return XtextResource(uri).apply {
        this.contents += compilationUnit
    }
}

/**
 * Returns a new [Resource].
 *
 * This can be useful to serialize EObjects that were initialized with the creators in this file rather than generated
 * by the parser, since serialization requires EObjects to be contained in a resource.
 */
fun createSdsDummyResource(
    fileName: String,
    fileExtension: SdsFileExtension,
    packageName: String,
    init: SdsCompilationUnit.() -> Unit = {},
): Resource {
    val uri = URI.createURI("dummy:/$fileName.${fileExtension.extension}")
    return XtextResource(uri).apply {
        this.contents += createSdsCompilationUnit(
            packageName = packageName,
            init = init,
        )
    }
}

/**
 * Returns a new object of class [SdsAnnotation].
 */
fun createSdsAnnotation(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    parameters: List<SdsParameter> = emptyList(),
): SdsAnnotation {
    return factory.createSdsAnnotation().apply {
        this.name = name
        this.annotationCallList = createSdsAnnotationCallList(annotationCalls)
        this.parameterList = parameters.nullIfEmptyElse(::createSdsParameterList)
    }
}

/**
 * Adds a new object of class [SdsAnnotation] to the receiver.
 */
fun SdsCompilationUnit.sdsAnnotation(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    parameters: List<SdsParameter> = emptyList(),
) {
    this.addMember(createSdsAnnotation(name, annotationCalls, parameters))
}

/**
 * Returns a new object of class [SdsAnnotationCall].
 */
fun createSdsAnnotationCall(
    annotation: SdsAnnotation,
    arguments: List<SdsArgument> = emptyList(),
): SdsAnnotationCall {
    return factory.createSdsAnnotationCall().apply {
        this.annotation = annotation
        this.argumentList = arguments.nullIfEmptyElse(::createSdsArgumentList)
    }
}

/**
 * Returns a new object of class [SdsAnnotationCall] that points to an annotation with the given name.
 */
fun createSdsAnnotationCall(
    annotationName: String,
    arguments: List<SdsArgument> = emptyList(),
): SdsAnnotationCall {
    return createSdsAnnotationCall(
        createSdsAnnotation(annotationName),
        arguments,
    )
}

/**
 * Returns a new object of class [SdsAnnotationCallList].
 */
private fun createSdsAnnotationCallList(annotationCalls: List<SdsAnnotationCall>): SdsAnnotationCallList {
    return factory.createSdsAnnotationCallList().apply {
        this.annotationCalls += annotationCalls
    }
}

/**
 * Returns a new object of class [SdsArgument].
 */
fun createSdsArgument(value: SdsAbstractExpression, parameter: SdsParameter? = null): SdsArgument {
    return factory.createSdsArgument().apply {
        this.value = value
        this.parameter = parameter
    }
}

/**
 * Returns a new object of class [SdsArgument] that points to a parameter with the given name.
 */
fun createSdsArgument(value: SdsAbstractExpression, parameterName: String): SdsArgument {
    return createSdsArgument(
        value,
        createSdsParameter(parameterName),
    )
}

/**
 * Returns a new object of class [SdsArgumentList].
 */
fun createSdsArgumentList(arguments: List<SdsArgument>): SdsArgumentList {
    return factory.createSdsArgumentList().apply {
        this.arguments += arguments
    }
}

/**
 * Returns a new object of class [SdsAssigneeList].
 */
fun createSdsAssigneeList(assignees: List<SdsAbstractAssignee>): SdsAssigneeList {
    return factory.createSdsAssigneeList().apply {
        this.assignees += assignees
    }
}

/**
 * Returns a new object of class [SdsAssignment].
 *
 * @throws IllegalArgumentException If no assignees are passed.
 */
fun createSdsAssignment(assignees: List<SdsAbstractAssignee>, expression: SdsAbstractExpression): SdsAssignment {
    if (assignees.isEmpty()) {
        throw IllegalArgumentException("Must have at least one assignee.")
    }

    return factory.createSdsAssignment().apply {
        this.assigneeList = createSdsAssigneeList(assignees)
        this.expression = expression
    }
}

/**
 * Adds a new object of class [SdsAssignment] to the receiver.
 */
fun SdsBlockLambda.sdsAssignment(assignees: List<SdsAbstractAssignee>, expression: SdsAbstractExpression) {
    this.addStatement(createSdsAssignment(assignees, expression))
}

/**
 * Adds a new object of class [SdsAssignment] to the receiver.
 */
fun SdsWorkflow.sdsAssignment(assignees: List<SdsAbstractAssignee>, expression: SdsAbstractExpression) {
    this.addStatement(createSdsAssignment(assignees, expression))
}

/**
 * Adds a new object of class [SdsAssignment] to the receiver.
 */
fun SdsStep.sdsAssignment(assignees: List<SdsAbstractAssignee>, expression: SdsAbstractExpression) {
    this.addStatement(createSdsAssignment(assignees, expression))
}

/**
 * Returns a new object of class [SdsAssignmentGoal].
 */
fun createSdsAssignmentGoal(placeholderName: String, expression: SdsAbstractGoalExpression): SdsAssignmentGoal {
    return factory.createSdsAssignmentGoal().apply {
        this.placeholder = factory.createSdsGoalPlaceholder().apply {
            this.name = placeholderName
        }
        this.expression = expression
    }
}

/**
 * Adds a new object of class [SdsAssignmentGoal] to the receiver.
 */
fun SdsPredicate.sdsAssignmentGoal(placeholderName: String, expression: SdsAbstractGoalExpression) {
    this.addGoal(createSdsAssignmentGoal(placeholderName, expression))
}

/**
 * Returns a new object of class [SdsAttribute].
 */
fun createSdsAttribute(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    isStatic: Boolean = false,
    type: SdsAbstractType? = null,
): SdsAttribute {
    return factory.createSdsAttribute().apply {
        this.name = name
        this.annotationCallList = createSdsAnnotationCallList(annotationCalls)
        this.isStatic = isStatic
        this.type = type
    }
}

/**
 * Adds a new object of class [SdsAttribute] to the receiver.
 */
fun SdsClass.sdsAttribute(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    isStatic: Boolean = false,
    type: SdsAbstractType? = null,
) {
    this.addMember(createSdsAttribute(name, annotationCalls, isStatic, type))
}

/**
 * Returns a new object of class [SdsBlock].
 */
fun createSdsBlock(
    statements: List<SdsAbstractStatement> = emptyList(),
    init: SdsBlock.() -> Unit = {},
): SdsBlock {
    return factory.createSdsBlock().apply {
        this.statements += statements
        this.init()
    }
}

/**
 * Returns a new object of class [SdsBlockLambda].
 */
fun createSdsBlockLambda(
    parameters: List<SdsParameter> = emptyList(),
    statements: List<SdsAbstractStatement> = emptyList(),
    init: SdsBlockLambda.() -> Unit = {},
): SdsBlockLambda {
    return factory.createSdsBlockLambda().apply {
        this.parameterList = createSdsLambdaParameterList(parameters)
        this.body = factory.createSdsBlock()
        statements.forEach { addStatement(it) }
        this.init()
    }
}

/**
 * Adds a new statement to the receiver.
 */
private fun SdsBlockLambda.addStatement(statement: SdsAbstractStatement) {
    if (this.body == null) {
        this.body = factory.createSdsBlock()
    }

    this.body.statements += statement
}

/**
 * Returns a new object of class [SdsBlockLambdaResult].
 */
fun createSdsBlockLambdaResult(name: String): SdsBlockLambdaResult {
    return factory.createSdsBlockLambdaResult().apply {
        this.name = name
    }
}

/**
 * Returns a new object of class [SdsBoolean].
 */
fun createSdsBoolean(value: Boolean): SdsBoolean {
    return factory.createSdsBoolean().apply {
        this.isTrue = value
    }
}

/**
 * Returns a new object of class [SdsCall].
 */
fun createSdsCall(
    receiver: SdsAbstractExpression,
    typeArguments: List<SdsTypeArgument> = emptyList(),
    arguments: List<SdsArgument> = emptyList(),
): SdsCall {
    return factory.createSdsCall().apply {
        this.receiver = receiver
        this.typeArgumentList = typeArguments.nullIfEmptyElse(::createSdsTypeArgumentList)
        this.argumentList = createSdsArgumentList(arguments)
    }
}

/**
 * Returns a new object of class [SdsCallableType].
 */
fun createSdsCallableType(parameters: List<SdsParameter>, results: List<SdsResult>): SdsCallableType {
    return factory.createSdsCallableType().apply {
        this.parameterList = createSdsParameterList(parameters)
        this.resultList = createSdsResultList(results)
    }
}

/**
 * Returns a new object of class [SdsClass].
 */
fun createSdsClass(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    typeParameters: List<SdsTypeParameter> = emptyList(),
    parameters: List<SdsParameter>? = null, // null and emptyList() are semantically different
    parentTypes: List<SdsAbstractType> = emptyList(),
    constraint: SdsConstraint? = null,
    protocol: SdsProtocol? = null,
    members: List<SdsAbstractClassMember> = emptyList(),
    init: SdsClass.() -> Unit = {},
): SdsClass {
    return factory.createSdsClass().apply {
        this.name = name
        this.annotationCallList = createSdsAnnotationCallList(annotationCalls)
        this.typeParameterList = typeParameters.nullIfEmptyElse(::createSdsTypeParameterList)
        this.parameterList = parameters?.let { createSdsParameterList(it) }
        this.parentTypeList = parentTypes.nullIfEmptyElse(::createSdsParentTypeList)
        protocol?.let { addMember(it) }
        constraint?.let { addMember(it) }
        members.forEach { addMember(it) }
        this.init()
    }
}

/**
 * Adds a new object of class [SdsClass] to the receiver.
 */
fun SdsClass.sdsClass(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    typeParameters: List<SdsTypeParameter> = emptyList(),
    parameters: List<SdsParameter>? = null,
    parentTypes: List<SdsAbstractType> = emptyList(),
    constraint: SdsConstraint? = null,
    protocol: SdsProtocol? = null,
    members: List<SdsAbstractClassMember> = emptyList(),
    init: SdsClass.() -> Unit = {},
) {
    this.addMember(
        createSdsClass(
            name,
            annotationCalls,
            typeParameters,
            parameters,
            parentTypes,
            constraint,
            protocol,
            members,
            init,
        ),
    )
}

/**
 * Adds a new object of class [SdsClass] to the receiver.
 */
fun SdsCompilationUnit.sdsClass(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    typeParameters: List<SdsTypeParameter> = emptyList(),
    parameters: List<SdsParameter>? = null,
    parentTypes: List<SdsAbstractType> = emptyList(),
    constraint: SdsConstraint? = null,
    protocol: SdsProtocol? = null,
    members: List<SdsAbstractClassMember> = emptyList(),
    init: SdsClass.() -> Unit = {},
) {
    this.addMember(
        createSdsClass(
            name,
            annotationCalls,
            typeParameters,
            parameters,
            parentTypes,
            constraint,
            protocol,
            members,
            init,
        ),
    )
}

/**
 * Adds a new member to the receiver.
 */
private fun SdsClass.addMember(member: SdsAbstractObject) {
    if (this.body == null) {
        this.body = factory.createSdsClassBody()
    }

    this.body.members += member
}

/**
 * Returns a new object of class [SdsCompilationUnit].
 */
fun createSdsCompilationUnit(
    packageName: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    imports: List<SdsImport> = emptyList(),
    members: List<SdsAbstractCompilationUnitMember> = emptyList(),
    init: SdsCompilationUnit.() -> Unit = {},
): SdsCompilationUnit {
    return factory.createSdsCompilationUnit().apply {
        this.name = packageName
        this.annotationCalls += annotationCalls
        this.imports += imports
        members.forEach { addMember(it) }
        init()
    }
}

/**
 * Adds a new member to the receiver.
 */
private fun SdsCompilationUnit.addMember(member: SdsAbstractCompilationUnitMember) {
    this.members += member
}

/**
 * Returns a new object of class [SdsConstraint].
 */
@ExperimentalSdsApi
fun createSdsConstraint(goals: List<SdsAbstractConstraintGoal>): SdsConstraint {
    return factory.createSdsConstraint().apply {
        this.constraintList = createSdsGoalList(goals)
    }
}

/**
 * Returns a new object of class [SdsColumn].
 */
@ExperimentalSdsApi
fun createSdsColumn(
    columnName: String,
    columnType: SdsAbstractType,
): SdsColumn {
    return factory.createSdsColumn().apply {
        this.columnName = createSdsString(columnName)
        this.columnType = columnType
    }
}

/**
 * Returns a new object of class [SdsEnum].
 */
fun createSdsEnum(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    variants: List<SdsEnumVariant> = emptyList(),
    init: SdsEnum.() -> Unit = {},
): SdsEnum {
    return factory.createSdsEnum().apply {
        this.name = name
        this.annotationCallList = createSdsAnnotationCallList(annotationCalls)
        variants.forEach { addVariant(it) }
        this.init()
    }
}

/**
 * Adds a new object of class [SdsEnum] to the receiver.
 */
fun SdsClass.sdsEnum(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    variants: List<SdsEnumVariant> = emptyList(),
    init: SdsEnum.() -> Unit = {},
) {
    this.addMember(createSdsEnum(name, annotationCalls, variants, init))
}

/**
 * Adds a new object of class [SdsEnum] to the receiver.
 */
fun SdsCompilationUnit.sdsEnum(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    variants: List<SdsEnumVariant> = emptyList(),
    init: SdsEnum.() -> Unit = {},
) {
    this.addMember(createSdsEnum(name, annotationCalls, variants, init))
}

/**
 * Adds a new variant to the receiver.
 */
private fun SdsEnum.addVariant(variant: SdsEnumVariant) {
    if (this.body == null) {
        this.body = factory.createSdsEnumBody()
    }

    this.body.variants += variant
}

/**
 * Returns a new object of class [SdsEnumVariant].
 */
fun createSdsEnumVariant(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    typeParameters: List<SdsTypeParameter> = emptyList(),
    parameters: List<SdsParameter> = emptyList(),
    constraint: SdsConstraint? = null,
): SdsEnumVariant {
    return factory.createSdsEnumVariant().apply {
        this.name = name
        this.annotationCalls += annotationCalls
        this.typeParameterList = typeParameters.nullIfEmptyElse(::createSdsTypeParameterList)
        this.parameterList = parameters.nullIfEmptyElse(::createSdsParameterList)
        this.constraint = constraint
    }
}

/**
 * Adds a new object of class [SdsEnumVariant] to the receiver.
 */
fun SdsEnum.sdsEnumVariant(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    typeParameters: List<SdsTypeParameter> = emptyList(),
    parameters: List<SdsParameter> = emptyList(),
    constraint: SdsConstraint? = null,
) {
    this.addVariant(createSdsEnumVariant(name, annotationCalls, typeParameters, parameters, constraint))
}

/**
 * Returns a new object of class [SdsExpressionGoal].
 */
fun createSdsExpressionGoal(expression: SdsAbstractGoalExpression): SdsExpressionGoal {
    return factory.createSdsExpressionGoal().apply {
        this.expression = expression
    }
}

/**
 * Adds a new object of class [SdsExpressionGoal] to the receiver.
 */
fun SdsPredicate.sdsExpressionGoal(expression: SdsAbstractGoalExpression) {
    this.addGoal(createSdsExpressionGoal(expression))
}

/**
 * Returns a new object of class [SdsExpressionLambda].
 */
fun createSdsExpressionLambda(
    parameters: List<SdsParameter> = emptyList(),
    result: SdsAbstractExpression,
): SdsExpressionLambda {
    return factory.createSdsExpressionLambda().apply {
        this.parameterList = createSdsLambdaParameterList(parameters)
        this.result = result
    }
}

/**
 * Returns a new object of class [SdsExpressionStatement].
 */
fun createSdsExpressionStatement(expression: SdsAbstractExpression): SdsExpressionStatement {
    return factory.createSdsExpressionStatement().apply {
        this.expression = expression
    }
}

/**
 * Adds a new object of class [SdsExpressionStatement] to the receiver.
 */
fun SdsBlockLambda.sdsExpressionStatement(expression: SdsAbstractExpression) {
    this.addStatement(createSdsExpressionStatement(expression))
}

/**
 * Adds a new object of class [SdsExpressionStatement] to the receiver.
 */
fun SdsWorkflow.sdsExpressionStatement(expression: SdsAbstractExpression) {
    this.addStatement(createSdsExpressionStatement(expression))
}

/**
 * Adds a new object of class [SdsExpressionStatement] to the receiver.
 */
fun SdsStep.sdsExpressionStatement(expression: SdsAbstractExpression) {
    this.addStatement(createSdsExpressionStatement(expression))
}

/**
 * Returns a new object of class [SdsFloat] if the value is non-negative. Otherwise, the absolute value will be wrapped
 * in a [SdsPrefixOperation] to negate it.
 */
fun createSdsFloat(value: Double): SdsAbstractExpression {
    val float = factory.createSdsFloat().apply {
        this.value = value.absoluteValue
    }

    return when {
        value < 0 -> createSdsPrefixOperation(SdsPrefixOperationOperator.Minus, float)
        else -> float
    }
}

/**
 * Returns a new object of class [SdsFunction].
 */
fun createSdsFunction(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    isStatic: Boolean = false,
    typeParameters: List<SdsTypeParameter> = emptyList(),
    parameters: List<SdsParameter> = emptyList(),
    results: List<SdsResult> = emptyList(),
    constraint: SdsConstraint? = null,
): SdsFunction {
    return factory.createSdsFunction().apply {
        this.name = name
        this.annotationCallList = createSdsAnnotationCallList(annotationCalls)
        this.isStatic = isStatic
        this.typeParameterList = typeParameters.nullIfEmptyElse(::createSdsTypeParameterList)
        this.parameterList = createSdsParameterList(parameters)
        this.resultList = results.nullIfEmptyElse(::createSdsResultList)
        constraint?.let { addStatement(it) }
    }
}

/**
 * Adds a new statement to the receiver.
 */
private fun SdsFunction.addStatement(statement: SdsAbstractObject) {
    if (this.body == null) {
        this.body = factory.createSdsFunctionBody()
    }

    this.body.statements += statement
}

/**
 * Adds a new object of class [SdsFunction] to the receiver.
 */
fun SdsClass.sdsFunction(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    isStatic: Boolean = false,
    typeParameters: List<SdsTypeParameter> = emptyList(),
    parameters: List<SdsParameter> = emptyList(),
    results: List<SdsResult> = emptyList(),
    constraint: SdsConstraint? = null,
) {
    this.addMember(
        createSdsFunction(
            name,
            annotationCalls,
            isStatic,
            typeParameters,
            parameters,
            results,
            constraint,
        ),
    )
}

/**
 * Adds a new object of class [SdsFunction] to the receiver.
 */
fun SdsCompilationUnit.sdsFunction(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    isStatic: Boolean = false,
    typeParameters: List<SdsTypeParameter> = emptyList(),
    parameters: List<SdsParameter> = emptyList(),
    results: List<SdsResult> = emptyList(),
    constraint: SdsConstraint? = null,
) {
    this.addMember(
        createSdsFunction(
            name,
            annotationCalls,
            isStatic,
            typeParameters,
            parameters,
            results,
            constraint,
        ),
    )
}

/**
 * Returns a new object of class [SdsGoalArgument].
 */
fun createSdsGoalArgument(value: SdsAbstractGoalExpression, parameter: SdsParameter? = null): SdsGoalArgument {
    return factory.createSdsGoalArgument().apply {
        this.value = value
        this.parameter = parameter
    }
}

/**
 * Returns a new object of class [SdsGoalArgument] that points to a parameter with the given name.
 */
fun createSdsGoalArgument(value: SdsAbstractGoalExpression, parameterName: String): SdsGoalArgument {
    return createSdsGoalArgument(
        value,
        createSdsParameter(parameterName),
    )
}

/**
 * Returns a new object of class [SdsGoalArgumentList].
 */
fun createSdsGoalArgumentList(arguments: List<SdsGoalArgument>): SdsGoalArgumentList {
    return factory.createSdsGoalArgumentList().apply {
        this.arguments += arguments
    }
}

/**
 * Returns a new object of class [SdsGoalCall].
 */
fun createSdsGoalCall(
    receiver: SdsAbstractGoalExpression,
    arguments: List<SdsGoalArgument>,
): SdsGoalCall {
    return factory.createSdsGoalCall().apply {
        this.receiver = receiver
        this.argumentList = createSdsGoalArgumentList(arguments)
    }
}

/**
 * Returns a new object of class [SdsGoalList].
 */
fun createSdsGoalList(goals: List<SdsAbstractGoal>): SdsGoalList {
    return factory.createSdsGoalList().apply {
        this.goals += goals
    }
}

/**
 * Returns a new object of class [SdsImport].
 */
fun createSdsImport(importedNamespace: String, alias: String? = null): SdsImport {
    return factory.createSdsImport().apply {
        this.importedNamespace = importedNamespace
        this.alias = createSdsImportAlias(alias)
    }
}

/**
 * Returns a new object of class [SdsGoalReference].
 */
fun createSdsGoalReference(declaration: SdsAbstractDeclaration): SdsGoalReference {
    return factory.createSdsGoalReference().apply {
        this.declaration = declaration
    }
}

/**
 * Returns a new object of class [SdsImportAlias] or `null` if the parameter is `null`.
 */
private fun createSdsImportAlias(name: String?): SdsImportAlias? {
    if (name == null) {
        return null
    }

    return factory.createSdsImportAlias().apply {
        this.name = name
    }
}

/**
 * Returns a new object of class [SdsIndexedAccess].
 */
fun createSdsIndexedAccess(
    index: SdsAbstractExpression,
): SdsIndexedAccess {
    return factory.createSdsIndexedAccess().apply {
        this.index = index
    }
}

/**
 * Returns a new object of class [SdsInfixOperation].
 */
fun createSdsInfixOperation(
    leftOperand: SdsAbstractExpression,
    operator: SdsInfixOperationOperator,
    rightOperand: SdsAbstractExpression,
): SdsInfixOperation {
    return factory.createSdsInfixOperation().apply {
        this.leftOperand = leftOperand
        this.operator = operator.operator
        this.rightOperand = rightOperand
    }
}

/**
 * Returns a new object of class [SdsInt] if the value is non-negative. Otherwise, the absolute value will be wrapped in
 * a [SdsPrefixOperation] to negate it.
 */
fun createSdsInt(value: Int): SdsAbstractExpression {
    val int = factory.createSdsInt().apply {
        this.value = value.absoluteValue
    }

    return when {
        value < 0 -> createSdsPrefixOperation(SdsPrefixOperationOperator.Minus, int)
        else -> int
    }
}

/**
 * Returns a new object of class [SdsMemberAccess].
 */
fun createSdsMemberAccess(
    receiver: SdsAbstractExpression,
    member: SdsReference,
    isNullSafe: Boolean = false,
): SdsMemberAccess {
    return factory.createSdsMemberAccess().apply {
        this.receiver = receiver
        this.member = member
        this.isNullSafe = isNullSafe
    }
}

/**
 * Returns a new object of class [SdsMemberType].
 */
fun createSdsMemberType(receiver: SdsAbstractType, member: SdsNamedType): SdsMemberType {
    return factory.createSdsMemberType().apply {
        this.receiver = receiver
        this.member = member
    }
}

/**
 * Returns a new object of class [SdsNamedType].
 */
fun createSdsNamedType(
    declaration: SdsAbstractNamedTypeDeclaration,
    typeArguments: List<SdsTypeArgument> = emptyList(),
    isNullable: Boolean = false,
): SdsNamedType {
    return factory.createSdsNamedType().apply {
        this.declaration = declaration
        this.typeArgumentList = typeArguments.nullIfEmptyElse(::createSdsTypeArgumentList)
        this.isNullable = isNullable
    }
}

/**
 * Returns a new object of class [SdsNull].
 */
fun createSdsNull(): SdsNull {
    return factory.createSdsNull()
}

/**
 * Returns a new object of class [SdsParameter].
 */
fun createSdsParameter(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    isVariadic: Boolean = false,
    type: SdsAbstractType? = null,
    defaultValue: SdsAbstractExpression? = null,
): SdsParameter {
    return factory.createSdsParameter().apply {
        this.name = name
        this.annotationCalls += annotationCalls
        this.isVariadic = isVariadic
        this.type = type
        this.defaultValue = defaultValue
    }
}

/**
 * Returns a new object of class [SdsParameterList].
 */
fun createSdsParameterList(parameters: List<SdsParameter>): SdsParameterList {
    return factory.createSdsParameterList().apply {
        this.parameters += parameters
    }
}

/**
 * Returns a new object of class [SdsLambdaParameterList]. These have to be used as parameter lists of an
 * [SdsAbstractLambda]
 */
fun createSdsLambdaParameterList(parameters: List<SdsParameter>): SdsLambdaParameterList {
    return factory.createSdsLambdaParameterList().apply {
        this.parameters += parameters
    }
}

/**
 * Returns a new object of class [SdsParenthesizedExpression].
 */
fun createSdsParenthesizedExpression(expression: SdsAbstractExpression): SdsParenthesizedExpression {
    return factory.createSdsParenthesizedExpression().apply {
        this.expression = expression
    }
}

/**
 * Returns a new object of class [SdsParenthesizedGoalExpression].
 */
fun createSdsParenthesizedGoalExpression(expressions: List<SdsAbstractGoalExpression>): SdsParenthesizedGoalExpression {
    return factory.createSdsParenthesizedGoalExpression().apply {
        this.expressions += expressions
    }
}

/**
 * Returns a new object of class [SdsParenthesizedType].
 */
fun createSdsParenthesizedType(type: SdsAbstractType): SdsParenthesizedType {
    return factory.createSdsParenthesizedType().apply {
        this.type = type
    }
}

/**
 * Returns a new object of class [SdsParentTypeList].
 */
fun createSdsParentTypeList(parentTypes: List<SdsAbstractType>): SdsParentTypeList {
    return factory.createSdsParentTypeList().apply {
        this.parentTypes += parentTypes
    }
}

/**
 * Returns a new object of class [SdsPlaceholder].
 */
fun createSdsPlaceholder(name: String): SdsPlaceholder {
    return factory.createSdsPlaceholder().apply {
        this.name = name
    }
}

/**
 * Returns a new object of class [SdsParameterizedType].
 */
fun createSdsParameterizedType(type: SdsNamedType? = null): SdsParameterizedType {
    return factory.createSdsParameterizedType().apply {
        this.type = type
    }
}

/**
 * Returns a new object of class [SdsPredicate].
 */
fun createSdsPredicate(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    typeParameters: List<SdsTypeParameter> = emptyList(),
    parameters: List<SdsParameter> = emptyList(),
    results: List<SdsResult> = emptyList(),
    goals: List<SdsAbstractGoal> = emptyList(),
): SdsPredicate {
    return factory.createSdsPredicate().apply {
        this.name = name
        this.annotationCallList = createSdsAnnotationCallList(annotationCalls)
        this.typeParameterList = typeParameters.nullIfEmptyElse(::createSdsTypeParameterList)
        this.parameterList = createSdsParameterList(parameters)
        this.resultList = results.nullIfEmptyElse(::createSdsResultList)
        goals.forEach { addGoal(it) }
    }
}

/**
 * Adds a new object of class [SdsPredicate] to the receiver.
 */
fun SdsCompilationUnit.sdsPredicate(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    typeParameters: List<SdsTypeParameter> = emptyList(),
    parameters: List<SdsParameter> = emptyList(),
    results: List<SdsResult> = emptyList(),
    goals: List<SdsAbstractGoal> = emptyList(),
) {
    this.addMember(
        createSdsPredicate(
            name,
            annotationCalls,
            typeParameters,
            parameters,
            results,
            goals,
        ),
    )
}

/**
 * Adds a new goal to the receiver.
 */
private fun SdsPredicate.addGoal(goal: SdsAbstractGoal) {
    if (this.goalList == null) {
        this.goalList = factory.createSdsGoalList()
    }

    this.goalList.goals += goal
}

/**
 * Returns a new object of class [SdsPrefixOperation].
 */
fun createSdsPrefixOperation(operator: SdsPrefixOperationOperator, operand: SdsAbstractExpression): SdsPrefixOperation {
    return factory.createSdsPrefixOperation().apply {
        this.operator = operator.operator
        this.operand = operand
    }
}

/**
 * Returns a new object of class [SdsProtocol].
 */
@ExperimentalSdsApi
fun createSdsProtocol(
    subterms: List<SdsProtocolSubterm> = emptyList(),
    term: SdsAbstractProtocolTerm? = null,
    init: SdsProtocol.() -> Unit = {},
): SdsProtocol {
    return factory.createSdsProtocol().apply {
        this.body = factory.createSdsProtocolBody()
        subterms.forEach { addSubterm(it) }
        this.body.term = term
        this.init()
    }
}

/**
 * Adds a new object of class [SdsProtocol] to the receiver.
 */
@ExperimentalSdsApi
fun SdsClass.sdsProtocol(
    subterms: List<SdsProtocolSubterm> = emptyList(),
    term: SdsAbstractProtocolTerm? = null,
    init: SdsProtocol.() -> Unit = {},
) {
    this.addMember(createSdsProtocol(subterms, term, init))
}

/**
 * Adds a new subterm to the receiver.
 */
@ExperimentalSdsApi
private fun SdsProtocol.addSubterm(subterm: SdsProtocolSubterm) {
    if (this.body == null) {
        this.body = factory.createSdsProtocolBody()
    }

    if (this.body.subtermList == null) {
        this.body.subtermList = factory.createSdsProtocolSubtermList()
    }

    this.body.subtermList.subterms += subterm
}

/**
 * Returns a new object of class [SdsProtocolAlternative].
 */
@ExperimentalSdsApi
fun createSdsProtocolAlternative(terms: List<SdsAbstractProtocolTerm>): SdsProtocolAlternative {
    if (terms.size < 2) {
        throw IllegalArgumentException("Must have at least two terms.")
    }

    return factory.createSdsProtocolAlternative().apply {
        this.terms += terms
    }
}

/**
 * Returns a new object of class [SdsProtocolComplement].
 */
@ExperimentalSdsApi
fun createSdsProtocolComplement(
    universe: SdsProtocolTokenClass? = null,
    references: List<SdsProtocolReference> = emptyList(),
): SdsProtocolComplement {
    return factory.createSdsProtocolComplement().apply {
        this.universe = universe
        this.referenceList = references.nullIfEmptyElse(::createSdsProtocolReferenceList)
    }
}

/**
 * Returns a new object of class [SdsProtocolParenthesizedTerm].
 */
@ExperimentalSdsApi
fun createSdsProtocolParenthesizedTerm(term: SdsAbstractProtocolTerm): SdsProtocolParenthesizedTerm {
    return factory.createSdsProtocolParenthesizedTerm().apply {
        this.term = term
    }
}

/**
 * Returns a new object of class [SdsProtocolQuantifiedTerm].
 */
@ExperimentalSdsApi
fun createSdsProtocolQuantifiedTerm(
    term: SdsAbstractProtocolTerm,
    quantifier: SdsProtocolQuantifiedTermQuantifier,
): SdsProtocolQuantifiedTerm {
    return factory.createSdsProtocolQuantifiedTerm().apply {
        this.term = term
        this.quantifier = quantifier.quantifier
    }
}

/**
 * Returns a new object of class [SdsProtocolReference].
 */
@ExperimentalSdsApi
fun createSdsProtocolReference(token: SdsAbstractProtocolToken): SdsProtocolReference {
    return factory.createSdsProtocolReference().apply {
        this.token = token
    }
}

/**
 * Returns a new object of class [SdsProtocolReferenceList].
 */
@ExperimentalSdsApi
fun createSdsProtocolReferenceList(references: List<SdsProtocolReference>): SdsProtocolReferenceList {
    return factory.createSdsProtocolReferenceList().apply {
        this.references += references
    }
}

/**
 * Returns a new object of class [SdsProtocolSequence].
 *
 * @throws IllegalArgumentException If `terms.size < 2`.
 */
@ExperimentalSdsApi
fun createSdsProtocolSequence(terms: List<SdsAbstractProtocolTerm>): SdsProtocolSequence {
    if (terms.size < 2) {
        throw IllegalArgumentException("Must have at least two terms.")
    }

    return factory.createSdsProtocolSequence().apply {
        this.terms += terms
    }
}

/**
 * Returns a new object of class [SdsProtocolSubterm].
 */
@ExperimentalSdsApi
fun createSdsProtocolSubterm(name: String, term: SdsAbstractProtocolTerm): SdsProtocolSubterm {
    return factory.createSdsProtocolSubterm().apply {
        this.name = name
        this.term = term
    }
}

/**
 * Returns a new object of class [SdsProtocolSubterm].
 */
@ExperimentalSdsApi
fun SdsProtocol.sdsProtocolSubterm(name: String, term: SdsAbstractProtocolTerm) {
    this.addSubterm(createSdsProtocolSubterm(name, term))
}

/**
 * Returns a new object of class [SdsProtocolTokenClass].
 */
@ExperimentalSdsApi
fun createSdsProtocolTokenClass(value: SdsProtocolTokenClassValue): SdsProtocolTokenClass {
    return factory.createSdsProtocolTokenClass().apply {
        this.value = value.value
    }
}

/**
 * Returns a new object of class [SdsReference].
 */
fun createSdsReference(declaration: SdsAbstractDeclaration): SdsReference {
    return factory.createSdsReference().apply {
        this.declaration = declaration
    }
}

/**
 * Returns a new object of class [SdsResult].
 */
fun createSdsResult(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    type: SdsAbstractType? = null,
): SdsResult {
    return factory.createSdsResult().apply {
        this.name = name
        this.annotationCalls += annotationCalls
        this.type = type
    }
}

/**
 * Returns a new object of class [SdsResultList].
 */
fun createSdsResultList(results: List<SdsResult>): SdsResultList {
    return factory.createSdsResultList().apply {
        this.results += results
    }
}

/**
 * Returns a new object of class [SdsStarProjection].
 */
fun createSdsStarProjection(): SdsStarProjection {
    return factory.createSdsStarProjection()
}

/**
 * Returns a new object of class [SdsSchema].
 */
@ExperimentalSdsApi
fun createSdsSchema(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    columns: List<SdsColumn> = emptyList(),
): SdsSchema {
    return factory.createSdsSchema().apply {
        this.name = name
        this.annotationCallList = createSdsAnnotationCallList(annotationCalls)
        columns.forEach { addColumn(it) }
    }
}

/**
 * Adds a new object of class [SdsSchema] to the receiver.
 */
@ExperimentalSdsApi
fun SdsCompilationUnit.sdsSchema(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    columns: List<SdsColumn> = emptyList(),
) {
    this.addMember(
        createSdsSchema(
            name,
            annotationCalls,
            columns,
        ),
    )
}

/**
 * Adds a new column to the receiver.
 */
@ExperimentalSdsApi
private fun SdsSchema.addColumn(column: SdsColumn) {
    if (this.columnList == null) {
        this.columnList = factory.createSdsColumnList()
    }
    this.columnList.columns += column
}

/**
 * Returns a new object of class [SdsStep].
 */
fun createSdsStep(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    visibility: SdsVisibility = SdsVisibility.Public,
    parameters: List<SdsParameter> = emptyList(),
    results: List<SdsResult> = emptyList(),
    statements: List<SdsAbstractStatement> = emptyList(),
    init: SdsStep.() -> Unit = {},
): SdsStep {
    return factory.createSdsStep().apply {
        this.name = name
        this.annotationCallList = createSdsAnnotationCallList(annotationCalls)
        this.visibility = visibility.visibility
        this.parameterList = createSdsParameterList(parameters)
        this.resultList = results.nullIfEmptyElse(::createSdsResultList)
        this.body = factory.createSdsBlock()
        statements.forEach { addStatement(it) }
        this.init()
    }
}

/**
 * Adds a new object of class [SdsStep] to the receiver.
 */
fun SdsCompilationUnit.sdsStep(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    visibility: SdsVisibility = SdsVisibility.Public,
    parameters: List<SdsParameter> = emptyList(),
    results: List<SdsResult> = emptyList(),
    statements: List<SdsAbstractStatement> = emptyList(),
    init: SdsStep.() -> Unit = {},
) {
    this.addMember(
        createSdsStep(
            name,
            annotationCalls,
            visibility,
            parameters,
            results,
            statements,
            init,
        ),
    )
}

/**
 * Adds a new statement to the receiver.
 */
private fun SdsStep.addStatement(statement: SdsAbstractStatement) {
    if (this.body == null) {
        this.body = factory.createSdsBlock()
    }

    this.body.statements += statement
}

/**
 * Returns a new object of class [SdsString].
 */
fun createSdsString(value: String): SdsString {
    return factory.createSdsString().apply {
        this.value = value
    }
}

/**
 * Returns a new object of class [SdsTemplateString]. String parts should not include delimiters (`"`, `{{`, `}}`).
 * Template expressions are inserted between the string parts.
 *
 * @throws IllegalArgumentException If `stringParts.size < 2`.
 * @throws IllegalArgumentException If `templateExpressions` is empty.
 * @throws IllegalArgumentException If `stringsParts.size` != `templateExpressions.size + 1`.
 */
fun createSdsTemplateString(
    stringParts: List<String>,
    templateExpressions: List<SdsAbstractExpression>,
): SdsTemplateString {
    // One of the first two checks is sufficient but this allows better error messages.
    if (stringParts.size < 2) {
        throw IllegalArgumentException("Must have at least two string parts.")
    } else if (templateExpressions.isEmpty()) {
        throw IllegalArgumentException("Must have at least one template expression.")
    } else if (stringParts.size != templateExpressions.size + 1) {
        throw IllegalArgumentException("Must have exactly one more string part than there are template expressions.")
    }

    return factory.createSdsTemplateString().apply {
        stringParts.forEachIndexed { index, value ->

            // Next template string part
            this.expressions += when (index) {
                0 -> {
                    factory.createSdsTemplateStringStart().apply {
                        this.value = value
                    }
                }
                stringParts.size - 1 -> {
                    factory.createSdsTemplateStringEnd().apply {
                        this.value = value
                    }
                }
                else -> {
                    factory.createSdsTemplateStringInner().apply {
                        this.value = value
                    }
                }
            }

            // Next template expression
            if (index < templateExpressions.size) {
                this.expressions += templateExpressions[index]
            }
        }

        this.expressions += expressions
    }
}

/**
 * Returns a new object of class [SdsTypeArgument].
 */
fun createSdsTypeArgument(
    value: SdsAbstractTypeArgumentValue,
    typeParameter: SdsTypeParameter? = null,
): SdsTypeArgument {
    return factory.createSdsTypeArgument().apply {
        this.value = value
        this.typeParameter = typeParameter
    }
}

/**
 * Returns a new object of class [SdsTypeArgument] that points to a type parameter with the given name.
 */
@OptIn(ExperimentalSdsApi::class)
fun createSdsTypeArgument(
    value: SdsAbstractTypeArgumentValue,
    typeParameterName: String,
): SdsTypeArgument {
    return createSdsTypeArgument(
        value,
        createSdsTypeParameter(typeParameterName),
    )
}

/**
 * Returns a new object of class [SdsTypeArgumentList].
 */
fun createSdsTypeArgumentList(typeArguments: List<SdsTypeArgument>): SdsTypeArgumentList {
    return factory.createSdsTypeArgumentList().apply {
        this.typeArguments += typeArguments
    }
}

/**
 * Returns a new object of class [SdsTypeParameter].
 */
@ExperimentalSdsApi
fun createSdsTypeParameter(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    variance: SdsVariance = SdsVariance.Invariant,
    kind: SdsKind = SdsKind.NoKind,
): SdsTypeParameter {
    return factory.createSdsTypeParameter().apply {
        this.name = name
        this.annotationCalls += annotationCalls
        this.variance = variance.variance
        this.kind = kind.kind
    }
}

/**
 * Returns a new object of class [SdsTypeParameterList].
 */
fun createSdsTypeParameterList(typeParameters: List<SdsTypeParameter>): SdsTypeParameterList {
    return factory.createSdsTypeParameterList().apply {
        this.typeParameters += typeParameters
    }
}

/**
 * Returns a new object of class [SdsTypeParameterConstraintGoal].
 */
@ExperimentalSdsApi
fun createSdsTypeParameterConstraintGoal(
    leftOperand: SdsTypeParameter,
    operator: SdsTypeParameterConstraintOperator,
    rightOperand: SdsAbstractType,
): SdsTypeParameterConstraintGoal {
    return factory.createSdsTypeParameterConstraintGoal().apply {
        this.leftOperand = leftOperand
        this.operator = operator.operator
        this.rightOperand = rightOperand
    }
}

/**
 * Returns a new object of class [SdsTypeParameterConstraintGoal] that points to a type parameter with the given name.
 */
@ExperimentalSdsApi
fun createSdsTypeParameterConstraintGoal(
    leftOperandName: String,
    operator: SdsTypeParameterConstraintOperator,
    rightOperand: SdsAbstractType,
): SdsTypeParameterConstraintGoal {
    return createSdsTypeParameterConstraintGoal(
        createSdsTypeParameter(leftOperandName),
        operator,
        rightOperand,
    )
}

/**
 * Returns a new object of class [SdsTypeProjection].
 */
@ExperimentalSdsApi
fun createSdsTypeProjection(type: SdsAbstractType, variance: SdsVariance = SdsVariance.Invariant): SdsTypeProjection {
    return factory.createSdsTypeProjection().apply {
        this.type = type
        this.variance = variance.variance
    }
}

/**
 * Returns a new object of class [SdsUnionType].
 *
 * @throws IllegalArgumentException If no type arguments are passed.
 */
fun createSdsUnionType(typeArguments: List<SdsTypeArgument>): SdsUnionType {
    if (typeArguments.isEmpty()) {
        throw IllegalArgumentException("Must have at least one type argument.")
    }

    return factory.createSdsUnionType().apply {
        this.typeArgumentList = createSdsTypeArgumentList(typeArguments)
    }
}

/**
 * Returns a new object of class [SdsWildcard].
 */
fun createSdsWildcard(): SdsWildcard {
    return factory.createSdsWildcard()
}

/**
 * Returns a new object of class [SdsWorkflow].
 */
fun createSdsWorkflow(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    statements: List<SdsAbstractStatement> = emptyList(),
    init: SdsWorkflow.() -> Unit = {},
): SdsWorkflow {
    return factory.createSdsWorkflow().apply {
        this.name = name
        this.annotationCallList = createSdsAnnotationCallList(annotationCalls)
        this.body = factory.createSdsBlock()
        statements.forEach { addStatement(it) }
        this.init()
    }
}

/**
 * Adds a new object of class [SdsWorkflow] to the receiver.
 */
fun SdsCompilationUnit.sdsWorkflow(
    name: String,
    annotationCalls: List<SdsAnnotationCall> = emptyList(),
    statements: List<SdsAbstractStatement> = emptyList(),
    init: SdsWorkflow.() -> Unit = {},
) {
    this.addMember(createSdsWorkflow(name, annotationCalls, statements, init))
}

/**
 * Adds a new statement to the receiver.
 */
private fun SdsWorkflow.addStatement(statement: SdsAbstractStatement) {
    if (this.body == null) {
        this.body = factory.createSdsBlock()
    }

    this.body.statements += statement
}

/**
 * Returns a new object of class [SdsYield].
 */
fun createSdsYield(result: SdsResult): SdsYield {
    return factory.createSdsYield().apply {
        this.result = result
    }
}

/**
 * Returns a new object of class [SdsYield] that points to a result with the given name.
 */
fun createSdsYield(resultName: String): SdsYield {
    return createSdsYield(createSdsResult(resultName))
}
