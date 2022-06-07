package de.unibonn.simpleml.emf

import de.unibonn.simpleml.constant.SmlFileExtension
import de.unibonn.simpleml.constant.SmlPrefixOperationOperator
import de.unibonn.simpleml.constant.SmlProtocolTokenClassValue
import de.unibonn.simpleml.constant.SmlTypeParameterConstraintOperator
import de.unibonn.simpleml.serializer.SerializationResult
import de.unibonn.simpleml.serializer.serializeToFormattedString
import de.unibonn.simpleml.simpleML.SmlFloat
import de.unibonn.simpleml.simpleML.SmlInt
import de.unibonn.simpleml.simpleML.SmlLambdaParameterList
import de.unibonn.simpleml.simpleML.SmlParameterList
import de.unibonn.simpleml.simpleML.SmlPrefixOperation
import de.unibonn.simpleml.simpleML.SmlProtocol
import de.unibonn.simpleml.simpleML.SmlTemplateStringEnd
import de.unibonn.simpleml.simpleML.SmlTemplateStringInner
import de.unibonn.simpleml.simpleML.SmlTemplateStringStart
import de.unibonn.simpleml.testing.SimpleMLInjectorProvider
import de.unibonn.simpleml.testing.assertions.shouldBeCloseTo
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
@InjectWith(SimpleMLInjectorProvider::class)
class CreatorsTest {

    @Test
    fun `createSmlDummyResource should create serializable dummy resource`() {
        val result = createSmlDummyResource(fileName = "test", SmlFileExtension.Test, packageName = "test")

        result.contents.shouldHaveSize(1)
        result.contents[0].serializeToFormattedString().shouldBeInstanceOf<SerializationResult.Success>()
    }

