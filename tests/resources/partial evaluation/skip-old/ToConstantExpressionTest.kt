//@ExtendWith(InjectionExtension::class)
//@InjectWith(SafeDSInjectorProvider::class)
//class ToConstantExpressionTest {
//
//    @Inject
//    private lateinit var parseHelper: ParseHelper
//
//    private val factory = SafeDSFactory.eINSTANCE
//
//    private lateinit var impureBlockLambda: SdsBlockLambda
//    private lateinit var pureBlockLambda: SdsBlockLambda
//    private lateinit var recursiveBlockLambda: SdsBlockLambda
//    private lateinit var impureExpressionLambda: SdsExpressionLambda
//    private lateinit var pureExpressionLambda: SdsExpressionLambda
//    private lateinit var recursiveExpressionLambda: SdsExpressionLambda
//    private lateinit var impureStep: SdsStep
//    private lateinit var pureStep: SdsStep
//    private lateinit var recursiveStep: SdsStep
//
//    @BeforeEach
//    fun reset() {
//        val compilationUnit = parseHelper.parseResource("partialEvaluation/callables.sdstest")
//        compilationUnit.shouldNotBeNull()
//
//        val blockLambdas = compilationUnit.descendants<SdsBlockLambda>().toList()
//        blockLambdas.shouldHaveSize(3)
//
//        impureBlockLambda = blockLambdas[0]
//        pureBlockLambda = blockLambdas[1]
//        recursiveBlockLambda = blockLambdas[2]
//
//        val expressionLambdas = compilationUnit.descendants<SdsExpressionLambda>().toList()
//        expressionLambdas.shouldHaveSize(3)
//
//        impureExpressionLambda = expressionLambdas[0]
//        pureExpressionLambda = expressionLambdas[1]
//        recursiveExpressionLambda = expressionLambdas[2]
//
//        impureStep = compilationUnit.findUniqueDeclarationOrFail("impureStep")
//        pureStep = compilationUnit.findUniqueDeclarationOrFail("pureStep")
//        recursiveStep = compilationUnit.findUniqueDeclarationOrFail("recursiveStep")
//    }
//
//    @Nested
//    inner class BaseCases {
//
//        @Test
//        fun `toConstantExpression should return null for block lambda`() {
//            val testData = createSdsBlockLambda()
//            testData.toConstantExpressionOrNull().shouldBeNull()
//        }
//
//        @Test
//        fun `simplify should return null for impure block lambda`() {
//            impureBlockLambda.simplify(emptyMap()).shouldBeNull()
//        }
//
//        @Test
//        fun `simplify should return intermediate block lambda for pure block lambda`() {
//            pureBlockLambda.simplify(emptyMap()).shouldBeInstanceOf<SdsIntermediateBlockLambda>()
//        }
//
//        @Test
//        fun `simplify should return null for block lambda with recursive call`() {
//            recursiveBlockLambda.simplify(emptyMap()).shouldBeNull()
//        }
//
//        @Test
//        fun `toConstantExpression should return null for expression lambda`() {
//            val testData = createSdsExpressionLambda(result = createSdsNull())
//            testData.toConstantExpressionOrNull().shouldBeNull()
//        }
//
//        @Test
//        fun `simplify should return null for impure expression lambda`() {
//            impureExpressionLambda.simplify(emptyMap()).shouldBeNull()
//        }
//
//        @Test
//        fun `simplify should return intermediate expression lambda for pure expression lambda`() {
//            pureExpressionLambda.simplify(emptyMap()).shouldBeInstanceOf<SdsIntermediateExpressionLambda>()
//        }
//
//        @Test
//        fun `simplify should return null for expression lambda with recursive call`() {
//            recursiveExpressionLambda.simplify(emptyMap()).shouldBeNull()
//        }
//    }

