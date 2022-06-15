package com.larsreimann.safeds.emf

import com.larsreimann.safeds.constant.SdsFileExtension
import com.larsreimann.safeds.constant.SdsPrefixOperationOperator
import com.larsreimann.safeds.constant.SdsProtocolTokenClassValue
import com.larsreimann.safeds.constant.SdsTypeParameterConstraintOperator
import com.larsreimann.safeds.serializer.SerializationResult
import com.larsreimann.safeds.serializer.serializeToFormattedString
import com.larsreimann.safeds.safeDS.SdsFloat
import com.larsreimann.safeds.safeDS.SdsInt
import com.larsreimann.safeds.safeDS.SdsLambdaParameterList
import com.larsreimann.safeds.safeDS.SdsParameterList
import com.larsreimann.safeds.safeDS.SdsPrefixOperation
import com.larsreimann.safeds.safeDS.SdsProtocol
import com.larsreimann.safeds.safeDS.SdsTemplateStringEnd
import com.larsreimann.safeds.safeDS.SdsTemplateStringInner
import com.larsreimann.safeds.safeDS.SdsTemplateStringStart
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
import com.larsreimann.safeds.testing.assertions.shouldBeCloseTo
import io.kotest.assertions.asClue
import io.kotest.assertions.throwables.shouldNotThrow
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

/**
 * Includes tests for the (extension) functions in Creators.kt. Since most of the functions are straightforward, not
 * everything is being tested. These are the guidelines for what should be tested:
 *
 * - Handling of annotations (features annotationCallList vs. annotations)
 * - Extension functions should add created object to receiver
 * - Creators for objects with cross-references that take a name instead of the referenced object
 * - Should not create unnecessary syntax (like empty class bodies)
 *
 * There are also some special tests:
 * - Dummy resource should be serializable
 * - Assignments requires at least one assignee
 * - Template string creator should check structure of template string
 * - Union type requires at least one type argument
 */
@ExtendWith(InjectionExtension::class)
@InjectWith(SafeDSInjectorProvider::class)
class CreatorsTest {

    @Test
    fun `createSdsDummyResource should create serializable dummy resource`() {
        val result = createSdsDummyResource(fileName = "test", SdsFileExtension.Test, packageName = "test")

        result.contents.shouldHaveSize(1)
        result.contents[0].serializeToFormattedString().shouldBeInstanceOf<SerializationResult.Success>()
    }

