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
import com.larsreimann.safeds.utils.ExperimentalSdsApi
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(InjectionExtension::class)
@InjectWith(SafeDSInjectorProvider::class)
class InitialSchemaInferenceTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    private val expectedSchema = """
        |package test
        |
        |schema dummyData {
        |    "Column0" : Int?,
        |    "Column1" : Int?,
        |    "Column2" : Int?,
        |    "Column3" : String?,
        |    "Column4" : String?,
        |    "Column5" : Int?,
        |    "Column6" : Int?,
        |    "Column7" : Int?,
        |    "Column8" : String?,
        |    "Column9" : Float?,
        |    "Column10" : String?,
        |    "Column11" : String?
        |}
    """.trimMargin()

    @Test
    @OptIn(ExperimentalSdsApi::class)
    fun inferInitialSchema() {
        val context = parseHelper.parseProgramText("package test")
        context.shouldNotBeNull()

        val csvPath = javaClass.classLoader.getResourcePath("schema/dummyData.csv")
        csvPath.shouldNotBeNull()

        val schema = inferInitialSchema(context, csvPath)
        schema.shouldNotBeNull()

        val compilationUnit = createSdsCompilationUnit(packageName = "test", members = listOf(schema))
        createSdsDummyResource("test", SdsFileExtension.Schema, compilationUnit)

        val result = compilationUnit.serializeToFormattedString()
        result.shouldBeInstanceOf<SerializationResult.Success>()

        result.code.shouldBe(expectedSchema)
    }
}
