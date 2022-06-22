package com.larsreimann.safeds.staticAnalysis.schema

import com.google.inject.Inject
import com.larsreimann.safeds.constant.SdsFileExtension
import com.larsreimann.safeds.emf.createSdsCompilationUnit
import com.larsreimann.safeds.emf.createSdsDummyResource
import com.larsreimann.safeds.serializer.SerializationResult
import com.larsreimann.safeds.serializer.serializeToFormattedString
import com.larsreimann.safeds.testing.ParseHelper
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
import com.larsreimann.safeds.testing.getResourcePath
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(InjectionExtension::class)
@InjectWith(SafeDSInjectorProvider::class)
class SchemaInferenceTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    private val expectedSchema = """
        |package test
        |
        |schema TestSchema {
        |    "PassengerId" : Int?,
        |    "Survived" : Int?,
        |    "Pclass" : Int?,
        |    "Name" : String?,
        |    "Sex" : String?,
        |    "Age" : Float?,
        |    "SibSp" : Int?,
        |    "Parch" : Int?,
        |    "Ticket" : String?,
        |    "Fare" : Float?,
        |    "Cabin" : String?,
        |    "Embarked" : String?
        |}
    """.trimMargin()

    @Test
    fun test() {
        val context = parseHelper.parseProgramText("package test")
        context.shouldNotBeNull()

        val csvPath = javaClass.classLoader.getResourcePath("schema/testDataset.csv").toString()
        val schema = inferSchema(context, "TestSchema", csvPath)

        schema.shouldNotBeNull()

        val compilationUnit = createSdsCompilationUnit(packageName = "test", members = listOf(schema))
        createSdsDummyResource("test", SdsFileExtension.Schema, compilationUnit)

        val result = compilationUnit.serializeToFormattedString()
        result.shouldBeInstanceOf<SerializationResult.Success>()

        result.code.shouldBe(expectedSchema)
    }
}