//    @Nested
//    inner class Call {
//
//        private lateinit var compilationUnit: SdsCompilationUnit
//
//        @BeforeEach
//        fun reset() {
//            compilationUnit = parseHelper.parseResource("partialEvaluation/calls.sdstest")!!
//        }
//
//        @Test
//        fun `should evaluate calls of block lambdas`() {
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("callToBlockLambda")
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
//        }
//
//        @Test
//        fun `should evaluate calls of expression lambdas`() {
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("callToExpressionLambda")
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
//        }
//
//        @Test
//        fun `should evaluate calls of steps`() {
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("callToStep")
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
//        }
//
//        @Test
//        fun `should evaluate calls of steps with variadic parameter`() {
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("callToStepWithVariadicParameter")
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull().shouldBeNull()
//        }
//
//        @Test
//        fun `should evaluate calls of steps with indexed variadic parameter`() {
//            val pipeline = compilationUnit
//                .findUniqueDeclarationOrFail<SdsPipeline>("callToStepWithIndexedVariadicParameter")
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
//        }
//
//        @Test
//        fun `should substitute parameters that were bound at call of a lambda`() {
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>(
//                "parameterAssignedDuringCall",
//            )
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(10)
//        }
//
//        @Test
//        fun `should substitute parameters that were bound at creation of a lambda`() {
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>(
//                "parameterAssignedDuringCreationOfLambda",
//            )
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
//        }
//
//        @Test
//        fun `should evaluate calls with lambda as parameter`() {
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("lambdaAsParameter")
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
//        }
//
//        @Test
//        fun `should return null otherwise`() {
//            val testData = createSdsCall(receiver = createSdsNull())
//            testData.toConstantExpressionOrNull().shouldBeNull()
//        }
//    }
//
//    @Nested
//    inner class MemberAccess {
//        @Test
//        fun `should return constant null if receiver is constant null and member access is null safe`() {
//            val testData = createSdsMemberAccess(
//                receiver = createSdsNull(),
//                member = createSdsReference(createSdsAttribute("testAttribute")),
//                isNullSafe = true,
//            )
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantNull
//        }
//
//        @Test
//        fun `should return null if receiver is constant null and member access is not null safe`() {
//            val testData = createSdsMemberAccess(
//                receiver = createSdsNull(),
//                member = createSdsReference(createSdsAttribute("testAttribute")),
//            )
//
//            testData.toConstantExpressionOrNull().shouldBeNull()
//        }
//
//        @Test
//        fun `should access the result of a call by name if result exists`() {
//            val compilationUnit =
//                parseHelper.parseResource("partialEvaluation/memberAccesses.sdstest")
//            compilationUnit.shouldNotBeNull()
//
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("successfulResultAccess")
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
//        }
//
//        @Test
//        fun `should return null if accessed result does not exist`() {
//            val compilationUnit =
//                parseHelper.parseResource("partialEvaluation/memberAccesses.sdstest")
//            compilationUnit.shouldNotBeNull()
//
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("failedResultAccess")
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull().shouldBeNull()
//        }
//
//        @Test
//        fun `should return null for other receivers`() {
//            val testData = createSdsMemberAccess(
//                receiver = createSdsInt(1),
//                member = createSdsReference(
//                    createSdsEnumVariant(
//                        name = "TestEnumVariant",
//                        parameters = listOf(
//                            createSdsParameter(name = "testParameter"),
//                        ),
//                    ),
//                ),
//            )
//
//            testData.toConstantExpressionOrNull().shouldBeNull()
//        }
//    }
//
//    @Nested
//    inner class Reference {
//        @Test
//        fun `should convert assigned value of referenced placeholder`() {
//            val testPlaceholder = createSdsPlaceholder("testPlaceholder")
//            createSdsAssignment(
//                assignees = listOf(testPlaceholder),
//                createSdsNull(),
//            )
//            val testData = createSdsReference(
//                declaration = testPlaceholder,
//            )
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantNull
//        }
//
//        @Test
//        fun `should return null if referenced placeholder has no assigned value`() {
//            val testData = createSdsReference(
//                declaration = createSdsPlaceholder("testPlaceholder"),
//            )
//
//            testData.toConstantExpressionOrNull().shouldBeNull()
//        }
//
//        @Test
//        fun `simplify should return substituted value if it exists`() {
//            val testParameter = createSdsParameter("testParameter")
//            val testData = createSdsReference(
//                declaration = testParameter,
//            )
//
//            testData.simplify(mapOf(testParameter to SdsConstantNull)) shouldBe SdsConstantNull
//        }
//
//        @Test
//        fun `simplify should return default value if referenced parameter is not substituted but optional`() {
//            val testParameter = createSdsParameter(
//                name = "testParameter",
//                defaultValue = createSdsNull(),
//            )
//            val testData = createSdsReference(
//                declaration = testParameter,
//            )
//
//            testData.simplify(emptyMap()) shouldBe SdsConstantNull
//        }
//
//        @Test
//        fun `simplify should return null if referenced parameter is required and not substituted`() {
//            val testParameter = createSdsParameter("testParameter")
//            val testData = createSdsReference(
//                declaration = testParameter,
//            )
//
//            testData.simplify(emptyMap()).shouldBeNull()
//        }
//
//        @Test
//        fun `toConstantExpression should return null if step is referenced`() {
//            val testData = createSdsReference(createSdsStep("testStep"))
//            testData.toConstantExpressionOrNull().shouldBeNull()
//        }
//
//        @Test
//        fun `simplify should return null if referenced step is impure`() {
//            val testData = createSdsReference(impureStep)
//            testData.simplify(emptyMap()).shouldBeNull()
//        }
//
//        @Test
//        fun `simplify should return intermediate step if referenced step is pure`() {
//            val testData = createSdsReference(pureStep)
//            testData.simplify(emptyMap()).shouldBeInstanceOf<SdsIntermediateStep>()
//        }
//
//        @Test
//        fun `simplify should return null if referenced step has recursive calls`() {
//            val testData = createSdsReference(recursiveStep)
//            testData.simplify(emptyMap()).shouldBeNull()
//        }
//
//        @Test
//        fun `should return value of placeholders inside valid assignment with call as expression`() {
//            val compilationUnit =
//                parseHelper.parseResource("partialEvaluation/references.sdstest")
//            compilationUnit.shouldNotBeNull()
//
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("successfulRecordAssignment")
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
//        }
//
//        @Test
//        fun `should return null for references to placeholders inside invalid assignment with call as expression`() {
//            val compilationUnit =
//                parseHelper.parseResource("partialEvaluation/references.sdstest")
//            compilationUnit.shouldNotBeNull()
//
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("failedRecordAssignment")
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull().shouldBeNull()
//        }
//
//        @Test
//        fun `should evaluate references to placeholders (assigned, called step has different yield order)`() {
//            val compilationUnit =
//                parseHelper.parseResource("partialEvaluation/references.sdstest")
//            compilationUnit.shouldNotBeNull()
//
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>(
//                "recordAssignmentWithDifferentYieldOrder",
//            )
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
//        }
//
//        @Test
//        fun `should evaluate references to placeholders (assigned, called step has missing yield)`() {
//            val compilationUnit =
//                parseHelper.parseResource("partialEvaluation/references.sdstest")
//            compilationUnit.shouldNotBeNull()
//
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>("recordAssignmentWithMissingYield")
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
//        }
//
//        @Test
//        fun `should evaluate references to placeholders (assigned, called step has additional yield)`() {
//            val compilationUnit =
//                parseHelper.parseResource("partialEvaluation/references.sdstest")
//            compilationUnit.shouldNotBeNull()
//
//            val pipeline = compilationUnit.findUniqueDeclarationOrFail<SdsPipeline>(
//                "recordAssignmentWithAdditionalYield",
//            )
//            val testData = pipeline.expectedExpression()
//
//            testData.toConstantExpressionOrNull() shouldBe SdsConstantInt(1)
//        }
//
//        @Test
//        fun `should return null for other declarations`() {
//            val testData = createSdsReference(
//                declaration = createSdsAnnotation("TestAnnotation"),
//            )
//
//            testData.toConstantExpressionOrNull().shouldBeNull()
//        }
//    }
//}
//
//private fun Double.toSdsNumber(): SdsAbstractExpression {
//    return when {
//        this == this.toInt().toDouble() -> createSdsInt(this.toInt())
//        else -> createSdsFloat(this)
//    }
//}
//
///**
// * Helper method for tests loaded from a resource that returns the expression of the first expression statement in the
// * pipeline.
// */
//private fun SdsPipeline.expectedExpression() = statementsOrEmpty()
//    .filterIsInstance<SdsExpressionStatement>()
//    .firstOrNull()
//    .shouldNotBeNull()
//    .expression
