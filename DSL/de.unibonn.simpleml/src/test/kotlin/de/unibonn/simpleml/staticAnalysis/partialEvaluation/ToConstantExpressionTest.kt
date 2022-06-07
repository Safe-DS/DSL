package de.unibonn.simpleml.staticAnalysis.partialEvaluation

import com.google.inject.Inject
import de.unibonn.simpleml.constant.SmlInfixOperationOperator
import de.unibonn.simpleml.constant.SmlPrefixOperationOperator
import de.unibonn.simpleml.emf.createSmlAnnotation
import de.unibonn.simpleml.emf.createSmlArgument
import de.unibonn.simpleml.emf.createSmlAssignment
import de.unibonn.simpleml.emf.createSmlAttribute
import de.unibonn.simpleml.emf.createSmlBlockLambda
import de.unibonn.simpleml.emf.createSmlBoolean
import de.unibonn.simpleml.emf.createSmlCall
import de.unibonn.simpleml.emf.createSmlEnum
import de.unibonn.simpleml.emf.createSmlEnumVariant
import de.unibonn.simpleml.emf.createSmlExpressionLambda
import de.unibonn.simpleml.emf.createSmlFloat
import de.unibonn.simpleml.emf.createSmlInfixOperation
import de.unibonn.simpleml.emf.createSmlInt
import de.unibonn.simpleml.emf.createSmlMemberAccess
import de.unibonn.simpleml.emf.createSmlNull
import de.unibonn.simpleml.emf.createSmlParameter
import de.unibonn.simpleml.emf.createSmlParenthesizedExpression
import de.unibonn.simpleml.emf.createSmlPlaceholder
import de.unibonn.simpleml.emf.createSmlPrefixOperation
import de.unibonn.simpleml.emf.createSmlReference
import de.unibonn.simpleml.emf.createSmlStep
import de.unibonn.simpleml.emf.createSmlString
import de.unibonn.simpleml.emf.createSmlTemplateString
import de.unibonn.simpleml.emf.descendants
import de.unibonn.simpleml.emf.statementsOrEmpty
import de.unibonn.simpleml.simpleML.SimpleMLFactory
import de.unibonn.simpleml.simpleML.SmlAbstractExpression
import de.unibonn.simpleml.simpleML.SmlBlockLambda
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.simpleML.SmlExpressionLambda
import de.unibonn.simpleml.simpleML.SmlExpressionStatement
import de.unibonn.simpleml.simpleML.SmlStep
import de.unibonn.simpleml.simpleML.SmlWorkflow
import de.unibonn.simpleml.testing.ParseHelper
import de.unibonn.simpleml.testing.SimpleMLInjectorProvider
import de.unibonn.simpleml.testing.assertions.findUniqueDeclarationOrFail
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
@InjectWith(SimpleMLInjectorProvider::class)
class ToConstantExpressionTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    private val factory = SimpleMLFactory.eINSTANCE

    private lateinit var impureBlockLambda: SmlBlockLambda
    private lateinit var pureBlockLambda: SmlBlockLambda
    private lateinit var recursiveBlockLambda: SmlBlockLambda
    private lateinit var impureExpressionLambda: SmlExpressionLambda
    private lateinit var pureExpressionLambda: SmlExpressionLambda
    private lateinit var recursiveExpressionLambda: SmlExpressionLambda
    private lateinit var impureStep: SmlStep
    private lateinit var pureStep: SmlStep
    private lateinit var recursiveStep: SmlStep

    @BeforeEach
    fun reset() {
        val compilationUnit = parseHelper.parseResource("partialEvaluation/callables.smltest")
        compilationUnit.shouldNotBeNull()

        val blockLambdas = compilationUnit.descendants<SmlBlockLambda>().toList()
        blockLambdas.shouldHaveSize(3)

        impureBlockLambda = blockLambdas[0]
        pureBlockLambda = blockLambdas[1]
        recursiveBlockLambda = blockLambdas[2]

        val expressionLambdas = compilationUnit.descendants<SmlExpressionLambda>().toList()
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
            val testData = createSmlBoolean(true)
            testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(true)
        }

        @Test
        fun `should return value of float literal`() {
            val testData = createSmlFloat(1.0)
            testData.toConstantExpressionOrNull() shouldBe SmlConstantFloat(1.0)
        }

        @Test
        fun `should return value of int literal`() {
            val testData = createSmlInt(1)
            testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(1)
        }

        @Test
        fun `should return value of null literal`() {
            val testData = createSmlNull()
            testData.toConstantExpressionOrNull() shouldBe SmlConstantNull
        }

        @Test
        fun `should return value of for string literal`() {
            val testData = createSmlString("test")
            testData.toConstantExpressionOrNull() shouldBe SmlConstantString("test")
        }

        @Test
        fun `should return value of template string start`() {
            val testData = factory.createSmlTemplateStringStart().apply { value = "test" }
            testData.toConstantExpressionOrNull() shouldBe SmlConstantString("test")
        }

        @Test
        fun `should return value of template string inner`() {
            val testData = factory.createSmlTemplateStringInner().apply { value = "test" }
            testData.toConstantExpressionOrNull() shouldBe SmlConstantString("test")
        }

        @Test
        fun `should return value of template string end`() {
            val testData = factory.createSmlTemplateStringEnd().apply { value = "test" }
            testData.toConstantExpressionOrNull() shouldBe SmlConstantString("test")
        }

        @Test
        fun `toConstantExpression should return null for block lambda`() {
            val testData = createSmlBlockLambda()
            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `simplify should return null for impure block lambda`() {
            impureBlockLambda.simplify(emptyMap()).shouldBeNull()
        }

        @Test
        fun `simplify should return intermediate block lambda for pure block lambda`() {
            pureBlockLambda.simplify(emptyMap()).shouldBeInstanceOf<SmlIntermediateBlockLambda>()
        }

        @Test
        fun `simplify should return null for block lambda with recursive call`() {
            recursiveBlockLambda.simplify(emptyMap()).shouldBeNull()
        }

        @Test
        fun `toConstantExpression should return null for expression lambda`() {
            val testData = createSmlExpressionLambda(result = createSmlNull())
            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `simplify should return null for impure expression lambda`() {
            impureExpressionLambda.simplify(emptyMap()).shouldBeNull()
        }

        @Test
        fun `simplify should return intermediate expression lambda for pure expression lambda`() {
            pureExpressionLambda.simplify(emptyMap()).shouldBeInstanceOf<SmlIntermediateExpressionLambda>()
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
            val testData = createSmlArgument(value = createSmlNull())
            testData.toConstantExpressionOrNull() shouldBe SmlConstantNull
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
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(leftOperand),
                    operator = SmlInfixOperationOperator.Or,
                    rightOperand = createSmlBoolean(rightOperand)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(expected)
            }

            @Test
            fun `should return null if the left operand is not a constant boolean`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlNull(),
                    operator = SmlInfixOperationOperator.Or,
                    rightOperand = createSmlBoolean(true)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant boolean`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.Or,
                    rightOperand = createSmlNull()
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
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(leftOperand),
                    operator = SmlInfixOperationOperator.And,
                    rightOperand = createSmlBoolean(rightOperand)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(expected)
            }

            @Test
            fun `should return null if the left operand is not a constant boolean`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlNull(),
                    operator = SmlInfixOperationOperator.And,
                    rightOperand = createSmlBoolean(true)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant boolean`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.And,
                    rightOperand = createSmlNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class Equals {

            @Test
            fun `should return true boolean literal if left and right operands are equal`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.Equals,
                    rightOperand = createSmlBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(true)
            }

            @Test
            fun `should return false boolean literal if left and right operands are not equal`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.Equals,
                    rightOperand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(false)
            }

            @Test
            fun `should return null if the left operand is not a constant expression`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlCall(
                        receiver = createSmlNull()
                    ),
                    operator = SmlInfixOperationOperator.Equals,
                    rightOperand = createSmlBoolean(true)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant expression`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.Equals,
                    rightOperand = createSmlCall(
                        receiver = createSmlNull()
                    )
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class NotEquals {

            @Test
            fun `should return true boolean literal if left and right operands are not equal`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.NotEquals,
                    rightOperand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(true)
            }

            @Test
            fun `should return false boolean literal if left and right operands are equal`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.NotEquals,
                    rightOperand = createSmlBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(false)
            }

            @Test
            fun `should return null if the left operand is not a constant expression`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlCall(
                        receiver = createSmlNull()
                    ),
                    operator = SmlInfixOperationOperator.NotEquals,
                    rightOperand = createSmlBoolean(true)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant expression`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.NotEquals,
                    rightOperand = createSmlCall(
                        receiver = createSmlNull()
                    )
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class IdenticalTo {

            @Test
            fun `should return true boolean literal if left and right operands are identical`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.IdenticalTo,
                    rightOperand = createSmlBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(true)
            }

            @Test
            fun `should return false boolean literal if left and right operands are not identical`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.IdenticalTo,
                    rightOperand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(false)
            }

            @Test
            fun `should return null if the left operand is not a constant expression`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlCall(
                        receiver = createSmlNull()
                    ),
                    operator = SmlInfixOperationOperator.IdenticalTo,
                    rightOperand = createSmlBoolean(true)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant expression`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.IdenticalTo,
                    rightOperand = createSmlCall(
                        receiver = createSmlNull()
                    )
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class NotIdenticalTo {

            @Test
            fun `should return true boolean literal if left and right operands are not identical`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.NotIdenticalTo,
                    rightOperand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(true)
            }

            @Test
            fun `should return false boolean literal if left and right operands are identical`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.NotIdenticalTo,
                    rightOperand = createSmlBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(false)
            }

            @Test
            fun `should return null if the left operand is not a constant expression`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlCall(
                        receiver = createSmlNull()
                    ),
                    operator = SmlInfixOperationOperator.NotIdenticalTo,
                    rightOperand = createSmlBoolean(true)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant expression`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.NotIdenticalTo,
                    rightOperand = createSmlCall(
                        receiver = createSmlNull()
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
                val testData = createSmlInfixOperation(
                    leftOperand = leftOperand.toSmlNumber(),
                    operator = SmlInfixOperationOperator.LessThan,
                    rightOperand = rightOperand.toSmlNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(expected)
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlNull(),
                    operator = SmlInfixOperationOperator.LessThan,
                    rightOperand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlInt(1),
                    operator = SmlInfixOperationOperator.LessThan,
                    rightOperand = createSmlNull()
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
                val testData = createSmlInfixOperation(
                    leftOperand = leftOperand.toSmlNumber(),
                    operator = SmlInfixOperationOperator.LessThanOrEquals,
                    rightOperand = rightOperand.toSmlNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(expected)
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlNull(),
                    operator = SmlInfixOperationOperator.LessThanOrEquals,
                    rightOperand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlInt(1),
                    operator = SmlInfixOperationOperator.LessThanOrEquals,
                    rightOperand = createSmlNull()
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
                val testData = createSmlInfixOperation(
                    leftOperand = leftOperand.toSmlNumber(),
                    operator = SmlInfixOperationOperator.GreaterThanOrEquals,
                    rightOperand = rightOperand.toSmlNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(expected)
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlNull(),
                    operator = SmlInfixOperationOperator.GreaterThanOrEquals,
                    rightOperand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlInt(1),
                    operator = SmlInfixOperationOperator.GreaterThanOrEquals,
                    rightOperand = createSmlNull()
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
                val testData = createSmlInfixOperation(
                    leftOperand = leftOperand.toSmlNumber(),
                    operator = SmlInfixOperationOperator.GreaterThan,
                    rightOperand = rightOperand.toSmlNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(expected)
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlNull(),
                    operator = SmlInfixOperationOperator.GreaterThan,
                    rightOperand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlInt(1),
                    operator = SmlInfixOperationOperator.GreaterThan,
                    rightOperand = createSmlNull()
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
                val testData = createSmlInfixOperation(
                    leftOperand = leftOperand.toSmlNumber(),
                    operator = SmlInfixOperationOperator.Plus,
                    rightOperand = rightOperand.toSmlNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe expected.toSmlNumber().toConstantExpressionOrNull()
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlNull(),
                    operator = SmlInfixOperationOperator.Plus,
                    rightOperand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlInt(1),
                    operator = SmlInfixOperationOperator.Plus,
                    rightOperand = createSmlNull()
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
                val testData = createSmlInfixOperation(
                    leftOperand = leftOperand.toSmlNumber(),
                    operator = SmlInfixOperationOperator.Minus,
                    rightOperand = rightOperand.toSmlNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe expected.toSmlNumber().toConstantExpressionOrNull()
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlNull(),
                    operator = SmlInfixOperationOperator.Minus,
                    rightOperand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlInt(1),
                    operator = SmlInfixOperationOperator.Minus,
                    rightOperand = createSmlNull()
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
                val testData = createSmlInfixOperation(
                    leftOperand = leftOperand.toSmlNumber(),
                    operator = SmlInfixOperationOperator.Times,
                    rightOperand = rightOperand.toSmlNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe expected.toSmlNumber().toConstantExpressionOrNull()
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlNull(),
                    operator = SmlInfixOperationOperator.Times,
                    rightOperand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlInt(1),
                    operator = SmlInfixOperationOperator.Times,
                    rightOperand = createSmlNull()
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
                val testData = createSmlInfixOperation(
                    leftOperand = leftOperand.toSmlNumber(),
                    operator = SmlInfixOperationOperator.By,
                    rightOperand = rightOperand.toSmlNumber()
                )

                testData.toConstantExpressionOrNull() shouldBe expected.toSmlNumber().toConstantExpressionOrNull()
            }

            @Test
            fun `should return null if the left operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlNull(),
                    operator = SmlInfixOperationOperator.By,
                    rightOperand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant number`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlInt(1),
                    operator = SmlInfixOperationOperator.By,
                    rightOperand = createSmlNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is constant integer 0`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlInt(1),
                    operator = SmlInfixOperationOperator.By,
                    rightOperand = createSmlInt(0)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is constant float 0`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlInt(1),
                    operator = SmlInfixOperationOperator.By,
                    rightOperand = createSmlFloat(0.0)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is constant float -0`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlInt(1),
                    operator = SmlInfixOperationOperator.By,
                    rightOperand = createSmlFloat(-0.0)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class Elvis {

            @Test
            fun `should return left operand if it does not evaluate to a constant null`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlBoolean(true),
                    operator = SmlInfixOperationOperator.Elvis,
                    rightOperand = createSmlBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(true)
            }

            @Test
            fun `should return right operand if the left operand evaluates to a constant null`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlNull(),
                    operator = SmlInfixOperationOperator.Elvis,
                    rightOperand = createSmlBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(true)
            }

            @Test
            fun `should return null if the left operand is not a constant expression`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlCall(
                        receiver = createSmlNull()
                    ),
                    operator = SmlInfixOperationOperator.Elvis,
                    rightOperand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }

            @Test
            fun `should return null if the right operand is not a constant expression`() {
                val testData = createSmlInfixOperation(
                    leftOperand = createSmlInt(1),
                    operator = SmlInfixOperationOperator.Elvis,
                    rightOperand = createSmlCall(
                        receiver = createSmlNull()
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
            val testData = createSmlParenthesizedExpression(createSmlNull())
            testData.toConstantExpressionOrNull() shouldBe SmlConstantNull
        }
    }

    @Nested
    inner class PrefixOperation {

        @Nested
        inner class Not {

            @Test
            fun `should return negated operand if it is a constant boolean`() {
                val testData = createSmlPrefixOperation(
                    operator = SmlPrefixOperationOperator.Not,
                    operand = createSmlBoolean(true)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantBoolean(false)
            }

            @Test
            fun `should return null if the operand is not a constant boolean`() {
                val testData = createSmlPrefixOperation(
                    operator = SmlPrefixOperationOperator.Not,
                    operand = createSmlNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }

        @Nested
        inner class Minus {

            @Test
            fun `should return negated operand if it is a constant float`() {
                val testData = createSmlPrefixOperation(
                    operator = SmlPrefixOperationOperator.Minus,
                    operand = createSmlFloat(1.0)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantFloat(-1.0)
            }

            @Test
            fun `should return negated operand if it is a constant int`() {
                val testData = createSmlPrefixOperation(
                    operator = SmlPrefixOperationOperator.Minus,
                    operand = createSmlInt(1)
                )

                testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(-1)
            }

            @Test
            fun `should return null if the operand is not a constant number`() {
                val testData = createSmlPrefixOperation(
                    operator = SmlPrefixOperationOperator.Minus,
                    operand = createSmlNull()
                )

                testData.toConstantExpressionOrNull().shouldBeNull()
            }
        }
    }

    @Nested
    inner class TemplateString {

        @Test
        fun `should return concatenated string`() {
            val testData = createSmlTemplateString(
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
                    createSmlBoolean(true),
                    createSmlFloat(1.0),
                    createSmlInt(1),
                    createSmlNull(),
                    createSmlString("string"),
                    createSmlReference(createSmlEnumVariant("Variant"))
                )
            )

            testData.toConstantExpressionOrNull() shouldBe SmlConstantString(
                value = "start true inner1 1.0 inner2 1 inner3 null inner4 string inner5 Variant end"
            )
        }

        @Test
        fun `should return null if any expression is converted to null`() {
            val testData = createSmlTemplateString(
                stringParts = listOf("start ", " end"),
                templateExpressions = listOf(
                    createSmlCall(receiver = createSmlNull())
                )
            )

            testData.toConstantExpressionOrNull().shouldBeNull()
        }
    }

    @Nested
    inner class Call {

        private lateinit var compilationUnit: SmlCompilationUnit

        @BeforeEach
        fun reset() {
            compilationUnit = parseHelper.parseResource("partialEvaluation/calls.smltest")!!
        }

        @Test
        fun `should evaluate calls of block lambdas`() {
            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>("callToBlockLambda")
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(1)
        }

        @Test
        fun `should evaluate calls of expression lambdas`() {
            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>("callToExpressionLambda")
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(1)
        }

        @Test
        fun `should evaluate calls of steps`() {
            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>("callToStep")
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(1)
        }

        @Test
        fun `should evaluate calls of steps with variadic parameter`() {
            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>("callToStepWithVariadicParameter")
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `should evaluate calls of steps with indexed variadic parameter`() {
            val workflow = compilationUnit
                .findUniqueDeclarationOrFail<SmlWorkflow>("callToStepWithIndexedVariadicParameter")
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(1)
        }

        @Test
        fun `should substitute parameters that were bound at call of a lambda`() {
            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>(
                "parameterAssignedDuringCall"
            )
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(10)
        }

        @Test
        fun `should substitute parameters that were bound at creation of a lambda`() {
            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>(
                "parameterAssignedDuringCreationOfLambda"
            )
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(1)
        }

        @Test
        fun `should evaluate calls with lambda as parameter`() {
            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>("lambdaAsParameter")
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(1)
        }

        @Test
        fun `should return null otherwise`() {
            val testData = createSmlCall(receiver = createSmlNull())
            testData.toConstantExpressionOrNull().shouldBeNull()
        }
    }

    @Nested
    inner class MemberAccess {

        @Test
        fun `should return constant enum variant if referenced enum variant has no parameters`() {
            val testEnumVariant = createSmlEnumVariant(name = "TestEnumVariant")
            val testEnum = createSmlEnum(
                name = "TestEnum",
                variants = listOf(testEnumVariant)
            )
            val testData = createSmlMemberAccess(
                receiver = createSmlReference(testEnum),
                member = createSmlReference(testEnumVariant)
            )

            testData.toConstantExpressionOrNull() shouldBe SmlConstantEnumVariant(testEnumVariant)
        }

        @Test
        fun `should return null if referenced enum variant has parameters`() {
            val testEnumVariant = createSmlEnumVariant(
                name = "TestEnumVariant",
                parameters = listOf(
                    createSmlParameter(name = "testParameter")
                )
            )
            val testEnum = createSmlEnum(
                name = "TestEnum",
                variants = listOf(testEnumVariant)
            )
            val testData = createSmlMemberAccess(
                receiver = createSmlReference(testEnum),
                member = createSmlReference(testEnumVariant)
            )

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `should return constant null if receiver is constant null and member access is null safe`() {
            val testData = createSmlMemberAccess(
                receiver = createSmlNull(),
                member = createSmlReference(createSmlAttribute("testAttribute")),
                isNullSafe = true
            )

            testData.toConstantExpressionOrNull() shouldBe SmlConstantNull
        }

        @Test
        fun `should return null if receiver is constant null and member access is not null safe`() {
            val testData = createSmlMemberAccess(
                receiver = createSmlNull(),
                member = createSmlReference(createSmlAttribute("testAttribute"))
            )

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `should access the result of a call by name if result exists`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/memberAccesses.smltest")
            compilationUnit.shouldNotBeNull()

            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>("successfulResultAccess")
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(1)
        }

        @Test
        fun `should return null if accessed result does not exist`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/memberAccesses.smltest")
            compilationUnit.shouldNotBeNull()

            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>("failedResultAccess")
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `should return null for other receivers`() {
            val testData = createSmlMemberAccess(
                receiver = createSmlInt(1),
                member = createSmlReference(
                    createSmlEnumVariant(
                        name = "TestEnumVariant",
                        parameters = listOf(
                            createSmlParameter(name = "testParameter")
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
            val testEnumVariant = createSmlEnumVariant(name = "TestEnumVariant")
            val testData = createSmlReference(
                declaration = testEnumVariant
            )

            testData.toConstantExpressionOrNull() shouldBe SmlConstantEnumVariant(testEnumVariant)
        }

        @Test
        fun `should return null if referenced enum variant has parameters`() {
            val testEnumVariant = createSmlEnumVariant(
                name = "TestEnumVariant",
                parameters = listOf(
                    createSmlParameter(name = "testParameter")
                )
            )
            val testData = createSmlReference(
                declaration = testEnumVariant
            )

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `should convert assigned value of referenced placeholder`() {
            val testPlaceholder = createSmlPlaceholder("testPlaceholder")
            createSmlAssignment(
                assignees = listOf(testPlaceholder),
                createSmlNull()
            )
            val testData = createSmlReference(
                declaration = testPlaceholder
            )

            testData.toConstantExpressionOrNull() shouldBe SmlConstantNull
        }

        @Test
        fun `should return null if referenced placeholder has no assigned value`() {
            val testData = createSmlReference(
                declaration = createSmlPlaceholder("testPlaceholder")
            )

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `simplify should return substituted value if it exists`() {
            val testParameter = createSmlParameter("testParameter")
            val testData = createSmlReference(
                declaration = testParameter
            )

            testData.simplify(mapOf(testParameter to SmlConstantNull)) shouldBe SmlConstantNull
        }

        @Test
        fun `simplify should return default value if referenced parameter is not substituted but optional`() {
            val testParameter = createSmlParameter(
                name = "testParameter",
                defaultValue = createSmlNull()
            )
            val testData = createSmlReference(
                declaration = testParameter
            )

            testData.simplify(emptyMap()) shouldBe SmlConstantNull
        }

        @Test
        fun `simplify should return null if referenced parameter is required and not substituted`() {
            val testParameter = createSmlParameter("testParameter")
            val testData = createSmlReference(
                declaration = testParameter
            )

            testData.simplify(emptyMap()).shouldBeNull()
        }

        @Test
        fun `toConstantExpression should return null if step is referenced`() {
            val testData = createSmlReference(createSmlStep("testStep"))
            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `simplify should return null if referenced step is impure`() {
            val testData = createSmlReference(impureStep)
            testData.simplify(emptyMap()).shouldBeNull()
        }

        @Test
        fun `simplify should return intermediate step if referenced step is pure`() {
            val testData = createSmlReference(pureStep)
            testData.simplify(emptyMap()).shouldBeInstanceOf<SmlIntermediateStep>()
        }

        @Test
        fun `simplify should return null if referenced step has recursive calls`() {
            val testData = createSmlReference(recursiveStep)
            testData.simplify(emptyMap()).shouldBeNull()
        }

        @Test
        fun `should return value of placeholders inside valid assignment with call as expression`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/references.smltest")
            compilationUnit.shouldNotBeNull()

            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>("successfulRecordAssignment")
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(1)
        }

        @Test
        fun `should return null for references to placeholders inside invalid assignment with call as expression`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/references.smltest")
            compilationUnit.shouldNotBeNull()

            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>("failedRecordAssignment")
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull().shouldBeNull()
        }

        @Test
        fun `should evaluate references to placeholders (assigned, called step has different yield order)`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/references.smltest")
            compilationUnit.shouldNotBeNull()

            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>(
                "recordAssignmentWithDifferentYieldOrder"
            )
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(1)
        }

        @Test
        fun `should evaluate references to placeholders (assigned, called step has missing yield)`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/references.smltest")
            compilationUnit.shouldNotBeNull()

            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>("recordAssignmentWithMissingYield")
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(1)
        }

        @Test
        fun `should evaluate references to placeholders (assigned, called step has additional yield)`() {
            val compilationUnit =
                parseHelper.parseResource("partialEvaluation/references.smltest")
            compilationUnit.shouldNotBeNull()

            val workflow = compilationUnit.findUniqueDeclarationOrFail<SmlWorkflow>(
                "recordAssignmentWithAdditionalYield"
            )
            val testData = workflow.expectedExpression()

            testData.toConstantExpressionOrNull() shouldBe SmlConstantInt(1)
        }

        @Test
        fun `should return null for other declarations`() {
            val testData = createSmlReference(
                declaration = createSmlAnnotation("TestAnnotation")
            )

            testData.toConstantExpressionOrNull().shouldBeNull()
        }
    }
}

private fun Double.toSmlNumber(): SmlAbstractExpression {
    return when {
        this == this.toInt().toDouble() -> createSmlInt(this.toInt())
        else -> createSmlFloat(this)
    }
}

/**
 * Helper method for tests loaded from a resource that returns the expression of the first expression statement in the
 * workflow.
 */
private fun SmlWorkflow.expectedExpression() = statementsOrEmpty()
    .filterIsInstance<SmlExpressionStatement>()
    .firstOrNull()
    .shouldNotBeNull()
    .expression