    @Test
    fun `createSdsAnnotation should store annotation uses in annotationCallList`() {
        val annotation = createSdsAnnotation(
            "Test",
            listOf(createSdsAnnotationCall("Test"))
        )

        annotation.annotationCalls.shouldHaveSize(0)

        val annotationCallList = annotation.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `createSdsAnnotation should omit empty parameter lists`() {
        val annotation = createSdsAnnotation(
            "Test",
            parameters = emptyList()
        )

        annotation.parameterList.shouldBeNull()
    }

    @Test
    fun `sdsAnnotation should add the created annotation to the receiving compilation unit`() {
        val compilationUnit = createSdsCompilationUnit(packageName = "test") {
            sdsAnnotation("Test")
        }

        compilationUnit.members.shouldHaveSize(1)
    }

    @Test
    fun `createSdsAnnotationUse should omit empty argument lists`() {
        val annotationUse = createSdsAnnotationCall(
            "Test",
            arguments = emptyList()
        )
        annotationUse.argumentList.shouldBeNull()
    }

    @Test
    fun `createSdsAnnotationUse should create an SdsAnnotation when only a name is passed`() {
        val annotationUse = createSdsAnnotationCall("Test")
        val annotation = annotationUse.annotation
        annotation.shouldNotBeNull()
        annotation.name shouldBe "Test"
    }

    @Test
    fun `createSdsArgument should create an SdsParameter when only a name is passed`() {
        val argument = createSdsArgument(createSdsInt(1), "Test")
        val parameter = argument.parameter
        parameter.shouldNotBeNull()
        parameter.name shouldBe "Test"
    }

    @Test
    fun `sdsAssignment should throw if no type arguments are passed`() {
        shouldThrow<IllegalArgumentException> {
            createSdsAssignment(listOf(), createSdsInt(1))
        }
    }

    @Test
    fun `sdsAssignment should add the created assignment to the receiving lambda`() {
        val lambda = createSdsBlockLambda {
            sdsAssignment(
                listOf(createSdsWildcard()),
                createSdsInt(1)
            )
        }

        val body = lambda.body
        body.shouldNotBeNull()
        body.statements.shouldHaveSize(1)
    }

    @Test
    fun `sdsAssignment should add the created assignment to the receiving workflow`() {
        val workflow = createSdsWorkflow("Test") {
            sdsAssignment(
                listOf(createSdsWildcard()),
                createSdsInt(1)
            )
        }

        val body = workflow.body
        body.shouldNotBeNull()
        body.statements.shouldHaveSize(1)
    }

    @Test
    fun `sdsAssignment should add the created assignment to the receiving step`() {
        val step = createSdsStep("Test") {
            sdsAssignment(
                listOf(createSdsWildcard()),
                createSdsInt(1)
            )
        }

        val body = step.body
        body.shouldNotBeNull()
        body.statements.shouldHaveSize(1)
    }

    @Test
    fun `createSdsAttribute should store annotation uses in annotationCallList`() {
        val attribute = createSdsAttribute(
            "Test",
            listOf(createSdsAnnotationCall("Test"))
        )

        attribute.annotationCalls.shouldHaveSize(0)

        val annotationCallList = attribute.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `sdsAttribute should add the created attribute to the receiver`() {
        val `class` = createSdsClass("Test") {
            sdsAttribute("Test")
        }

        val body = `class`.body
        body.shouldNotBeNull()
        body.members.shouldHaveSize(1)
    }

    @Test
    fun `createSdsBlockLambda should not omit empty parameter lists`() {
        val lambda = createSdsBlockLambda(parameters = emptyList())
        lambda.parameterList.shouldBeInstanceOf<SdsParameterList>()
    }

    @Test
    fun `createSdsBlockLambda should use a lambda parameter list for parameters`() {
        val lambda = createSdsBlockLambda()
        lambda.parameterList.shouldBeInstanceOf<SdsLambdaParameterList>()
    }

    @Test
    fun `createSdsBlockLambda should create a serializable block lambda`() {
        val lambda = createSdsBlockLambda()

        createSdsDummyResource(fileName = "test", SdsFileExtension.Test, packageName = "test") {
            sdsWorkflow(name = "test") {
                sdsExpressionStatement(lambda)
            }
        }

        lambda.serializeToFormattedString().shouldBeInstanceOf<SerializationResult.Success>()
    }

    @Test
    fun `createSdsCall should omit empty type argument lists`() {
        val call = createSdsCall(
            createSdsNull(),
            typeArguments = emptyList()
        )
        call.typeArgumentList.shouldBeNull()
    }

    @Test
    fun `createSdsClass should store annotation uses in annotationCallList`() {
        val `class` = createSdsClass(
            "Test",
            listOf(createSdsAnnotationCall("Test"))
        )

        `class`.annotationCalls.shouldHaveSize(0)

        val annotationCallList = `class`.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `createSdsClass should omit empty body`() {
        val `class` = createSdsClass(
            "Test",
            members = emptyList()
        )
        `class`.body.shouldBeNull()
    }

    @Test
    fun `createSdsClass should not omit empty parameter lists`() {
        val `class` = createSdsClass(
            "Test",
            parameters = emptyList()
        )
        `class`.parameterList.shouldBeInstanceOf<SdsParameterList>()
    }

    @Test
    fun `createSdsClass should omit empty parent type list`() {
        val `class` = createSdsClass(
            "Test",
            parentTypes = emptyList()
        )
        `class`.parentTypeList.shouldBeNull()
    }

    @Test
    fun `createSdsClass should omit empty type parameter list`() {
        val `class` = createSdsClass(
            "Test",
            typeParameters = emptyList()
        )
        `class`.typeParameterList.shouldBeNull()
    }

//    constraints are now a member, doesn't make sense
//
//    @Test
//    fun `createSdsClass should omit empty constraint list`() {
//        val `class` = createSdsClass(
//            "Test",
//            constraints = emptyList()
//        )
//        `class`.constraintList.shouldBeNull()
//    }

    @Test
    fun `sdsClass should add the created class to the receiving class`() {
        val `class` = createSdsClass("Test") {
            sdsClass("Test")
        }

        val body = `class`.body
        body.shouldNotBeNull()
        body.members.shouldHaveSize(1)
    }

    @Test
    fun `sdsClass should add the created class to the receiving compilation unit`() {
        val compilationUnit = createSdsCompilationUnit(packageName = "test") {
            sdsClass("Test")
        }

        compilationUnit.members.shouldHaveSize(1)
    }

    @Test
    fun `createSdsCompilationUnit should store annotation uses in annotationCalls`() {
        val compilationUnit = createSdsCompilationUnit(
            packageName = "test",
            listOf(createSdsAnnotationCall("Test"))
        )

        compilationUnit.annotationCalls.shouldHaveSize(1)
        compilationUnit.annotationCallList.shouldBeNull()
    }

    @Test
    fun `createSdsEnum should store annotation uses in annotationCallList`() {
        val `enum` = createSdsEnum(
            "Test",
            listOf(createSdsAnnotationCall("Test"))
        )

        `enum`.annotationCalls.shouldHaveSize(0)

        val annotationCallList = `enum`.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `createSdsEnum should omit empty body`() {
        val enum = createSdsEnum(
            "Test",
            variants = emptyList()
        )
        enum.body.shouldBeNull()
    }

    @Test
    fun `sdsEnum should add the created enum to the receiving class`() {
        val `class` = createSdsClass("Test") {
            sdsEnum("Test")
        }

        val body = `class`.body
        body.shouldNotBeNull()
        body.members.shouldHaveSize(1)
    }

    @Test
    fun `sdsEnum should add the created enum to the receiving compilation unit`() {
        val compilationUnit = createSdsCompilationUnit(packageName = "test") {
            sdsEnum("Test")
        }

        compilationUnit.members.shouldHaveSize(1)
    }

    @Test
    fun `createSdsEnumVariant should store annotation uses in annotations`() {
        val variant = createSdsEnumVariant(
            "Test",
            listOf(createSdsAnnotationCall("Test"))
        )

        variant.annotationCalls.shouldHaveSize(1)
        variant.annotationCallList.shouldBeNull()
    }

    @Test
    fun `createSdsEnumVariant should omit empty type parameter list`() {
        val enum = createSdsEnumVariant(
            "Test",
            typeParameters = emptyList()
        )
        enum.typeParameterList.shouldBeNull()
    }

    @Test
    fun `createSdsEnumVariant should omit empty parameter list`() {
        val enum = createSdsEnumVariant(
            "Test",
            parameters = emptyList()
        )
        enum.parameterList.shouldBeNull()
    }

    @Test
    fun `createSdsEnumVariant should omit empty constraint list`() {
        val enum = createSdsEnumVariant(
            "Test"
        )
        enum.constraint.shouldBeNull()
    }

    @Test
    fun `sdsEnumVariant should add the created variant to the receiver`() {
        val enum = createSdsEnum("Test") {
            sdsEnumVariant("Test")
        }

        val body = enum.body
        body.shouldNotBeNull()
        body.variants.shouldHaveSize(1)
    }

    @Test
    fun `createSdsExpressionLambda should use a lambda parameter list for parameters`() {
        val lambda = createSdsExpressionLambda(result = createSdsNull())
        lambda.parameterList.shouldBeInstanceOf<SdsLambdaParameterList>()
    }

    @Test
    fun `createSdsExpressionLambda should create a serializable expression lambda`() {
        val lambda = createSdsExpressionLambda(result = createSdsNull())

        createSdsDummyResource(fileName = "test", SdsFileExtension.Test, packageName = "test") {
            sdsWorkflow(name = "test") {
                sdsExpressionStatement(lambda)
            }
        }

        lambda.serializeToFormattedString().shouldBeInstanceOf<SerializationResult.Success>()
    }

    @Test
    fun `sdsExpressionStatement should add the created expression statement to the receiving lambda`() {
        val lambda = createSdsBlockLambda {
            sdsExpressionStatement(createSdsInt(1))
        }

        val body = lambda.body
        body.shouldNotBeNull()
        body.statements.shouldHaveSize(1)
    }

    @Test
    fun `sdsExpressionStatement should add the created expression statement to the receiving workflow`() {
        val workflow = createSdsWorkflow("Test") {
            sdsExpressionStatement(createSdsInt(1))
        }

        val body = workflow.body
        body.shouldNotBeNull()
        body.statements.shouldHaveSize(1)
    }

    @Test
    fun `sdsExpressionStatement should add the created expression statement to the receiving step`() {
        val step = createSdsStep("Test") {
            sdsExpressionStatement(createSdsInt(1))
        }

        val body = step.body
        body.shouldNotBeNull()
        body.statements.shouldHaveSize(1)
    }

    @Test
    fun `createSdsFloat should wrap negative numbers in a prefix operation (-)`() {
        val float = createSdsFloat(-1.0)

        float.shouldBeInstanceOf<SdsPrefixOperation>()
        float.operator shouldBe SdsPrefixOperationOperator.Minus.operator

        val operand = float.operand
        operand.shouldBeInstanceOf<SdsFloat>()
        operand.value shouldBeCloseTo 1.0
    }

    @Test
    fun `createSdsFunction should store annotation uses in annotationCallList`() {
        val function = createSdsFunction(
            "test",
            listOf(createSdsAnnotationCall("Test"))
        )

        function.annotationCalls.shouldHaveSize(0)

        val annotationCallList = function.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `createSdsFunction should omit empty result list`() {
        val function = createSdsFunction(
            "test",
            results = emptyList()
        )
        function.resultList.shouldBeNull()
    }

    @Test
    fun `createSdsFunction should omit empty type parameter list`() {
        val function = createSdsFunction(
            "test",
            typeParameters = emptyList()
        )
        function.typeParameterList.shouldBeNull()
    }

//    constraints are now a "member" statement, doesn't make sense
//
//    @Test
//    fun `createSdsFunction should omit empty constraint list`() {
//        val function = createSdsFunction(
//            "test",
//            constraints = emptyList()
//        )
//        function.constraintList.shouldBeNull()
//    }

    @Test
    fun `sdsFunction should add the created function to the receiving class`() {
        val `class` = createSdsClass("Test") {
            sdsFunction("test")
        }

        val body = `class`.body
        body.shouldNotBeNull()
        body.members.shouldHaveSize(1)
    }

    @Test
    fun `sdsFunction should add the created function to the receiving compilation unit`() {
        val compilationUnit = createSdsCompilationUnit(packageName = "test") {
            sdsFunction("test")
        }

        compilationUnit.members.shouldHaveSize(1)
    }

    @Test
    fun `createSdsInt should wrap negative numbers in a prefix operation (-)`() {
        val int = createSdsInt(-1)

        int.shouldBeInstanceOf<SdsPrefixOperation>()
        int.operator shouldBe SdsPrefixOperationOperator.Minus.operator

        val operand = int.operand
        operand.shouldBeInstanceOf<SdsInt>()
        operand.value shouldBe 1
    }

    @Test
    fun `createSdsNamedType should omit empty type argument lists`() {
        val namedType = createSdsNamedType(
            createSdsClass("Int"),
            typeArguments = emptyList()
        )
        namedType.typeArgumentList.shouldBeNull()
    }

    @Test
    fun `createSdsParameter should store annotation uses in annotations`() {
        val parameter = createSdsParameter(
            "test",
            listOf(createSdsAnnotationCall("Test"))
        )

        parameter.annotationCalls.shouldHaveSize(1)
        parameter.annotationCallList.shouldBeNull()
    }

    @Test
    fun `createSdsProtocol should omit empty subterm list`() {
        val protocol = createSdsProtocol(emptyList())
        protocol.body.shouldNotBeNull()
        protocol.body.subtermList.shouldBeNull()
    }

    @Test
    fun `sdsProtocol should add the created protocol to the receiving class`() {
        val `class` = createSdsClass("Test") {
            sdsProtocol()
        }

        `class`.body.shouldNotBeNull()
        `class`.body.members.filterIsInstance<SdsProtocol>().shouldHaveSize(1)
    }

    @Test
    fun `createSdsProtocolAlternative should throw if fewer than two terms are passed`() {
        shouldThrow<IllegalArgumentException> {
            createSdsProtocolAlternative(listOf())
        }

        shouldThrow<IllegalArgumentException> {
            createSdsProtocolAlternative(
                listOf(
                    createSdsProtocolTokenClass(SdsProtocolTokenClassValue.Anything)
                )
            )
        }

        shouldNotThrow<IllegalArgumentException> {
            createSdsProtocolAlternative(
                listOf(
                    createSdsProtocolTokenClass(SdsProtocolTokenClassValue.Anything),
                    createSdsProtocolTokenClass(SdsProtocolTokenClassValue.Anything),
                )
            )
        }
    }

    @Test
    fun `createSdsProtocolComplement should omit empty reference list`() {
        val complement = createSdsProtocolComplement()
        complement.referenceList.shouldBeNull()
    }

    @Test
    fun `createSdsProtocolSequence should throw if fewer than two terms are passed`() {
        shouldThrow<IllegalArgumentException> {
            createSdsProtocolSequence(listOf())
        }

        shouldThrow<IllegalArgumentException> {
            createSdsProtocolSequence(
                listOf(
                    createSdsProtocolTokenClass(SdsProtocolTokenClassValue.Anything)
                )
            )
        }

        shouldNotThrow<IllegalArgumentException> {
            createSdsProtocolSequence(
                listOf(
                    createSdsProtocolTokenClass(SdsProtocolTokenClassValue.Anything),
                    createSdsProtocolTokenClass(SdsProtocolTokenClassValue.Anything),
                )
            )
        }
    }

    @Test
    fun `sdsProtocolSubterm should add the created subterm to the receiving protocol`() {
        val protocol = createSdsProtocol {
            sdsProtocolSubterm("test", createSdsProtocolTokenClass(SdsProtocolTokenClassValue.Anything))
        }

        protocol.body.shouldNotBeNull()
        protocol.body.subtermList.shouldNotBeNull()
        protocol.body.subtermList.subterms.shouldHaveSize(1)
    }

    @Test
    fun `createSdsResult should store annotation uses in annotations`() {
        val result = createSdsResult(
            "Test",
            listOf(createSdsAnnotationCall("Test"))
        )

        result.annotationCalls.shouldHaveSize(1)
        result.annotationCallList.shouldBeNull()
    }

    @Test
    fun `createSdsTemplate should throw if there are fewer than 2 string parts`() {
        shouldThrow<IllegalArgumentException> {
            createSdsTemplateString(
                listOf("Test"),
                listOf(createSdsInt(1))
            )
        }
    }

    @Test
    fun `createSdsTemplate should throw if there is no template expression`() {
        shouldThrow<IllegalArgumentException> {
            createSdsTemplateString(
                listOf("Test", "Test"),
                listOf()
            )
        }
    }

    @Test
    fun `createSdsTemplate should throw if numbers of string parts and template expressions don't match`() {
        shouldThrow<IllegalArgumentException> {
            createSdsTemplateString(
                listOf("Test", "Test", "Test"),
                listOf(createSdsInt(1))
            )
        }
    }

    @Test
    fun `createSdsTemplate should interleave string parts and template expressions`() {
        val templateString = createSdsTemplateString(
            listOf("Start", "Inner", "Inner", "End"),
            listOf(createSdsInt(1), createSdsInt(1), createSdsInt(1))
        )

        templateString.expressions.asClue {
            it.shouldHaveSize(7)
            it[0].shouldBeInstanceOf<SdsTemplateStringStart>()
            it[1].shouldBeInstanceOf<SdsInt>()
            it[2].shouldBeInstanceOf<SdsTemplateStringInner>()
            it[3].shouldBeInstanceOf<SdsInt>()
            it[4].shouldBeInstanceOf<SdsTemplateStringInner>()
            it[5].shouldBeInstanceOf<SdsInt>()
            it[6].shouldBeInstanceOf<SdsTemplateStringEnd>()
        }
    }

    @Test
    fun `createSdsTypeArgument should create an SdsTypeParameter when only a name is passed`() {
        val typeArgument = createSdsTypeArgument(
            createSdsStarProjection(),
            "Test"
        )
        val typeParameter = typeArgument.typeParameter
        typeParameter.shouldNotBeNull()
        typeParameter.name shouldBe "Test"
    }

    @Test
    fun `createSdsTypeParameter should store annotation uses in annotations`() {
        val result = createSdsTypeParameter(
            "Test",
            listOf(createSdsAnnotationCall("Test"))
        )

        result.annotationCalls.shouldHaveSize(1)
        result.annotationCallList.shouldBeNull()
    }

    @Test
    fun `createTypeParameterConstraintGoal should create an SdsTypeParameter when only a name is passed`() {
        val constraint = createSdsTypeParameterConstraintGoal(
            "Test",
            SdsTypeParameterConstraintOperator.SubclassOf,
            createSdsNamedType(createSdsClass("Test"))
        )
        val leftOperand = constraint.leftOperand
        leftOperand.shouldNotBeNull()
        leftOperand.name shouldBe "Test"
    }

    @Test
    fun `createSdsUnionType should throw if no type arguments are passed`() {
        shouldThrow<IllegalArgumentException> {
            createSdsUnionType(listOf())
        }

        shouldNotThrow<IllegalArgumentException> {
            createSdsUnionType(
                listOf(
                    createSdsTypeArgument(
                        createSdsStarProjection()
                    )
                )
            )
        }
    }

    @Test
    fun `createSdsYield should create an SdsResult when only a name is passed`() {
        val yield = createSdsYield("test")
        val result = `yield`.result
        result.shouldNotBeNull()
        result.name shouldBe "test"
    }

    @Test
    fun `createSdsStep should store annotation uses in annotationCallList`() {
        val step = createSdsStep(
            "test",
            listOf(createSdsAnnotationCall("Test"))
        )

        step.annotationCalls.shouldHaveSize(0)

        val annotationCallList = step.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `createSdsStep should omit empty result list`() {
        val function = createSdsStep(
            "test",
            results = emptyList()
        )
        function.resultList.shouldBeNull()
    }

    @Test
    fun `sdsStep should add the created step to the receiving compilation unit`() {
        val compilationUnit = createSdsCompilationUnit(packageName = "test") {
            sdsStep("test")
        }

        compilationUnit.members.shouldHaveSize(1)
    }

    @Test
    fun `createSdsWorkflow should store annotation uses in annotationCallList`() {
        val workflow = createSdsWorkflow(
            "test",
            listOf(createSdsAnnotationCall("Test"))
        )

        workflow.annotationCalls.shouldHaveSize(0)

        val annotationCallList = workflow.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `sdsWorkflow should add the created workflow to the receiving compilation unit`() {
        val compilationUnit = createSdsCompilationUnit(packageName = "test") {
            sdsWorkflow("test")
        }

        compilationUnit.members.shouldHaveSize(1)
    }
}
