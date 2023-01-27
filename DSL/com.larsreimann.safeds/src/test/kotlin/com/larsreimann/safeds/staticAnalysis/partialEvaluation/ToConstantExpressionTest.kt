package com.larsreimann.safeds.staticAnalysis.partialEvaluation

import com.google.inject.Inject
import com.larsreimann.safeds.constant.SdsInfixOperationOperator
import com.larsreimann.safeds.constant.SdsPrefixOperationOperator
import com.larsreimann.safeds.emf.createSdsAnnotation
import com.larsreimann.safeds.emf.createSdsArgument
import com.larsreimann.safeds.emf.createSdsAssignment
import com.larsreimann.safeds.emf.createSdsAttribute
import com.larsreimann.safeds.emf.createSdsBlockLambda
import com.larsreimann.safeds.emf.createSdsBoolean
import com.larsreimann.safeds.emf.createSdsCall
import com.larsreimann.safeds.emf.createSdsEnum
import com.larsreimann.safeds.emf.createSdsEnumVariant
import com.larsreimann.safeds.emf.createSdsExpressionLambda
import com.larsreimann.safeds.emf.createSdsFloat
import com.larsreimann.safeds.emf.createSdsInfixOperation
import com.larsreimann.safeds.emf.createSdsInt
import com.larsreimann.safeds.emf.createSdsMemberAccess
import com.larsreimann.safeds.emf.createSdsNull
import com.larsreimann.safeds.emf.createSdsParameter
import com.larsreimann.safeds.emf.createSdsParenthesizedExpression
import com.larsreimann.safeds.emf.createSdsPlaceholder
import com.larsreimann.safeds.emf.createSdsPrefixOperation
import com.larsreimann.safeds.emf.createSdsReference
import com.larsreimann.safeds.emf.createSdsStep
import com.larsreimann.safeds.emf.createSdsString
import com.larsreimann.safeds.emf.createSdsTemplateString
import com.larsreimann.safeds.emf.descendants
import com.larsreimann.safeds.emf.statementsOrEmpty
import com.larsreimann.safeds.safeDS.SafeDSFactory
import com.larsreimann.safeds.safeDS.SdsAbstractExpression
import com.larsreimann.safeds.safeDS.SdsBlockLambda
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import com.larsreimann.safeds.safeDS.SdsExpressionLambda
import com.larsreimann.safeds.safeDS.SdsExpressionStatement
import com.larsreimann.safeds.safeDS.SdsStep
import com.larsreimann.safeds.safeDS.SdsPipeline
import com.larsreimann.safeds.testing.ParseHelper
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
import com.larsreimann.safeds.testing.assertions.findUniqueDeclarationOrFail
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.CsvSource