    @Test
    fun `createSmlAnnotation should store annotation uses in annotationCallList`() {
        val annotation = createSmlAnnotation(
            "Test",
            listOf(createSmlAnnotationCall("Test"))
        )

        annotation.annotationCalls.shouldHaveSize(0)

        val annotationCallList = annotation.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `createSmlAnnotation should omit empty parameter lists`() {
        val annotation = createSmlAnnotation(
            "Test",
            parameters = emptyList()
        )

        annotation.parameterList.shouldBeNull()
    }

    @Test
    fun `smlAnnotation should add the created annotation to the receiving compilation unit`() {
        val compilationUnit = createSmlCompilationUnit(packageName = "test") {
            smlAnnotation("Test")
        }

        compilationUnit.members.shouldHaveSize(1)
    }

    @Test
    fun `createSmlAnnotationUse should omit empty argument lists`() {
        val annotationUse = createSmlAnnotationCall(
            "Test",
            arguments = emptyList()
        )
        annotationUse.argumentList.shouldBeNull()
    }

    @Test
    fun `createSmlAnnotationUse should create an SmlAnnotation when only a name is passed`() {
        val annotationUse = createSmlAnnotationCall("Test")
        val annotation = annotationUse.annotation
        annotation.shouldNotBeNull()
        annotation.name shouldBe "Test"
    }

    @Test
    fun `createSmlArgument should create an SmlParameter when only a name is passed`() {
        val argument = createSmlArgument(createSmlInt(1), "Test")
        val parameter = argument.parameter
        parameter.shouldNotBeNull()
        parameter.name shouldBe "Test"
    }

    @Test
    fun `smlAssignment should throw if no type arguments are passed`() {
        shouldThrow<IllegalArgumentException> {
            createSmlAssignment(listOf(), createSmlInt(1))
        }
    }

    @Test
    fun `smlAssignment should add the created assignment to the receiving lambda`() {
        val lambda = createSmlBlockLambda {
            smlAssignment(
                listOf(createSmlWildcard()),
                createSmlInt(1)
            )
        }

        val body = lambda.body
        body.shouldNotBeNull()
        body.statements.shouldHaveSize(1)
    }

    @Test
    fun `smlAssignment should add the created assignment to the receiving workflow`() {
        val workflow = createSmlWorkflow("Test") {
            smlAssignment(
                listOf(createSmlWildcard()),
                createSmlInt(1)
            )
        }

        val body = workflow.body
        body.shouldNotBeNull()
        body.statements.shouldHaveSize(1)
    }

    @Test
    fun `smlAssignment should add the created assignment to the receiving step`() {
        val step = createSmlStep("Test") {
            smlAssignment(
                listOf(createSmlWildcard()),
                createSmlInt(1)
            )
        }

        val body = step.body
        body.shouldNotBeNull()
        body.statements.shouldHaveSize(1)
    }

    @Test
    fun `createSmlAttribute should store annotation uses in annotationCallList`() {
        val attribute = createSmlAttribute(
            "Test",
            listOf(createSmlAnnotationCall("Test"))
        )

        attribute.annotationCalls.shouldHaveSize(0)

        val annotationCallList = attribute.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `smlAttribute should add the created attribute to the receiver`() {
        val `class` = createSmlClass("Test") {
            smlAttribute("Test")
        }

        val body = `class`.body
        body.shouldNotBeNull()
        body.members.shouldHaveSize(1)
    }

    @Test
    fun `createSmlBlockLambda should not omit empty parameter lists`() {
        val lambda = createSmlBlockLambda(parameters = emptyList())
        lambda.parameterList.shouldBeInstanceOf<SmlParameterList>()
    }

    @Test
    fun `createSmlBlockLambda should use a lambda parameter list for parameters`() {
        val lambda = createSmlBlockLambda()
        lambda.parameterList.shouldBeInstanceOf<SmlLambdaParameterList>()
    }

    @Test
    fun `createSmlBlockLambda should create a serializable block lambda`() {
        val lambda = createSmlBlockLambda()

        createSmlDummyResource(fileName = "test", SmlFileExtension.Test, packageName = "test") {
            smlWorkflow(name = "test") {
                smlExpressionStatement(lambda)
            }
        }

        lambda.serializeToFormattedString().shouldBeInstanceOf<SerializationResult.Success>()
    }

    @Test
    fun `createSmlCall should omit empty type argument lists`() {
        val call = createSmlCall(
            createSmlNull(),
            typeArguments = emptyList()
        )
        call.typeArgumentList.shouldBeNull()
    }

    @Test
    fun `createSmlClass should store annotation uses in annotationCallList`() {
        val `class` = createSmlClass(
            "Test",
            listOf(createSmlAnnotationCall("Test"))
        )

        `class`.annotationCalls.shouldHaveSize(0)

        val annotationCallList = `class`.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `createSmlClass should omit empty body`() {
        val `class` = createSmlClass(
            "Test",
            members = emptyList()
        )
        `class`.body.shouldBeNull()
    }

    @Test
    fun `createSmlClass should not omit empty parameter lists`() {
        val `class` = createSmlClass(
            "Test",
            parameters = emptyList()
        )
        `class`.parameterList.shouldBeInstanceOf<SmlParameterList>()
    }

    @Test
    fun `createSmlClass should omit empty parent type list`() {
        val `class` = createSmlClass(
            "Test",
            parentTypes = emptyList()
        )
        `class`.parentTypeList.shouldBeNull()
    }

    @Test
    fun `createSmlClass should omit empty type parameter list`() {
        val `class` = createSmlClass(
            "Test",
            typeParameters = emptyList()
        )
        `class`.typeParameterList.shouldBeNull()
    }

    @Test
    fun `createSmlClass should omit empty constraint list`() {
        val `class` = createSmlClass(
            "Test",
            constraints = emptyList()
        )
        `class`.constraintList.shouldBeNull()
    }

    @Test
    fun `smlClass should add the created class to the receiving class`() {
        val `class` = createSmlClass("Test") {
            smlClass("Test")
        }

        val body = `class`.body
        body.shouldNotBeNull()
        body.members.shouldHaveSize(1)
    }

    @Test
    fun `smlClass should add the created class to the receiving compilation unit`() {
        val compilationUnit = createSmlCompilationUnit(packageName = "test") {
            smlClass("Test")
        }

        compilationUnit.members.shouldHaveSize(1)
    }

    @Test
    fun `createSmlCompilationUnit should store annotation uses in annotationCalls`() {
        val compilationUnit = createSmlCompilationUnit(
            packageName = "test",
            listOf(createSmlAnnotationCall("Test"))
        )

        compilationUnit.annotationCalls.shouldHaveSize(1)
        compilationUnit.annotationCallList.shouldBeNull()
    }

    @Test
    fun `createSmlEnum should store annotation uses in annotationCallList`() {
        val `enum` = createSmlEnum(
            "Test",
            listOf(createSmlAnnotationCall("Test"))
        )

        `enum`.annotationCalls.shouldHaveSize(0)

        val annotationCallList = `enum`.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `createSmlEnum should omit empty body`() {
        val enum = createSmlEnum(
            "Test",
            variants = emptyList()
        )
        enum.body.shouldBeNull()
    }

    @Test
    fun `smlEnum should add the created enum to the receiving class`() {
        val `class` = createSmlClass("Test") {
            smlEnum("Test")
        }

        val body = `class`.body
        body.shouldNotBeNull()
        body.members.shouldHaveSize(1)
    }

    @Test
    fun `smlEnum should add the created enum to the receiving compilation unit`() {
        val compilationUnit = createSmlCompilationUnit(packageName = "test") {
            smlEnum("Test")
        }

        compilationUnit.members.shouldHaveSize(1)
    }

    @Test
    fun `createSmlEnumVariant should store annotation uses in annotations`() {
        val variant = createSmlEnumVariant(
            "Test",
            listOf(createSmlAnnotationCall("Test"))
        )

        variant.annotationCalls.shouldHaveSize(1)
        variant.annotationCallList.shouldBeNull()
    }

    @Test
    fun `createSmlEnumVariant should omit empty type parameter list`() {
        val enum = createSmlEnumVariant(
            "Test",
            typeParameters = emptyList()
        )
        enum.typeParameterList.shouldBeNull()
    }

    @Test
    fun `createSmlEnumVariant should omit empty parameter list`() {
        val enum = createSmlEnumVariant(
            "Test",
            parameters = emptyList()
        )
        enum.parameterList.shouldBeNull()
    }

    @Test
    fun `createSmlEnumVariant should omit empty constraint list`() {
        val enum = createSmlEnumVariant(
            "Test",
            constraints = emptyList()
        )
        enum.constraintList.shouldBeNull()
    }

    @Test
    fun `smlEnumVariant should add the created variant to the receiver`() {
        val enum = createSmlEnum("Test") {
            smlEnumVariant("Test")
        }

        val body = enum.body
        body.shouldNotBeNull()
        body.variants.shouldHaveSize(1)
    }

    @Test
    fun `createSmlExpressionLambda should use a lambda parameter list for parameters`() {
        val lambda = createSmlExpressionLambda(result = createSmlNull())
        lambda.parameterList.shouldBeInstanceOf<SmlLambdaParameterList>()
    }

    @Test
    fun `createSmlExpressionLambda should create a serializable expression lambda`() {
        val lambda = createSmlExpressionLambda(result = createSmlNull())

        createSmlDummyResource(fileName = "test", SmlFileExtension.Test, packageName = "test") {
            smlWorkflow(name = "test") {
                smlExpressionStatement(lambda)
            }
        }

        lambda.serializeToFormattedString().shouldBeInstanceOf<SerializationResult.Success>()
    }

    @Test
    fun `smlExpressionStatement should add the created expression statement to the receiving lambda`() {
        val lambda = createSmlBlockLambda {
            smlExpressionStatement(createSmlInt(1))
        }

        val body = lambda.body
        body.shouldNotBeNull()
        body.statements.shouldHaveSize(1)
    }

    @Test
    fun `smlExpressionStatement should add the created expression statement to the receiving workflow`() {
        val workflow = createSmlWorkflow("Test") {
            smlExpressionStatement(createSmlInt(1))
        }

        val body = workflow.body
        body.shouldNotBeNull()
        body.statements.shouldHaveSize(1)
    }

    @Test
    fun `smlExpressionStatement should add the created expression statement to the receiving step`() {
        val step = createSmlStep("Test") {
            smlExpressionStatement(createSmlInt(1))
        }

        val body = step.body
        body.shouldNotBeNull()
        body.statements.shouldHaveSize(1)
    }

    @Test
    fun `createSmlFloat should wrap negative numbers in a prefix operation (-)`() {
        val float = createSmlFloat(-1.0)

        float.shouldBeInstanceOf<SmlPrefixOperation>()
        float.operator shouldBe SmlPrefixOperationOperator.Minus.operator

        val operand = float.operand
        operand.shouldBeInstanceOf<SmlFloat>()
        operand.value shouldBeCloseTo 1.0
    }

    @Test
    fun `createSmlFunction should store annotation uses in annotationCallList`() {
        val function = createSmlFunction(
            "test",
            listOf(createSmlAnnotationCall("Test"))
        )

        function.annotationCalls.shouldHaveSize(0)

        val annotationCallList = function.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `createSmlFunction should omit empty result list`() {
        val function = createSmlFunction(
            "test",
            results = emptyList()
        )
        function.resultList.shouldBeNull()
    }

    @Test
    fun `createSmlFunction should omit empty type parameter list`() {
        val function = createSmlFunction(
            "test",
            typeParameters = emptyList()
        )
        function.typeParameterList.shouldBeNull()
    }

    @Test
    fun `createSmlFunction should omit empty constraint list`() {
        val function = createSmlFunction(
            "test",
            constraints = emptyList()
        )
        function.constraintList.shouldBeNull()
    }

    @Test
    fun `smlFunction should add the created function to the receiving class`() {
        val `class` = createSmlClass("Test") {
            smlFunction("test")
        }

        val body = `class`.body
        body.shouldNotBeNull()
        body.members.shouldHaveSize(1)
    }

    @Test
    fun `smlFunction should add the created function to the receiving compilation unit`() {
        val compilationUnit = createSmlCompilationUnit(packageName = "test") {
            smlFunction("test")
        }

        compilationUnit.members.shouldHaveSize(1)
    }

    @Test
    fun `createSmlInt should wrap negative numbers in a prefix operation (-)`() {
        val int = createSmlInt(-1)

        int.shouldBeInstanceOf<SmlPrefixOperation>()
        int.operator shouldBe SmlPrefixOperationOperator.Minus.operator

        val operand = int.operand
        operand.shouldBeInstanceOf<SmlInt>()
        operand.value shouldBe 1
    }

    @Test
    fun `createSmlNamedType should omit empty type argument lists`() {
        val namedType = createSmlNamedType(
            createSmlClass("Int"),
            typeArguments = emptyList()
        )
        namedType.typeArgumentList.shouldBeNull()
    }

    @Test
    fun `createSmlParameter should store annotation uses in annotations`() {
        val parameter = createSmlParameter(
            "test",
            listOf(createSmlAnnotationCall("Test"))
        )

        parameter.annotationCalls.shouldHaveSize(1)
        parameter.annotationCallList.shouldBeNull()
    }

    @Test
    fun `createSmlProtocol should omit empty subterm list`() {
        val protocol = createSmlProtocol(emptyList())
        protocol.body.shouldNotBeNull()
        protocol.body.subtermList.shouldBeNull()
    }

    @Test
    fun `smlProtocol should add the created protocol to the receiving class`() {
        val `class` = createSmlClass("Test") {
            smlProtocol()
        }

        `class`.body.shouldNotBeNull()
        `class`.body.members.filterIsInstance<SmlProtocol>().shouldHaveSize(1)
    }

    @Test
    fun `createSmlProtocolAlternative should throw if fewer than two terms are passed`() {
        shouldThrow<IllegalArgumentException> {
            createSmlProtocolAlternative(listOf())
        }

        shouldThrow<IllegalArgumentException> {
            createSmlProtocolAlternative(
                listOf(
                    createSmlProtocolTokenClass(SmlProtocolTokenClassValue.Anything)
                )
            )
        }

        shouldNotThrow<IllegalArgumentException> {
            createSmlProtocolAlternative(
                listOf(
                    createSmlProtocolTokenClass(SmlProtocolTokenClassValue.Anything),
                    createSmlProtocolTokenClass(SmlProtocolTokenClassValue.Anything),
                )
            )
        }
    }

    @Test
    fun `createSmlProtocolComplement should omit empty reference list`() {
        val complement = createSmlProtocolComplement()
        complement.referenceList.shouldBeNull()
    }

    @Test
    fun `createSmlProtocolSequence should throw if fewer than two terms are passed`() {
        shouldThrow<IllegalArgumentException> {
            createSmlProtocolSequence(listOf())
        }

        shouldThrow<IllegalArgumentException> {
            createSmlProtocolSequence(
                listOf(
                    createSmlProtocolTokenClass(SmlProtocolTokenClassValue.Anything)
                )
            )
        }

        shouldNotThrow<IllegalArgumentException> {
            createSmlProtocolSequence(
                listOf(
                    createSmlProtocolTokenClass(SmlProtocolTokenClassValue.Anything),
                    createSmlProtocolTokenClass(SmlProtocolTokenClassValue.Anything),
                )
            )
        }
    }

    @Test
    fun `smlProtocolSubterm should add the created subterm to the receiving protocol`() {
        val protocol = createSmlProtocol {
            smlProtocolSubterm("test", createSmlProtocolTokenClass(SmlProtocolTokenClassValue.Anything))
        }

        protocol.body.shouldNotBeNull()
        protocol.body.subtermList.shouldNotBeNull()
        protocol.body.subtermList.subterms.shouldHaveSize(1)
    }

    @Test
    fun `createSmlResult should store annotation uses in annotations`() {
        val result = createSmlResult(
            "Test",
            listOf(createSmlAnnotationCall("Test"))
        )

        result.annotationCalls.shouldHaveSize(1)
        result.annotationCallList.shouldBeNull()
    }

    @Test
    fun `createSmlTemplate should throw if there are fewer than 2 string parts`() {
        shouldThrow<IllegalArgumentException> {
            createSmlTemplateString(
                listOf("Test"),
                listOf(createSmlInt(1))
            )
        }
    }

    @Test
    fun `createSmlTemplate should throw if there is no template expression`() {
        shouldThrow<IllegalArgumentException> {
            createSmlTemplateString(
                listOf("Test", "Test"),
                listOf()
            )
        }
    }

    @Test
    fun `createSmlTemplate should throw if numbers of string parts and template expressions don't match`() {
        shouldThrow<IllegalArgumentException> {
            createSmlTemplateString(
                listOf("Test", "Test", "Test"),
                listOf(createSmlInt(1))
            )
        }
    }

    @Test
    fun `createSmlTemplate should interleave string parts and template expressions`() {
        val templateString = createSmlTemplateString(
            listOf("Start", "Inner", "Inner", "End"),
            listOf(createSmlInt(1), createSmlInt(1), createSmlInt(1))
        )

        templateString.expressions.asClue {
            it.shouldHaveSize(7)
            it[0].shouldBeInstanceOf<SmlTemplateStringStart>()
            it[1].shouldBeInstanceOf<SmlInt>()
            it[2].shouldBeInstanceOf<SmlTemplateStringInner>()
            it[3].shouldBeInstanceOf<SmlInt>()
            it[4].shouldBeInstanceOf<SmlTemplateStringInner>()
            it[5].shouldBeInstanceOf<SmlInt>()
            it[6].shouldBeInstanceOf<SmlTemplateStringEnd>()
        }
    }

    @Test
    fun `createSmlTypeArgument should create an SmlTypeParameter when only a name is passed`() {
        val typeArgument = createSmlTypeArgument(
            createSmlStarProjection(),
            "Test"
        )
        val typeParameter = typeArgument.typeParameter
        typeParameter.shouldNotBeNull()
        typeParameter.name shouldBe "Test"
    }

    @Test
    fun `createSmlTypeParameter should store annotation uses in annotations`() {
        val result = createSmlTypeParameter(
            "Test",
            listOf(createSmlAnnotationCall("Test"))
        )

        result.annotationCalls.shouldHaveSize(1)
        result.annotationCallList.shouldBeNull()
    }

    @Test
    fun `createTypeParameterConstraint should create an SmlTypeParameter when only a name is passed`() {
        val constraint = createSmlTypeParameterConstraint(
            "Test",
            SmlTypeParameterConstraintOperator.SubclassOf,
            createSmlNamedType(createSmlClass("Test"))
        )
        val leftOperand = constraint.leftOperand
        leftOperand.shouldNotBeNull()
        leftOperand.name shouldBe "Test"
    }

    @Test
    fun `createSmlUnionType should throw if no type arguments are passed`() {
        shouldThrow<IllegalArgumentException> {
            createSmlUnionType(listOf())
        }

        shouldNotThrow<IllegalArgumentException> {
            createSmlUnionType(
                listOf(
                    createSmlTypeArgument(
                        createSmlStarProjection()
                    )
                )
            )
        }
    }

    @Test
    fun `createSmlYield should create an SmlResult when only a name is passed`() {
        val yield = createSmlYield("test")
        val result = `yield`.result
        result.shouldNotBeNull()
        result.name shouldBe "test"
    }

    @Test
    fun `createSmlStep should store annotation uses in annotationCallList`() {
        val step = createSmlStep(
            "test",
            listOf(createSmlAnnotationCall("Test"))
        )

        step.annotationCalls.shouldHaveSize(0)

        val annotationCallList = step.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `createSmlStep should omit empty result list`() {
        val function = createSmlStep(
            "test",
            results = emptyList()
        )
        function.resultList.shouldBeNull()
    }

    @Test
    fun `smlStep should add the created step to the receiving compilation unit`() {
        val compilationUnit = createSmlCompilationUnit(packageName = "test") {
            smlStep("test")
        }

        compilationUnit.members.shouldHaveSize(1)
    }

    @Test
    fun `createSmlWorkflow should store annotation uses in annotationCallList`() {
        val workflow = createSmlWorkflow(
            "test",
            listOf(createSmlAnnotationCall("Test"))
        )

        workflow.annotationCalls.shouldHaveSize(0)

        val annotationCallList = workflow.annotationCallList
        annotationCallList.shouldNotBeNull()
        annotationCallList.annotationCalls.shouldHaveSize(1)
    }

    @Test
    fun `smlWorkflow should add the created workflow to the receiving compilation unit`() {
        val compilationUnit = createSmlCompilationUnit(packageName = "test") {
            smlWorkflow("test")
        }

        compilationUnit.members.shouldHaveSize(1)
    }
}
