@file:Suppress("unused")

package com.larsreimann.safeds.emf

import de.unibonn.simpleml.constant.SmlFileExtension
import de.unibonn.simpleml.constant.SmlInfixOperationOperator
import de.unibonn.simpleml.constant.SmlKind
import de.unibonn.simpleml.constant.SmlPrefixOperationOperator
import de.unibonn.simpleml.constant.SmlProtocolQuantifiedTermQuantifier
import de.unibonn.simpleml.constant.SmlProtocolTokenClassValue
import de.unibonn.simpleml.constant.SmlTypeParameterConstraintOperator
import de.unibonn.simpleml.constant.SmlVariance
import de.unibonn.simpleml.constant.SmlVisibility
import de.unibonn.simpleml.simpleML.SimpleMLFactory
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
import de.unibonn.simpleml.utils.nullIfEmptyElse
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.xtext.resource.XtextResource
import kotlin.math.absoluteValue

private val factory = SimpleMLFactory.eINSTANCE

/**
 * Returns a new [Resource].
 *
 * This can be useful to serialize EObjects that were initialized with the creators in this file rather than generated
 * by the parser, since serialization requires EObjects to be contained in a resource.
 */
fun createSmlDummyResource(
    fileName: String,
    fileExtension: SmlFileExtension,
    compilationUnit: SmlCompilationUnit
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
fun createSmlDummyResource(
    fileName: String,
    fileExtension: SmlFileExtension,
    packageName: String,
    init: SmlCompilationUnit.() -> Unit = {}
): Resource {
    val uri = URI.createURI("dummy:/$fileName.${fileExtension.extension}")
    return XtextResource(uri).apply {
        this.contents += createSmlCompilationUnit(
            packageName = packageName,
            init = init
        )
    }
}

/**
 * Returns a new object of class [SmlAnnotation].
 */
fun createSmlAnnotation(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    parameters: List<SmlParameter> = emptyList()
): SmlAnnotation {
    return factory.createSmlAnnotation().apply {
        this.name = name
        this.annotationCallList = createSmlAnnotationCallList(annotationCalls)
        this.parameterList = parameters.nullIfEmptyElse(::createSmlParameterList)
    }
}

/**
 * Adds a new object of class [SmlAnnotation] to the receiver.
 */
fun SmlCompilationUnit.smlAnnotation(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    parameters: List<SmlParameter> = emptyList()
) {
    this.addMember(createSmlAnnotation(name, annotationCalls, parameters))
}

/**
 * Returns a new object of class [SmlAnnotationCall].
 */
fun createSmlAnnotationCall(
    annotation: SmlAnnotation,
    arguments: List<SmlArgument> = emptyList()
): SmlAnnotationCall {
    return factory.createSmlAnnotationCall().apply {
        this.annotation = annotation
        this.argumentList = arguments.nullIfEmptyElse(::createSmlArgumentList)
    }
}

/**
 * Returns a new object of class [SmlAnnotationCall] that points to an annotation with the given name.
 */
fun createSmlAnnotationCall(
    annotationName: String,
    arguments: List<SmlArgument> = emptyList()
): SmlAnnotationCall {
    return createSmlAnnotationCall(
        createSmlAnnotation(annotationName),
        arguments
    )
}

/**
 * Returns a new object of class [SmlAnnotationCallList].
 */
private fun createSmlAnnotationCallList(annotationCalls: List<SmlAnnotationCall>): SmlAnnotationCallList {
    return factory.createSmlAnnotationCallList().apply {
        this.annotationCalls += annotationCalls
    }
}

/**
 * Returns a new object of class [SmlArgument].
 */
fun createSmlArgument(value: SmlAbstractExpression, parameter: SmlParameter? = null): SmlArgument {
    return factory.createSmlArgument().apply {
        this.value = value
        this.parameter = parameter
    }
}

/**
 * Returns a new object of class [SmlArgument] that points to a parameter with the given name.
 */
fun createSmlArgument(value: SmlAbstractExpression, parameterName: String): SmlArgument {
    return createSmlArgument(
        value,
        createSmlParameter(parameterName)
    )
}

/**
 * Returns a new object of class [SmlArgumentList].
 */
fun createSmlArgumentList(arguments: List<SmlArgument>): SmlArgumentList {
    return factory.createSmlArgumentList().apply {
        this.arguments += arguments
    }
}

/**
 * Returns a new object of class [SmlAssigneeList].
 */
fun createSmlAssigneeList(assignees: List<SmlAbstractAssignee>): SmlAssigneeList {
    return factory.createSmlAssigneeList().apply {
        this.assignees += assignees
    }
}

/**
 * Returns a new object of class [SmlAssignment].
 *
 * @throws IllegalArgumentException If no assignees are passed.
 */
fun createSmlAssignment(assignees: List<SmlAbstractAssignee>, expression: SmlAbstractExpression): SmlAssignment {
    if (assignees.isEmpty()) {
        throw IllegalArgumentException("Must have at least one assignee.")
    }

    return factory.createSmlAssignment().apply {
        this.assigneeList = createSmlAssigneeList(assignees)
        this.expression = expression
    }
}

/**
 * Adds a new object of class [SmlAssignment] to the receiver.
 */
fun SmlBlockLambda.smlAssignment(assignees: List<SmlAbstractAssignee>, expression: SmlAbstractExpression) {
    this.addStatement(createSmlAssignment(assignees, expression))
}

/**
 * Adds a new object of class [SmlAssignment] to the receiver.
 */
fun SmlWorkflow.smlAssignment(assignees: List<SmlAbstractAssignee>, expression: SmlAbstractExpression) {
    this.addStatement(createSmlAssignment(assignees, expression))
}

/**
 * Adds a new object of class [SmlAssignment] to the receiver.
 */
fun SmlStep.smlAssignment(assignees: List<SmlAbstractAssignee>, expression: SmlAbstractExpression) {
    this.addStatement(createSmlAssignment(assignees, expression))
}

/**
 * Returns a new object of class [SmlAssignmentGoal].
 */
fun createSmlAssignmentGoal(placeholderName: String, expression: SmlAbstractGoalExpression): SmlAssignmentGoal {
    return factory.createSmlAssignmentGoal().apply {
        this.placeholder = factory.createSmlGoalPlaceholder().apply {
            this.name = placeholderName
        }
        this.expression = expression
    }
}

/**
 * Adds a new object of class [SmlAssignmentGoal] to the receiver.
 */
fun SmlPredicate.smlAssignmentGoal(placeholderName: String, expression: SmlAbstractGoalExpression) {
    this.addGoal(createSmlAssignmentGoal(placeholderName, expression))
}

/**
 * Returns a new object of class [SmlAttribute].
 */
fun createSmlAttribute(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    isStatic: Boolean = false,
    type: SmlAbstractType? = null
): SmlAttribute {
    return factory.createSmlAttribute().apply {
        this.name = name
        this.annotationCallList = createSmlAnnotationCallList(annotationCalls)
        this.isStatic = isStatic
        this.type = type
    }
}

/**
 * Adds a new object of class [SmlAttribute] to the receiver.
 */
fun SmlClass.smlAttribute(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    isStatic: Boolean = false,
    type: SmlAbstractType? = null
) {
    this.addMember(createSmlAttribute(name, annotationCalls, isStatic, type))
}

/**
 * Returns a new object of class [SmlBlock].
 */
fun createSmlBlock(
    statements: List<SmlAbstractStatement> = emptyList(),
    init: SmlBlock.() -> Unit = {}
): SmlBlock {
    return factory.createSmlBlock().apply {
        this.statements += statements
        this.init()
    }
}

/**
 * Returns a new object of class [SmlBlockLambda].
 */
fun createSmlBlockLambda(
    parameters: List<SmlParameter> = emptyList(),
    statements: List<SmlAbstractStatement> = emptyList(),
    init: SmlBlockLambda.() -> Unit = {}
): SmlBlockLambda {
    return factory.createSmlBlockLambda().apply {
        this.parameterList = createSmlLambdaParameterList(parameters)
        this.body = factory.createSmlBlock()
        statements.forEach { addStatement(it) }
        this.init()
    }
}

/**
 * Adds a new statement to the receiver.
 */
private fun SmlBlockLambda.addStatement(statement: SmlAbstractStatement) {
    if (this.body == null) {
        this.body = factory.createSmlBlock()
    }

    this.body.statements += statement
}

/**
 * Returns a new object of class [SmlBlockLambdaResult].
 */
fun createSmlBlockLambdaResult(name: String): SmlBlockLambdaResult {
    return factory.createSmlBlockLambdaResult().apply {
        this.name = name
    }
}

/**
 * Returns a new object of class [SmlBoolean].
 */
fun createSmlBoolean(value: Boolean): SmlBoolean {
    return factory.createSmlBoolean().apply {
        this.isTrue = value
    }
}

/**
 * Returns a new object of class [SmlCall].
 */
fun createSmlCall(
    receiver: SmlAbstractExpression,
    typeArguments: List<SmlTypeArgument> = emptyList(),
    arguments: List<SmlArgument> = emptyList()
): SmlCall {
    return factory.createSmlCall().apply {
        this.receiver = receiver
        this.typeArgumentList = typeArguments.nullIfEmptyElse(::createSmlTypeArgumentList)
        this.argumentList = createSmlArgumentList(arguments)
    }
}

/**
 * Returns a new object of class [SmlCallableType].
 */
fun createSmlCallableType(parameters: List<SmlParameter>, results: List<SmlResult>): SmlCallableType {
    return factory.createSmlCallableType().apply {
        this.parameterList = createSmlParameterList(parameters)
        this.resultList = createSmlResultList(results)
    }
}

/**
 * Returns a new object of class [SmlClass].
 */
fun createSmlClass(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    typeParameters: List<SmlTypeParameter> = emptyList(),
    parameters: List<SmlParameter>? = null, // null and emptyList() are semantically different
    parentTypes: List<SmlAbstractType> = emptyList(),
    constraint: SmlConstraint? = null,
    protocol: SmlProtocol? = null,
    members: List<SmlAbstractClassMember> = emptyList(),
    init: SmlClass.() -> Unit = {}
): SmlClass {
    return factory.createSmlClass().apply {
        this.name = name
        this.annotationCallList = createSmlAnnotationCallList(annotationCalls)
        this.typeParameterList = typeParameters.nullIfEmptyElse(::createSmlTypeParameterList)
        this.parameterList = parameters?.let { createSmlParameterList(it) }
        this.parentTypeList = parentTypes.nullIfEmptyElse(::createSmlParentTypeList)
        protocol?.let { addMember(it) }
        constraint?.let { addMember(it) }
        members.forEach { addMember(it) }
        this.init()
    }
}

/**
 * Adds a new object of class [SmlClass] to the receiver.
 */
fun SmlClass.smlClass(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    typeParameters: List<SmlTypeParameter> = emptyList(),
    parameters: List<SmlParameter>? = null,
    parentTypes: List<SmlAbstractType> = emptyList(),
    constraint: SmlConstraint? = null,
    protocol: SmlProtocol? = null,
    members: List<SmlAbstractClassMember> = emptyList(),
    init: SmlClass.() -> Unit = {}
) {
    this.addMember(
        createSmlClass(
            name,
            annotationCalls,
            typeParameters,
            parameters,
            parentTypes,
            constraint,
            protocol,
            members,
            init
        )
    )
}

/**
 * Adds a new object of class [SmlClass] to the receiver.
 */
fun SmlCompilationUnit.smlClass(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    typeParameters: List<SmlTypeParameter> = emptyList(),
    parameters: List<SmlParameter>? = null,
    parentTypes: List<SmlAbstractType> = emptyList(),
    constraint: SmlConstraint? = null,
    protocol: SmlProtocol? = null,
    members: List<SmlAbstractClassMember> = emptyList(),
    init: SmlClass.() -> Unit = {}
) {
    this.addMember(
        createSmlClass(
            name,
            annotationCalls,
            typeParameters,
            parameters,
            parentTypes,
            constraint,
            protocol,
            members,
            init
        )
    )
}

/**
 * Adds a new member to the receiver.
 */
private fun SmlClass.addMember(member: SmlAbstractObject) {
    if (this.body == null) {
        this.body = factory.createSmlClassBody()
    }

    this.body.members += member
}

/**
 * Returns a new object of class [SmlCompilationUnit].
 */
fun createSmlCompilationUnit(
    packageName: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    imports: List<SmlImport> = emptyList(),
    members: List<SmlAbstractCompilationUnitMember> = emptyList(),
    init: SmlCompilationUnit.() -> Unit = {}
): SmlCompilationUnit {
    return factory.createSmlCompilationUnit().apply {
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
private fun SmlCompilationUnit.addMember(member: SmlAbstractCompilationUnitMember) {
    this.members += member
}

/**
 * Returns a new object of class [SmlConstraint].
 */
fun createSmlConstraint(goals: List<SmlAbstractConstraintGoal>): SmlConstraint {
    return factory.createSmlConstraint().apply {
        this.constraintList = createSmlGoalList(goals)
    }
}

/**
 * Returns a new object of class [SmlEnum].
 */
fun createSmlEnum(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    variants: List<SmlEnumVariant> = emptyList(),
    init: SmlEnum.() -> Unit = {}
): SmlEnum {
    return factory.createSmlEnum().apply {
        this.name = name
        this.annotationCallList = createSmlAnnotationCallList(annotationCalls)
        variants.forEach { addVariant(it) }
        this.init()
    }
}

/**
 * Adds a new object of class [SmlEnum] to the receiver.
 */
fun SmlClass.smlEnum(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    variants: List<SmlEnumVariant> = emptyList(),
    init: SmlEnum.() -> Unit = {}
) {
    this.addMember(createSmlEnum(name, annotationCalls, variants, init))
}

/**
 * Adds a new object of class [SmlEnum] to the receiver.
 */
fun SmlCompilationUnit.smlEnum(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    variants: List<SmlEnumVariant> = emptyList(),
    init: SmlEnum.() -> Unit = {}
) {
    this.addMember(createSmlEnum(name, annotationCalls, variants, init))
}

/**
 * Adds a new variant to the receiver.
 */
private fun SmlEnum.addVariant(variant: SmlEnumVariant) {
    if (this.body == null) {
        this.body = factory.createSmlEnumBody()
    }

    this.body.variants += variant
}

/**
 * Returns a new object of class [SmlEnumVariant].
 */
fun createSmlEnumVariant(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    typeParameters: List<SmlTypeParameter> = emptyList(),
    parameters: List<SmlParameter> = emptyList(),
    constraint: SmlConstraint? = null,
): SmlEnumVariant {
    return factory.createSmlEnumVariant().apply {
        this.name = name
        this.annotationCalls += annotationCalls
        this.typeParameterList = typeParameters.nullIfEmptyElse(::createSmlTypeParameterList)
        this.parameterList = parameters.nullIfEmptyElse(::createSmlParameterList)
        this.constraint = constraint
    }
}

/**
 * Adds a new object of class [SmlEnumVariant] to the receiver.
 */
fun SmlEnum.smlEnumVariant(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    typeParameters: List<SmlTypeParameter> = emptyList(),
    parameters: List<SmlParameter> = emptyList(),
    constraint: SmlConstraint? = null
) {
    this.addVariant(createSmlEnumVariant(name, annotationCalls, typeParameters, parameters, constraint))
}

/**
 * Returns a new object of class [SmlExpressionGoal].
 */
fun createSmlExpressionGoal(expression: SmlAbstractGoalExpression): SmlExpressionGoal {
    return factory.createSmlExpressionGoal().apply {
        this.expression = expression
    }
}

/**
 * Adds a new object of class [SmlExpressionGoal] to the receiver.
 */
fun SmlPredicate.smlExpressionGoal(expression: SmlAbstractGoalExpression) {
    this.addGoal(createSmlExpressionGoal(expression))
}

/**
 * Returns a new object of class [SmlExpressionLambda].
 */
fun createSmlExpressionLambda(
    parameters: List<SmlParameter> = emptyList(),
    result: SmlAbstractExpression
): SmlExpressionLambda {
    return factory.createSmlExpressionLambda().apply {
        this.parameterList = createSmlLambdaParameterList(parameters)
        this.result = result
    }
}

/**
 * Returns a new object of class [SmlExpressionStatement].
 */
fun createSmlExpressionStatement(expression: SmlAbstractExpression): SmlExpressionStatement {
    return factory.createSmlExpressionStatement().apply {
        this.expression = expression
    }
}

/**
 * Adds a new object of class [SmlExpressionStatement] to the receiver.
 */
fun SmlBlockLambda.smlExpressionStatement(expression: SmlAbstractExpression) {
    this.addStatement(createSmlExpressionStatement(expression))
}

/**
 * Adds a new object of class [SmlExpressionStatement] to the receiver.
 */
fun SmlWorkflow.smlExpressionStatement(expression: SmlAbstractExpression) {
    this.addStatement(createSmlExpressionStatement(expression))
}

/**
 * Adds a new object of class [SmlExpressionStatement] to the receiver.
 */
fun SmlStep.smlExpressionStatement(expression: SmlAbstractExpression) {
    this.addStatement(createSmlExpressionStatement(expression))
}

/**
 * Returns a new object of class [SmlFloat] if the value is non-negative. Otherwise, the absolute value will be wrapped
 * in a [SmlPrefixOperation] to negate it.
 */
fun createSmlFloat(value: Double): SmlAbstractExpression {
    val float = factory.createSmlFloat().apply {
        this.value = value.absoluteValue
    }

    return when {
        value < 0 -> createSmlPrefixOperation(SmlPrefixOperationOperator.Minus, float)
        else -> float
    }
}

/**
 * Returns a new object of class [SmlFunction].
 */
fun createSmlFunction(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    isStatic: Boolean = false,
    typeParameters: List<SmlTypeParameter> = emptyList(),
    parameters: List<SmlParameter> = emptyList(),
    results: List<SmlResult> = emptyList(),
    constraint: SmlConstraint? = null
): SmlFunction {
    return factory.createSmlFunction().apply {
        this.name = name
        this.annotationCallList = createSmlAnnotationCallList(annotationCalls)
        this.isStatic = isStatic
        this.typeParameterList = typeParameters.nullIfEmptyElse(::createSmlTypeParameterList)
        this.parameterList = createSmlParameterList(parameters)
        this.resultList = results.nullIfEmptyElse(::createSmlResultList)
        constraint?.let { addStatement(it) }
    }
}

/**
 * Adds a new statement to the receiver.
 */
private fun SmlFunction.addStatement(statement: SmlAbstractObject) {
    if (this.body == null) {
        this.body = factory.createSmlFunctionBody()
    }

    this.body.statements += statement
}

/**
 * Adds a new object of class [SmlFunction] to the receiver.
 */
fun SmlClass.smlFunction(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    isStatic: Boolean = false,
    typeParameters: List<SmlTypeParameter> = emptyList(),
    parameters: List<SmlParameter> = emptyList(),
    results: List<SmlResult> = emptyList(),
    constraint: SmlConstraint? = null
) {
    this.addMember(
        createSmlFunction(
            name,
            annotationCalls,
            isStatic,
            typeParameters,
            parameters,
            results,
            constraint
        )
    )
}

/**
 * Adds a new object of class [SmlFunction] to the receiver.
 */
fun SmlCompilationUnit.smlFunction(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    isStatic: Boolean = false,
    typeParameters: List<SmlTypeParameter> = emptyList(),
    parameters: List<SmlParameter> = emptyList(),
    results: List<SmlResult> = emptyList(),
    constraint: SmlConstraint? = null
) {
    this.addMember(
        createSmlFunction(
            name,
            annotationCalls,
            isStatic,
            typeParameters,
            parameters,
            results,
            constraint
        )
    )
}

/**
 * Returns a new object of class [SmlGoalArgument].
 */
fun createSmlGoalArgument(value: SmlAbstractGoalExpression, parameter: SmlParameter? = null): SmlGoalArgument {
    return factory.createSmlGoalArgument().apply {
        this.value = value
        this.parameter = parameter
    }
}

/**
 * Returns a new object of class [SmlGoalArgument] that points to a parameter with the given name.
 */
fun createSmlGoalArgument(value: SmlAbstractGoalExpression, parameterName: String): SmlGoalArgument {
    return createSmlGoalArgument(
        value,
        createSmlParameter(parameterName)
    )
}

/**
 * Returns a new object of class [SmlGoalArgumentList].
 */
fun createSmlGoalArgumentList(arguments: List<SmlGoalArgument>): SmlGoalArgumentList {
    return factory.createSmlGoalArgumentList().apply {
        this.arguments += arguments
    }
}

/**
 * Returns a new object of class [SmlGoalCall].
 */
fun createSmlGoalCall(
    receiver: SmlAbstractGoalExpression,
    arguments: List<SmlGoalArgument>
): SmlGoalCall {
    return factory.createSmlGoalCall().apply {
        this.receiver = receiver
        this.argumentList = createSmlGoalArgumentList(arguments)
    }
}

/**
 * Returns a new object of class [SmlGoalList].
 */
fun createSmlGoalList(goals: List<SmlAbstractGoal>): SmlGoalList {
    return factory.createSmlGoalList().apply {
        this.goals += goals
    }
}

/**
 * Returns a new object of class [SmlImport].
 */
fun createSmlImport(importedNamespace: String, alias: String? = null): SmlImport {
    return factory.createSmlImport().apply {
        this.importedNamespace = importedNamespace
        this.alias = createSmlImportAlias(alias)
    }
}

/**
 * Returns a new object of class [SmlGoalReference].
 */
fun createSmlGoalReference(declaration: SmlAbstractDeclaration): SmlGoalReference {
    return factory.createSmlGoalReference().apply {
        this.declaration = declaration
    }
}

/**
 * Returns a new object of class [SmlImportAlias] or `null` if the parameter is `null`.
 */
private fun createSmlImportAlias(name: String?): SmlImportAlias? {
    if (name == null) {
        return null
    }

    return factory.createSmlImportAlias().apply {
        this.name = name
    }
}

/**
 * Returns a new object of class [SmlIndexedAccess].
 */
fun createSmlIndexedAccess(
    index: SmlAbstractExpression
): SmlIndexedAccess {
    return factory.createSmlIndexedAccess().apply {
        this.index = index
    }
}

/**
 * Returns a new object of class [SmlInfixOperation].
 */
fun createSmlInfixOperation(
    leftOperand: SmlAbstractExpression,
    operator: SmlInfixOperationOperator,
    rightOperand: SmlAbstractExpression
): SmlInfixOperation {
    return factory.createSmlInfixOperation().apply {
        this.leftOperand = leftOperand
        this.operator = operator.operator
        this.rightOperand = rightOperand
    }
}

/**
 * Returns a new object of class [SmlInt] if the value is non-negative. Otherwise, the absolute value will be wrapped in
 * a [SmlPrefixOperation] to negate it.
 */
fun createSmlInt(value: Int): SmlAbstractExpression {
    val int = factory.createSmlInt().apply {
        this.value = value.absoluteValue
    }

    return when {
        value < 0 -> createSmlPrefixOperation(SmlPrefixOperationOperator.Minus, int)
        else -> int
    }
}

/**
 * Returns a new object of class [SmlMemberAccess].
 */
fun createSmlMemberAccess(
    receiver: SmlAbstractExpression,
    member: SmlReference,
    isNullSafe: Boolean = false
): SmlMemberAccess {
    return factory.createSmlMemberAccess().apply {
        this.receiver = receiver
        this.member = member
        this.isNullSafe = isNullSafe
    }
}

/**
 * Returns a new object of class [SmlMemberType].
 */
fun createSmlMemberType(receiver: SmlAbstractType, member: SmlNamedType): SmlMemberType {
    return factory.createSmlMemberType().apply {
        this.receiver = receiver
        this.member = member
    }
}

/**
 * Returns a new object of class [SmlNamedType].
 */
fun createSmlNamedType(
    declaration: SmlAbstractNamedTypeDeclaration,
    typeArguments: List<SmlTypeArgument> = emptyList(),
    isNullable: Boolean = false
): SmlNamedType {
    return factory.createSmlNamedType().apply {
        this.declaration = declaration
        this.typeArgumentList = typeArguments.nullIfEmptyElse(::createSmlTypeArgumentList)
        this.isNullable = isNullable
    }
}

/**
 * Returns a new object of class [SmlNull].
 */
fun createSmlNull(): SmlNull {
    return factory.createSmlNull()
}

/**
 * Returns a new object of class [SmlParameter].
 */
fun createSmlParameter(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    isVariadic: Boolean = false,
    type: SmlAbstractType? = null,
    defaultValue: SmlAbstractExpression? = null
): SmlParameter {
    return factory.createSmlParameter().apply {
        this.name = name
        this.annotationCalls += annotationCalls
        this.isVariadic = isVariadic
        this.type = type
        this.defaultValue = defaultValue
    }
}

/**
 * Returns a new object of class [SmlParameterList].
 */
fun createSmlParameterList(parameters: List<SmlParameter>): SmlParameterList {
    return factory.createSmlParameterList().apply {
        this.parameters += parameters
    }
}

/**
 * Returns a new object of class [SmlLambdaParameterList]. These have to be used as parameter lists of an
 * [SmlAbstractLambda]
 */
@Suppress("FunctionName")
fun createSmlLambdaParameterList(parameters: List<SmlParameter>): SmlLambdaParameterList {
    return factory.createSmlLambdaParameterList().apply {
        this.parameters += parameters
    }
}

/**
 * Returns a new object of class [SmlParenthesizedExpression].
 */
fun createSmlParenthesizedExpression(expression: SmlAbstractExpression): SmlParenthesizedExpression {
    return factory.createSmlParenthesizedExpression().apply {
        this.expression = expression
    }
}

/**
 * Returns a new object of class [SmlParenthesizedGoalExpression].
 */
fun createSmlParenthesizedGoalExpression(expressions: List<SmlAbstractGoalExpression>): SmlParenthesizedGoalExpression {
    return factory.createSmlParenthesizedGoalExpression().apply {
        this.expressions += expressions
    }
}

/**
 * Returns a new object of class [SmlParenthesizedType].
 */
fun createSmlParenthesizedType(type: SmlAbstractType): SmlParenthesizedType {
    return factory.createSmlParenthesizedType().apply {
        this.type = type
    }
}

/**
 * Returns a new object of class [SmlParentTypeList].
 */
fun createSmlParentTypeList(parentTypes: List<SmlAbstractType>): SmlParentTypeList {
    return factory.createSmlParentTypeList().apply {
        this.parentTypes += parentTypes
    }
}

/**
 * Returns a new object of class [SmlPlaceholder].
 */
fun createSmlPlaceholder(name: String): SmlPlaceholder {
    return factory.createSmlPlaceholder().apply {
        this.name = name
    }
}

/**
 * Returns a new object of class [SmlPredicate].
 */
fun createSmlPredicate(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    parameters: List<SmlParameter> = emptyList(),
    results: List<SmlResult> = emptyList(),
    goals: List<SmlAbstractGoal> = emptyList(),
): SmlPredicate {
    return factory.createSmlPredicate().apply {
        this.name = name
        this.annotationCallList = createSmlAnnotationCallList(annotationCalls)
        this.parameterList = createSmlParameterList(parameters)
        this.resultList = results.nullIfEmptyElse(::createSmlResultList)
        goals.forEach { addGoal(it) }
    }
}

/**
 * Adds a new object of class [SmlPredicate] to the receiver.
 */
fun SmlCompilationUnit.smlPredicate(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    parameters: List<SmlParameter> = emptyList(),
    results: List<SmlResult> = emptyList(),
    goals: List<SmlAbstractGoal> = emptyList(),
) {
    this.addMember(
        createSmlPredicate(
            name,
            annotationCalls,
            parameters,
            results,
            goals
        )
    )
}

/**
 * Adds a new goal to the receiver.
 */
private fun SmlPredicate.addGoal(goal: SmlAbstractGoal) {
    if (this.goalList == null) {
        this.goalList = factory.createSmlGoalList()
    }

    this.goalList.goals += goal
}

/**
 * Returns a new object of class [SmlPrefixOperation].
 */
fun createSmlPrefixOperation(operator: SmlPrefixOperationOperator, operand: SmlAbstractExpression): SmlPrefixOperation {
    return factory.createSmlPrefixOperation().apply {
        this.operator = operator.operator
        this.operand = operand
    }
}

/**
 * Returns a new object of class [SmlProtocol].
 */
fun createSmlProtocol(
    subterms: List<SmlProtocolSubterm> = emptyList(),
    term: SmlAbstractProtocolTerm? = null,
    init: SmlProtocol.() -> Unit = {}
): SmlProtocol {
    return factory.createSmlProtocol().apply {
        this.body = factory.createSmlProtocolBody()
        subterms.forEach { addSubterm(it) }
        this.body.term = term
        this.init()
    }
}

/**
 * Adds a new object of class [SmlProtocol] to the receiver.
 */
fun SmlClass.smlProtocol(
    subterms: List<SmlProtocolSubterm> = emptyList(),
    term: SmlAbstractProtocolTerm? = null,
    init: SmlProtocol.() -> Unit = {}
) {
    this.addMember(createSmlProtocol(subterms, term, init))
}

/**
 * Adds a new subterm to the receiver.
 */
private fun SmlProtocol.addSubterm(subterm: SmlProtocolSubterm) {
    if (this.body == null) {
        this.body = factory.createSmlProtocolBody()
    }

    if (this.body.subtermList == null) {
        this.body.subtermList = factory.createSmlProtocolSubtermList()
    }

    this.body.subtermList.subterms += subterm
}

/**
 * Returns a new object of class [SmlProtocolAlternative].
 */
fun createSmlProtocolAlternative(terms: List<SmlAbstractProtocolTerm>): SmlProtocolAlternative {
    if (terms.size < 2) {
        throw IllegalArgumentException("Must have at least two terms.")
    }

    return factory.createSmlProtocolAlternative().apply {
        this.terms += terms
    }
}

/**
 * Returns a new object of class [SmlProtocolComplement].
 */
fun createSmlProtocolComplement(
    universe: SmlProtocolTokenClass? = null,
    references: List<SmlProtocolReference> = emptyList()
): SmlProtocolComplement {
    return factory.createSmlProtocolComplement().apply {
        this.universe = universe
        this.referenceList = references.nullIfEmptyElse(::createSmlProtocolReferenceList)
    }
}

/**
 * Returns a new object of class [SmlProtocolParenthesizedTerm].
 */
fun createSmlProtocolParenthesizedTerm(term: SmlAbstractProtocolTerm): SmlProtocolParenthesizedTerm {
    return factory.createSmlProtocolParenthesizedTerm().apply {
        this.term = term
    }
}

/**
 * Returns a new object of class [SmlProtocolQuantifiedTerm].
 */
fun createSmlProtocolQuantifiedTerm(
    term: SmlAbstractProtocolTerm,
    quantifier: SmlProtocolQuantifiedTermQuantifier
): SmlProtocolQuantifiedTerm {
    return factory.createSmlProtocolQuantifiedTerm().apply {
        this.term = term
        this.quantifier = quantifier.quantifier
    }
}

/**
 * Returns a new object of class [SmlProtocolReference].
 */
fun createSmlProtocolReference(token: SmlAbstractProtocolToken): SmlProtocolReference {
    return factory.createSmlProtocolReference().apply {
        this.token = token
    }
}

/**
 * Returns a new object of class [SmlProtocolReferenceList].
 */
fun createSmlProtocolReferenceList(references: List<SmlProtocolReference>): SmlProtocolReferenceList {
    return factory.createSmlProtocolReferenceList().apply {
        this.references += references
    }
}

/**
 * Returns a new object of class [SmlProtocolSequence].
 *
 * @throws IllegalArgumentException If `terms.size < 2`.
 */
fun createSmlProtocolSequence(terms: List<SmlAbstractProtocolTerm>): SmlProtocolSequence {
    if (terms.size < 2) {
        throw IllegalArgumentException("Must have at least two terms.")
    }

    return factory.createSmlProtocolSequence().apply {
        this.terms += terms
    }
}

/**
 * Returns a new object of class [SmlProtocolSubterm].
 */
fun createSmlProtocolSubterm(name: String, term: SmlAbstractProtocolTerm): SmlProtocolSubterm {
    return factory.createSmlProtocolSubterm().apply {
        this.name = name
        this.term = term
    }
}

/**
 * Returns a new object of class [SmlProtocolSubterm].
 */
fun SmlProtocol.smlProtocolSubterm(name: String, term: SmlAbstractProtocolTerm) {
    this.addSubterm(createSmlProtocolSubterm(name, term))
}

/**
 * Returns a new object of class [SmlProtocolTokenClass].
 */
fun createSmlProtocolTokenClass(value: SmlProtocolTokenClassValue): SmlProtocolTokenClass {
    return factory.createSmlProtocolTokenClass().apply {
        this.value = value.value
    }
}

/**
 * Returns a new object of class [SmlReference].
 */
fun createSmlReference(declaration: SmlAbstractDeclaration): SmlReference {
    return factory.createSmlReference().apply {
        this.declaration = declaration
    }
}

/**
 * Returns a new object of class [SmlResult].
 */
fun createSmlResult(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    type: SmlAbstractType? = null
): SmlResult {
    return factory.createSmlResult().apply {
        this.name = name
        this.annotationCalls += annotationCalls
        this.type = type
    }
}

/**
 * Returns a new object of class [SmlResultList].
 */
fun createSmlResultList(results: List<SmlResult>): SmlResultList {
    return factory.createSmlResultList().apply {
        this.results += results
    }
}

/**
 * Returns a new object of class [SmlStarProjection].
 */
fun createSmlStarProjection(): SmlStarProjection {
    return factory.createSmlStarProjection()
}

/**
 * Returns a new object of class [SmlStep].
 */
fun createSmlStep(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    visibility: SmlVisibility = SmlVisibility.Public,
    parameters: List<SmlParameter> = emptyList(),
    results: List<SmlResult> = emptyList(),
    statements: List<SmlAbstractStatement> = emptyList(),
    init: SmlStep.() -> Unit = {}
): SmlStep {
    return factory.createSmlStep().apply {
        this.name = name
        this.annotationCallList = createSmlAnnotationCallList(annotationCalls)
        this.visibility = visibility.visibility
        this.parameterList = createSmlParameterList(parameters)
        this.resultList = results.nullIfEmptyElse(::createSmlResultList)
        this.body = factory.createSmlBlock()
        statements.forEach { addStatement(it) }
        this.init()
    }
}

/**
 * Adds a new object of class [SmlStep] to the receiver.
 */
fun SmlCompilationUnit.smlStep(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    visibility: SmlVisibility = SmlVisibility.Public,
    parameters: List<SmlParameter> = emptyList(),
    results: List<SmlResult> = emptyList(),
    statements: List<SmlAbstractStatement> = emptyList(),
    init: SmlStep.() -> Unit = {}
) {
    this.addMember(
        createSmlStep(
            name,
            annotationCalls,
            visibility,
            parameters,
            results,
            statements,
            init
        )
    )
}

/**
 * Adds a new statement to the receiver.
 */
private fun SmlStep.addStatement(statement: SmlAbstractStatement) {
    if (this.body == null) {
        this.body = factory.createSmlBlock()
    }

    this.body.statements += statement
}

/**
 * Returns a new object of class [SmlString].
 */
fun createSmlString(value: String): SmlString {
    return factory.createSmlString().apply {
        this.value = value
    }
}

/**
 * Returns a new object of class [SmlTemplateString]. String parts should not include delimiters (`"`, `{{`, `}}`).
 * Template expressions are inserted between the string parts.
 *
 * @throws IllegalArgumentException If `stringParts.size < 2`.
 * @throws IllegalArgumentException If `templateExpressions` is empty.
 * @throws IllegalArgumentException If `stringsParts.size` != `templateExpressions.size + 1`.
 */
fun createSmlTemplateString(
    stringParts: List<String>,
    templateExpressions: List<SmlAbstractExpression>
): SmlTemplateString {

    // One of the first two checks is sufficient but this allows better error messages.
    if (stringParts.size < 2) {
        throw IllegalArgumentException("Must have at least two string parts.")
    } else if (templateExpressions.isEmpty()) {
        throw IllegalArgumentException("Must have at least one template expression.")
    } else if (stringParts.size != templateExpressions.size + 1) {
        throw IllegalArgumentException("Must have exactly one more string part than there are template expressions.")
    }

    return factory.createSmlTemplateString().apply {
        stringParts.forEachIndexed { index, value ->

            // Next template string part
            this.expressions += when (index) {
                0 -> {
                    factory.createSmlTemplateStringStart().apply {
                        this.value = value
                    }
                }
                stringParts.size - 1 -> {
                    factory.createSmlTemplateStringEnd().apply {
                        this.value = value
                    }
                }
                else -> {
                    factory.createSmlTemplateStringInner().apply {
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
 * Returns a new object of class [SmlTypeArgument].
 */
fun createSmlTypeArgument(
    value: SmlAbstractTypeArgumentValue,
    typeParameter: SmlTypeParameter? = null
): SmlTypeArgument {
    return factory.createSmlTypeArgument().apply {
        this.value = value
        this.typeParameter = typeParameter
    }
}

/**
 * Returns a new object of class [SmlTypeArgument] that points to a type parameter with the given name.
 */
fun createSmlTypeArgument(
    value: SmlAbstractTypeArgumentValue,
    typeParameterName: String
): SmlTypeArgument {
    return createSmlTypeArgument(
        value,
        createSmlTypeParameter(typeParameterName)
    )
}

/**
 * Returns a new object of class [SmlTypeArgumentList].
 */
fun createSmlTypeArgumentList(typeArguments: List<SmlTypeArgument>): SmlTypeArgumentList {
    return factory.createSmlTypeArgumentList().apply {
        this.typeArguments += typeArguments
    }
}

/**
 * Returns a new object of class [SmlTypeParameter].
 */
fun createSmlTypeParameter(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    variance: SmlVariance = SmlVariance.Invariant,
    kind: SmlKind = SmlKind.NoKind
): SmlTypeParameter {
    return factory.createSmlTypeParameter().apply {
        this.name = name
        this.annotationCalls += annotationCalls
        this.variance = variance.variance
        this.kind = kind.kind
    }
}

/**
 * Returns a new object of class [SmlTypeParameterList].
 */
fun createSmlTypeParameterList(typeParameters: List<SmlTypeParameter>): SmlTypeParameterList {
    return factory.createSmlTypeParameterList().apply {
        this.typeParameters += typeParameters
    }
}

/**
 * Returns a new object of class [SmlTypeParameterConstraintGoal].
 */
fun createSmlTypeParameterConstraintGoal(
    leftOperand: SmlTypeParameter,
    operator: SmlTypeParameterConstraintOperator,
    rightOperand: SmlAbstractType
): SmlTypeParameterConstraintGoal {
    return factory.createSmlTypeParameterConstraintGoal().apply {
        this.leftOperand = leftOperand
        this.operator = operator.operator
        this.rightOperand = rightOperand
    }
}

/**
 * Returns a new object of class [SmlTypeParameterConstraintGoal] that points to a type parameter with the given name.
 */
fun createSmlTypeParameterConstraintGoal(
    leftOperandName: String,
    operator: SmlTypeParameterConstraintOperator,
    rightOperand: SmlAbstractType
): SmlTypeParameterConstraintGoal {
    return createSmlTypeParameterConstraintGoal(
        createSmlTypeParameter(leftOperandName),
        operator,
        rightOperand
    )
}

/**
 * Returns a new object of class [SmlTypeProjection].
 */
fun createSmlTypeProjection(type: SmlAbstractType, variance: SmlVariance = SmlVariance.Invariant): SmlTypeProjection {
    return factory.createSmlTypeProjection().apply {
        this.type = type
        this.variance = variance.variance
    }
}

/**
 * Returns a new object of class [SmlUnionType].
 *
 * @throws IllegalArgumentException If no type arguments are passed.
 */
fun createSmlUnionType(typeArguments: List<SmlTypeArgument>): SmlUnionType {
    if (typeArguments.isEmpty()) {
        throw IllegalArgumentException("Must have at least one type argument.")
    }

    return factory.createSmlUnionType().apply {
        this.typeArgumentList = createSmlTypeArgumentList(typeArguments)
    }
}

/**
 * Returns a new object of class [SmlWildcard].
 */
fun createSmlWildcard(): SmlWildcard {
    return factory.createSmlWildcard()
}

/**
 * Returns a new object of class [SmlWorkflow].
 */
fun createSmlWorkflow(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    statements: List<SmlAbstractStatement> = emptyList(),
    init: SmlWorkflow.() -> Unit = {}
): SmlWorkflow {
    return factory.createSmlWorkflow().apply {
        this.name = name
        this.annotationCallList = createSmlAnnotationCallList(annotationCalls)
        this.body = factory.createSmlBlock()
        statements.forEach { addStatement(it) }
        this.init()
    }
}

/**
 * Adds a new object of class [SmlWorkflow] to the receiver.
 */
fun SmlCompilationUnit.smlWorkflow(
    name: String,
    annotationCalls: List<SmlAnnotationCall> = emptyList(),
    statements: List<SmlAbstractStatement> = emptyList(),
    init: SmlWorkflow.() -> Unit = {}
) {
    this.addMember(createSmlWorkflow(name, annotationCalls, statements, init))
}

/**
 * Adds a new statement to the receiver.
 */
private fun SmlWorkflow.addStatement(statement: SmlAbstractStatement) {
    if (this.body == null) {
        this.body = factory.createSmlBlock()
    }

    this.body.statements += statement
}

/**
 * Returns a new object of class [SmlYield].
 */
fun createSmlYield(result: SmlResult): SmlYield {
    return factory.createSmlYield().apply {
        this.result = result
    }
}

/**
 * Returns a new object of class [SmlYield] that points to a result with the given name.
 */
fun createSmlYield(resultName: String): SmlYield {
    return createSmlYield(createSmlResult(resultName))
}
