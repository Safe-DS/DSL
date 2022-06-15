@file:Suppress("ClassName")

package de.unibonn.simpleml.conversion

import com.google.inject.Inject
import de.unibonn.simpleml.constant.SmlFileExtension
import de.unibonn.simpleml.emf.createSmlDummyResource
import de.unibonn.simpleml.emf.createSmlInt
import de.unibonn.simpleml.emf.descendants
import de.unibonn.simpleml.emf.smlExpressionStatement
import de.unibonn.simpleml.emf.smlWorkflow
import de.unibonn.simpleml.serializer.SerializationResult
import de.unibonn.simpleml.serializer.serializeToFormattedString
import de.unibonn.simpleml.simpleML.SmlInt
import de.unibonn.simpleml.testing.ParseHelper
import de.unibonn.simpleml.testing.SimpleMLInjectorProvider
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.shouldBeInstanceOf
import org.eclipse.xtext.conversion.impl.INTValueConverter
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(InjectionExtension::class)
@InjectWith(SimpleMLInjectorProvider::class)
class SimpleMLINTValueConverterTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Inject
    private lateinit var intValueConverter: INTValueConverter

    @Nested
    inner class toValue {
        @Test
        fun `should convert string to int (direct converter call)`() {
            intValueConverter.toValue("1", null) shouldBe 1
        }

        @Test
        fun `should convert string to int (file)`() {
            val compilationUnit = parseHelper.parseResource(
                "conversion/intValueConverter.sdstest"
            ) // readProgramTextFromResource(resourceName)?.let { parseHelper.parse(it) }
            compilationUnit.shouldNotBeNull()

            val int = compilationUnit.descendants<SmlInt>().toList()
            int.shouldHaveSize(1)

            int[0].value shouldBe 1
        }
    }

    @Nested
    inner class toString {
        @Test
        fun `should convert int to string (direct converter call)`() {
            intValueConverter.toString(1) shouldBe "1"
        }

        @Test
        fun `should convert int to string (creator)`() {
            val int = createSmlInt(1)

            createSmlDummyResource(fileName = "test", SmlFileExtension.Test, packageName = "test") {
                smlWorkflow("test") {
                    smlExpressionStatement(int)
                }
            }

            val result = int.serializeToFormattedString()
            result.shouldBeInstanceOf<SerializationResult.Success>()
            result.code shouldBe "1"
        }
    }
}