@ExtendWith(InjectionExtension::class)
@InjectWith(SafeDSInjectorProvider::class)
class ToConstantExpressionTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    private val factory = SafeDSFactory.eINSTANCE

    private lateinit var impureBlockLambda: SdsBlockLambda
    private lateinit var pureBlockLambda: SdsBlockLambda
    private lateinit var recursiveBlockLambda: SdsBlockLambda
    private lateinit var impureExpressionLambda: SdsExpressionLambda
    private lateinit var pureExpressionLambda: SdsExpressionLambda
    private lateinit var recursiveExpressionLambda: SdsExpressionLambda
    private lateinit var impureStep: SdsStep
    private lateinit var pureStep: SdsStep
    private lateinit var recursiveStep: SdsStep

    @BeforeEach
    fun reset() {
        val compilationUnit = parseHelper.parseResource("partialEvaluation/callables.sdstest")
        compilationUnit.shouldNotBeNull()

        val blockLambdas = compilationUnit.descendants<SdsBlockLambda>().toList()
        blockLambdas.shouldHaveSize(3)

        impureBlockLambda = blockLambdas[0]
        pureBlockLambda = blockLambdas[1]
        recursiveBlockLambda = blockLambdas[2]

        val expressionLambdas = compilationUnit.descendants<SdsExpressionLambda>().toList()
        expressionLambdas.shouldHaveSize(3)

        impureExpressionLambda = expressionLambdas[0]
        pureExpressionLambda = expressionLambdas[1]
        recursiveExpressionLambda = expressionLambdas[2]

        impureStep = compilationUnit.findUniqueDeclarationOrFail("impureStep")
        pureStep = compilationUnit.findUniqueDeclarationOrFail("pureStep")
        recursiveStep = compilationUnit.findUniqueDeclarationOrFail("recursiveStep")
    }

    @Nested
    inner class BaseCases {

        @Test
        fun `should return value of boolean literal`() {
            val testData = createSdsBoolean(true)
            testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(true)
        }

        @Test
        fun `should return value of float literal`() {
            val testData = createSdsFloat(1.0)
            testData.toConstantExpressionOrNull() shouldBe SdsConstantFloat(1.0)
        }

        @Test
        fun `should return value of int literal`() {
            val testData = createSdsInt(1)
            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
        }

        @Test
        fun `should return value of null literal`() {
            val testData = createSdsNull()
            testData.toConstantExpressionOrNull() shouldBe SdsConstantNull
        }

        @Test
        fun `should return value of for string literal`() {
            val testData = createSdsString("test")
            testData.toConstantExpressionOrNull() shouldBe SdsConstantString("test")
        }

        @Test
        fun `should return value of template string start`() {
            val testData = factory.createSdsTemplateStringStart().apply { value = "test" }
            testData.toConstantExpressionOrNull() shouldBe SdsConstantString("test")
        }

        @Test
        fun `should return value of template string inner`() {
            val testData = factory.createSdsTemplateStringInner().apply { value = "test" }
            testData.toConstantExpressionOrNull() shouldBe SdsConstantString("test")
        }

        @Test
        fun `should return value of template string end`() {
            val testData = factory.createSdsTemplateStringEnd().apply { value = "test" }
            testData.toConstantExpressionOrNull() shouldBe SdsConstantString("test")
        }

        @Test
        fun `toConstantExpression should return null for block lambda`() {
            val testData = createSdsBlockLambda()
            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `simplify should return null for impure block lambda`() {
            impureBlockLambda.simplify(emptyMap()).shouldBeNull()
        }

        @Test
        fun `simplify should return intermediate block lambda for pure block lambda`() {
            pureBlockLambda.simplify(emptyMap()).shouldBeInstanceOf<SdsIntermediateBlockLambda>()
        }

        @Test
        fun `simplify should return null for block lambda with recursive call`() {
            recursiveBlockLambda.simplify(emptyMap()).shouldBeNull()
        }

        @Test
        fun `toConstantExpression should return null for expression lambda`() {
            val testData = createSdsExpressionLambda(result = createSdsNull())
            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `simplify should return null for impure expression lambda`() {
            impureExpressionLambda.simplify(emptyMap()).shouldBeNull()
        }

        @Test
        fun `simplify should return intermediate expression lambda for pure expression lambda`() {
            pureExpressionLambda.simplify(emptyMap()).shouldBeInstanceOf<SdsIntermediateExpressionLambda>()
        }

        @Test
        fun `simplify should return null for expression lambda with recursive call`() {
            recursiveExpressionLambda.simplify(emptyMap()).shouldBeNull()
        }
    }

    @Nested
    inner class Argument {

        @Test
        fun `should return value as constant expression for arguments`() {
            val testData = createSdsArgument(value = createSdsNull())
            testData.toConstantExpressionOrNull() shouldBe SdsConstantNull
        }
    }

    @Nested
    inner class InfixOperation {

        @Nested
        inner class Or {

            @ParameterizedTest
            @CsvSource(
                delimiter = '|',
                textBlock = """
                    false | false | false
                    false | true  | true
                    true  | false | true
                    true  | true  | true"""
            )
            fun `should return if left or right operand is true`(
                leftOperand: Boolean,
                rightOperand: Boolean,
                expected: Boolean
            ) {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(leftOperand),
                    operator = SdsInfixOperationOperator.Or,
                    rightOperand = createSdsBoolean(rightOperand)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(expected)
            }

            @Test
            fun `should return null if the left operand is not a constant boolean`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsNull(),
                    operator = SdsInfixOperationOperator.Or,
                    rightOperand = createSdsBoolean(true)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant boolean`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.Or,
                    rightOperand = createSdsNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class And {

            @ParameterizedTest
            @CsvSource(
                delimiter = '|',
                textBlock = """
                    false | false | false
                    false | true  | false
                    true  | false | false
                    true  | true  | true"""
            )
            fun `should return if left and right operand is true`(
                leftOperand: Boolean,
                rightOperand: Boolean,
                expected: Boolean
            ) {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(leftOperand),
                    operator = SdsInfixOperationOperator.And,
                    rightOperand = createSdsBoolean(rightOperand)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(expected)
            }

            @Test
            fun `should return null if the left operand is not a constant boolean`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsNull(),
                    operator = SdsInfixOperationOperator.And,
                    rightOperand = createSdsBoolean(true)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant boolean`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.And,
                    rightOperand = createSdsNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class Equals {

            @Test
            fun `should return true boolean literal if left and right operands are equal`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.Equals,
                    rightOperand = createSdsBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(true)
            }

            @Test
            fun `should return false boolean literal if left and right operands are not equal`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.Equals,
                    rightOperand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(false)
            }

            @Test
            fun `should return null if the left operand is not a constant expression`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsCall(
                        receiver = createSdsNull()
                    ),
                    operator = SdsInfixOperationOperator.Equals,
                    rightOperand = createSdsBoolean(true)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant expression`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.Equals,
                    rightOperand = createSdsCall(
                        receiver = createSdsNull()
                    )
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class NotEquals {

            @Test
            fun `should return true boolean literal if left and right operands are not equal`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.NotEquals,
                    rightOperand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(true)
            }

            @Test
            fun `should return false boolean literal if left and right operands are equal`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.NotEquals,
                    rightOperand = createSdsBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(false)
            }

            @Test
            fun `should return null if the left operand is not a constant expression`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsCall(
                        receiver = createSdsNull()
                    ),
                    operator = SdsInfixOperationOperator.NotEquals,
                    rightOperand = createSdsBoolean(true)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant expression`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.NotEquals,
                    rightOperand = createSdsCall(
                        receiver = createSdsNull()
                    )
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class IdenticalTo {

            @Test
            fun `should return true boolean literal if left and right operands are identical`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.IdenticalTo,
                    rightOperand = createSdsBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(true)
            }

            @Test
            fun `should return false boolean literal if left and right operands are not identical`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.IdenticalTo,
                    rightOperand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(false)
            }

            @Test
            fun `should return null if the left operand is not a constant expression`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsCall(
                        receiver = createSdsNull()
                    ),
                    operator = SdsInfixOperationOperator.IdenticalTo,
                    rightOperand = createSdsBoolean(true)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant expression`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.IdenticalTo,
                    rightOperand = createSdsCall(
                        receiver = createSdsNull()
                    )
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class NotIdenticalTo {

            @Test
            fun `should return true boolean literal if left and right operands are not identical`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.NotIdenticalTo,
                    rightOperand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(true)
            }

            @Test
            fun `should return false boolean literal if left and right operands are identical`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.NotIdenticalTo,
                    rightOperand = createSdsBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(false)
            }

            @Test
            fun `should return null if the left operand is not a constant expression`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsCall(
                        receiver = createSdsNull()
                    ),
                    operator = SdsInfixOperationOperator.NotIdenticalTo,
                    rightOperand = createSdsBoolean(true)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant expression`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.NotIdenticalTo,
                    rightOperand = createSdsCall(
                        receiver = createSdsNull()
                    )
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class LessThan {

            @ParameterizedTest
            @CsvSource(
                delimiter = '|',
                textBlock = """
                    0.5 | 1.5 | true
                    0.5 | 1   | true
                    0   | 1.5 | true
                    0   | 1   | true
                    1.5 | 0.5 | false
                    1.5 | 0   | false
                    1   | 0.5 | false
                    1   | 0   | false"""
            )
            fun `should return whether left operand is less than right operand`(
                leftOperand: Double,
                rightOperand: Double,
                expected: Boolean
            ) {
                val testData = createSdsInfixOperation(
                    leftOperand = leftOperand.toSdsNumber(),
                    operator = SdsInfixOperationOperator.LessThan,
                    rightOperand = rightOperand.toSdsNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(expected)
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsNull(),
                    operator = SdsInfixOperationOperator.LessThan,
                    rightOperand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsInt(1),
                    operator = SdsInfixOperationOperator.LessThan,
                    rightOperand = createSdsNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class LessThanOrEquals {

            @ParameterizedTest
            @CsvSource(
                delimiter = '|',
                textBlock = """
                    0.5 | 0.5 | true
                    0.5 | 1   | true
                    0   | 1.5 | true
                    0   | 1   | true
                    1.5 | 0.5 | false
                    1.5 | 0   | false
                    1   | 0.5 | false
                    1   | 0   | false"""
            )
            fun `should return whether left operand is less than or equal to right operand`(
                leftOperand: Double,
                rightOperand: Double,
                expected: Boolean
            ) {
                val testData = createSdsInfixOperation(
                    leftOperand = leftOperand.toSdsNumber(),
                    operator = SdsInfixOperationOperator.LessThanOrEquals,
                    rightOperand = rightOperand.toSdsNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(expected)
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsNull(),
                    operator = SdsInfixOperationOperator.LessThanOrEquals,
                    rightOperand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsInt(1),
                    operator = SdsInfixOperationOperator.LessThanOrEquals,
                    rightOperand = createSdsNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class GreaterThanOrEquals {

            @ParameterizedTest
            @CsvSource(
                delimiter = '|',
                textBlock = """
                    0.5 | 0.5 | true
                    1.5 | 0   | true
                    1   | 0.5 | true
                    1   | 0   | true
                    0.5 | 1.5 | false
                    0.5 | 1   | false
                    0   | 1.5 | false
                    0   | 1   | false"""
            )
            fun `should return whether left operand is greater than or equal to right operand`(
                leftOperand: Double,
                rightOperand: Double,
                expected: Boolean
            ) {
                val testData = createSdsInfixOperation(
                    leftOperand = leftOperand.toSdsNumber(),
                    operator = SdsInfixOperationOperator.GreaterThanOrEquals,
                    rightOperand = rightOperand.toSdsNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(expected)
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsNull(),
                    operator = SdsInfixOperationOperator.GreaterThanOrEquals,
                    rightOperand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsInt(1),
                    operator = SdsInfixOperationOperator.GreaterThanOrEquals,
                    rightOperand = createSdsNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class GreaterThan {

            @ParameterizedTest
            @CsvSource(
                delimiter = '|',
                textBlock = """
                    1.5 | 0.5 | true
                    1.5 | 0   | true
                    1   | 0.5 | true
                    1   | 0   | true
                    0.5 | 1.5 | false
                    0.5 | 1   | false
                    0   | 1.5 | false
                    0   | 1   | false"""
            )
            fun `should return whether left operand is greater than right operand`(
                leftOperand: Double,
                rightOperand: Double,
                expected: Boolean
            ) {
                val testData = createSdsInfixOperation(
                    leftOperand = leftOperand.toSdsNumber(),
                    operator = SdsInfixOperationOperator.GreaterThan,
                    rightOperand = rightOperand.toSdsNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(expected)
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsNull(),
                    operator = SdsInfixOperationOperator.GreaterThan,
                    rightOperand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsInt(1),
                    operator = SdsInfixOperationOperator.GreaterThan,
                    rightOperand = createSdsNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class Plus {

            @ParameterizedTest
            @CsvSource(
                delimiter = '|',
                textBlock = """
                    1.5 | 0.25 | 1.75
                    1.5 | 1    | 2.5
                    1   | 0.25 | 1.25
                    1   | 1    | 2"""
            )
            fun `should return sum of left and right operand`(
                leftOperand: Double,
                rightOperand: Double,
                expected: Double
            ) {
                val testData = createSdsInfixOperation(
                    leftOperand = leftOperand.toSdsNumber(),
                    operator = SdsInfixOperationOperator.Plus,
                    rightOperand = rightOperand.toSdsNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe expected.toSdsNumber().toConstantExpressionOrNull()
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsNull(),
                    operator = SdsInfixOperationOperator.Plus,
                    rightOperand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsInt(1),
                    operator = SdsInfixOperationOperator.Plus,
                    rightOperand = createSdsNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class Minus {

            @ParameterizedTest
            @CsvSource(
                delimiter = '|',
                textBlock = """
                    1.5 | 0.25 | 1.25
                    1.5 | 1    | 0.5
                    1   | 0.25 | 0.75
                    1   | 1    | 0"""
            )
            fun `should return difference between left and right operand`(
                leftOperand: Double,
                rightOperand: Double,
                expected: Double
            ) {
                val testData = createSdsInfixOperation(
                    leftOperand = leftOperand.toSdsNumber(),
                    operator = SdsInfixOperationOperator.Minus,
                    rightOperand = rightOperand.toSdsNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe expected.toSdsNumber().toConstantExpressionOrNull()
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsNull(),
                    operator = SdsInfixOperationOperator.Minus,
                    rightOperand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsInt(1),
                    operator = SdsInfixOperationOperator.Minus,
                    rightOperand = createSdsNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class Times {

            @ParameterizedTest
            @CsvSource(
                delimiter = '|',
                textBlock = """
                    1.5 | 0.5  | 0.75
                    1.5 | 1    | 1.5
                    1   | 0.25 | 0.25
                    1   | 1    | 1"""
            )
            fun `should return product of left and right operand`(
                leftOperand: Double,
                rightOperand: Double,
                expected: Double
            ) {
                val testData = createSdsInfixOperation(
                    leftOperand = leftOperand.toSdsNumber(),
                    operator = SdsInfixOperationOperator.Times,
                    rightOperand = rightOperand.toSdsNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe expected.toSdsNumber().toConstantExpressionOrNull()
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsNull(),
                    operator = SdsInfixOperationOperator.Times,
                    rightOperand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsInt(1),
                    operator = SdsInfixOperationOperator.Times,
                    rightOperand = createSdsNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class By {

            @ParameterizedTest
            @CsvSource(
                delimiter = '|',
                textBlock = """
                    0.25 | 0.5   | 0.5
                    1.5  | 1     | 1.5
                    1    | 0.625 | 1.6
                    1    | 1     | 1"""
            )
            fun `should return quotient of left and right operand`(
                leftOperand: Double,
                rightOperand: Double,
                expected: Double
            ) {
                val testData = createSdsInfixOperation(
                    leftOperand = leftOperand.toSdsNumber(),
                    operator = SdsInfixOperationOperator.By,
                    rightOperand = rightOperand.toSdsNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe expected.toSdsNumber().toConstantExpressionOrNull()
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsNull(),
                    operator = SdsInfixOperationOperator.By,
                    rightOperand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsInt(1),
                    operator = SdsInfixOperationOperator.By,
                    rightOperand = createSdsNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is constant integer 0`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsInt(1),
                    operator = SdsInfixOperationOperator.By,
                    rightOperand = createSdsInt(0)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is constant float 0`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsInt(1),
                    operator = SdsInfixOperationOperator.By,
                    rightOperand = createSdsFloat(0.0)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is constant float -0`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsInt(1),
                    operator = SdsInfixOperationOperator.By,
                    rightOperand = createSdsFloat(-0.0)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class Elvis {

            @Test
            fun `should return left operand if it does not evaluate to a constant null`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsBoolean(true),
                    operator = SdsInfixOperationOperator.Elvis,
                    rightOperand = createSdsBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(true)
            }

            @Test
            fun `should return right operand if the left operand evaluates to a constant null`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsNull(),
                    operator = SdsInfixOperationOperator.Elvis,
                    rightOperand = createSdsBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(true)
            }

            @Test
            fun `should return null if the left operand is not a constant expression`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsCall(
                        receiver = createSdsNull()
                    ),
                    operator = SdsInfixOperationOperator.Elvis,
                    rightOperand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant expression`() {
                val testData = createSdsInfixOperation(
                    leftOperand = createSdsInt(1),
                    operator = SdsInfixOperationOperator.Elvis,
                    rightOperand = createSdsCall(
                        receiver = createSdsNull()
                    )
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }
    }

    @Nested
    inner class ParenthesizedExpression {

        @Test
        fun `should return expression as constant expression for parenthesized expressions`() {
            val testData = createSdsParenthesizedExpression(createSdsNull())
            testData.toConstantExpressionOrNull() shouldBe SdsConstantNull
        }
    }

    @Nested
    inner class PrefixOperation {

        @Nested
        inner class Not {

            @Test
            fun `should return negated operand if it is a constant boolean`() {
                val testData = createSdsPrefixOperation(
                    operator = SdsPrefixOperationOperator.Not,
                    operand = createSdsBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantBoolean(false)
            }

            @Test
            fun `should return null if the operand is not a constant boolean`() {
                val testData = createSdsPrefixOperation(
                    operator = SdsPrefixOperationOperator.Not,
                    operand = createSdsNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class Minus {

            @Test
            fun `should return negated operand if it is a constant float`() {
                val testData = createSdsPrefixOperation(
                    operator = SdsPrefixOperationOperator.Minus,
                    operand = createSdsFloat(1.0)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantFloat(-1.0)
            }

            @Test
            fun `should return negated operand if it is a constant int`() {
                val testData = createSdsPrefixOperation(
                    operator = SdsPrefixOperationOperator.Minus,
                    operand = createSdsInt(1)
                )

                testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(-1)
            }

            @Test
            fun `should return null if the operand is not a constant number`() {
                val testData = createSdsPrefixOperation(
                    operator = SdsPrefixOperationOperator.Minus,
                    operand = createSdsNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }
    }

    @Nested
    inner class TemplateString {

        @Test
        fun `should return concatenated string`() {
            val testData = createSdsTemplateString(
                stringParts = listOf(
                    "start ",
                    " inner1 ",
                    " inner2 ",
                    " inner3 ",
                    " inner4 ",
                    " inner5 ",
                    " end"
                ),
                templateExpressions = listOf(
                    createSdsBoolean(true),
                    createSdsFloat(1.0),
                    createSdsInt(1),
                    createSdsNull(),
                    createSdsString("string"),
                    createSdsReference(createSdsEnumVariant("Variant"))
                )
            )

            testData.toConstantExpressionOrNull() shouldBe SdsConstantString(
                value = "start true inner1 1.0 inner2 1 inner3 null inner4 string inner5 Variant end"
            )
        }

        @Test
        fun `should return null if any expression is converted to null`() {
            val testData = createSdsTemplateString(
                stringParts = listOf("start ", " end"),
                templateExpressions = listOf(
                    createSdsCall(receiver = createSdsNull())
                )
            )

            testData.toConstantExpressionOrNull().shouldBeNull()
        }
    }

    @Nested
    inner class Call {

        private lateinit var compilationUnit: SdsCompilationUnit

        @BeforeEach
        fun reset() {
            compilationUnit = parseHelper.parseResource("partialEvaluation/calls.sdstest")!!
        }

        @Test
        fun `should evaluate calls of block lambdas`() {
            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("callToBlockLambda")
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
        }

        @Test
        fun `should evaluate calls of expression lambdas`() {
            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("callToExpressionLambda")
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
        }

        @Test
        fun `should evaluate calls of steps`() {
            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("callToStep")
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
        }

        @Test
        fun `should evaluate calls of steps with variadic parameter`() {
            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("callToStepWithVariadicParameter")
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `should evaluate calls of steps with indexed variadic parameter`() {
            val pipeline = compilationUnit
                .findUniqueDeclarationOrFail<SdsPipeline>("callToStepWithIndexedVariadicParameter")
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
        }

        @Test
        fun `should substitute parameters that were bound at call of a lambda`() {
            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>(
                "parameterAssignedDuringCall"
            )
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(10)
        }

        @Test
        fun `should substitute parameters that were bound at creation of a lambda`() {
            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>(
                "parameterAssignedDuringCreationOfLambda"
            )
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
        }

        @Test
        fun `should evaluate calls with lambda as parameter`() {
            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("lambdaAsParameter")
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
        }

        @Test
        fun `should return null otherwise`() {
            val testData = createSdsCall(receiver = createSdsNull())
            testData.toConstantExpressionOrNull().shouldBeNull()
        }
    }

    @Nested
    inner class MemberAccess {

        @Test
        fun `should return constant enum variant if referenced enum variant has no parameters`() {
            val testEnumVariant = createSdsEnumVariant(name = "TestEnumVariant")
            val testEnum = createSdsEnum(
                name = "TestEnum",
                variants = listOf(testEnumVariant)
            )
            val testData = createSdsMemberAccess(
                receiver = createSdsReference(testEnum),
                member = createSdsReference(testEnumVariant)
            )

            testData.toConstantExpressionOrNull() shouldBe SdsConstantEnumVariant(testEnumVariant)
        }

        @Test
        fun `should return null if referenced enum variant has parameters`() {
            val testEnumVariant = createSdsEnumVariant(
                name = "TestEnumVariant",
                parameters = listOf(
                    createSdsParameter(name = "testParameter")
                )
            )
            val testEnum = createSdsEnum(
                name = "TestEnum",
                variants = listOf(testEnumVariant)
            )
            val testData = createSdsMemberAccess(
                receiver = createSdsReference(testEnum),
                member = createSdsReference(testEnumVariant)
            )

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `should return constant null if receiver is constant null and member access is null safe`() {
            val testData = createSdsMemberAccess(
                receiver = createSdsNull(),
                member = createSdsReference(createSdsAttribute("testAttribute")),
                isNullSafe = true
            )

            testData.toConstantExpressionOrNull() shouldBe SdsConstantNull
        }

        @Test
        fun `should return null if receiver is constant null and member access is not null safe`() {
            val testData = createSdsMemberAccess(
                receiver = createSdsNull(),
                member = createSdsReference(createSdsAttribute("testAttribute"))
            )

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `should access the result of a call by name if result exists`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/memberAccesses.sdstest")
            compilationUnit.shouldNotBeNull()

            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("successfulResultAccess")
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
        }

        @Test
        fun `should return null if accessed result does not exist`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/memberAccesses.sdstest")
            compilationUnit.shouldNotBeNull()

            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("failedResultAccess")
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `should return null for other receivers`() {
            val testData = createSdsMemberAccess(
                receiver = createSdsInt(1),
                member = createSdsReference(
                    createSdsEnumVariant(
                        name = "TestEnumVariant",
                        parameters = listOf(
                            createSdsParameter(name = "testParameter")
                        )
                    )
                )
            )

            testData.toConstantExpressionOrNull().shouldBeNull()
        }
    }

    @Nested
    inner class Reference {

        @Test
        fun `should return constant enum variant if referenced enum variant has no parameters`() {
            val testEnumVariant = createSdsEnumVariant(name = "TestEnumVariant")
            val testData = createSdsReference(
                declaration = testEnumVariant
            )

            testData.toConstantExpressionOrNull() shouldBe SdsConstantEnumVariant(testEnumVariant)
        }

        @Test
        fun `should return null if referenced enum variant has parameters`() {
            val testEnumVariant = createSdsEnumVariant(
                name = "TestEnumVariant",
                parameters = listOf(
                    createSdsParameter(name = "testParameter")
                )
            )
            val testData = createSdsReference(
                declaration = testEnumVariant
            )

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `should convert assigned value of referenced placeholder`() {
            val testPlaceholder = createSdsPlaceholder("testPlaceholder")
            createSdsAssignment(
                assignees = listOf(testPlaceholder),
                createSdsNull()
            )
            val testData = createSdsReference(
                declaration = testPlaceholder
            )

            testData.toConstantExpressionOrNull() shouldBe SdsConstantNull
        }

        @Test
        fun `should return null if referenced placeholder has no assigned value`() {
            val testData = createSdsReference(
                declaration = createSdsPlaceholder("testPlaceholder")
            )

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `simplify should return substituted value if it exists`() {
            val testParameter = createSdsParameter("testParameter")
            val testData = createSdsReference(
                declaration = testParameter
            )

            testData.simplify(mapOf(testParameter to SdsConstantNull)) shouldBe SdsConstantNull
        }

        @Test
        fun `simplify should return default value if referenced parameter is not substituted but optional`() {
            val testParameter = createSdsParameter(
                name = "testParameter",
                defaultValue = createSdsNull()
            )
            val testData = createSdsReference(
                declaration = testParameter
            )

            testData.simplify(emptyMap()) shouldBe SdsConstantNull
        }

        @Test
        fun `simplify should return null if referenced parameter is required and not substituted`() {
            val testParameter = createSdsParameter("testParameter")
            val testData = createSdsReference(
                declaration = testParameter
            )

            testData.simplify(emptyMap()).shouldBeNull()
        }

        @Test
        fun `toConstantExpression should return null if step is referenced`() {
            val testData = createSdsReference(createSdsStep("testStep"))
            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `simplify should return null if referenced step is impure`() {
            val testData = createSdsReference(impureStep)
            testData.simplify(emptyMap()).shouldBeNull()
        }

        @Test
        fun `simplify should return intermediate step if referenced step is pure`() {
            val testData = createSdsReference(pureStep)
            testData.simplify(emptyMap()).shouldBeInstanceOf<SdsIntermediateStep>()
        }

        @Test
        fun `simplify should return null if referenced step has recursive calls`() {
            val testData = createSdsReference(recursiveStep)
            testData.simplify(emptyMap()).shouldBeNull()
        }

        @Test
        fun `should return value of placeholders inside valid assignment with call as expression`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/references.sdstest")
            compilationUnit.shouldNotBeNull()

            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("successfulRecordAssignment")
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
        }

        @Test
        fun `should return null for references to placeholders inside invalid assignment with call as expression`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/references.sdstest")
            compilationUnit.shouldNotBeNull()

            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("failedRecordAssignment")
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `should evaluate references to placeholders (assigned, called step has different yield order)`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/references.sdstest")
            compilationUnit.shouldNotBeNull()

            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>(
                "recordAssignmentWithDifferentYieldOrder"
            )
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
        }

        @Test
        fun `should evaluate references to placeholders (assigned, called step has missing yield)`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/references.sdstest")
            compilationUnit.shouldNotBeNull()

            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("recordAssignmentWithMissingYield")
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
        }

        @Test
        fun `should evaluate references to placeholders (assigned, called step has additional yield)`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/references.sdstest")
            compilationUnit.shouldNotBeNull()

            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>(
                "recordAssignmentWithAdditionalYield"
            )
            val testData = pipeline.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
        }

        @Test
        fun `should return null for other declarations`() {
            val testData = createSdsReference(
                declaration = createSdsAnnotation("TestAnnotation")
            )

            testData.toConstantExpressionOrNull().shouldBeNull()
        }
    }
}

private fun Double.toSdsNumber(): SdsAbstractExpression {
    return when {
        this == this.toInt().toDouble() -> createSdsInt(this.toInt())
        else -> createSdsFloat(this)
    }
}

/**
 * Helper method for tests loaded from a resource that returns the expression of the first expression statement in the
 * workflow.
 */
private fun SdsPipeline.expectedExpression() = statementsOrEmpty()
    .filterIsInstance<SdsExpressionStatement>()
    .firstOrNull()
    .shouldNotBeNull()
    .expression
