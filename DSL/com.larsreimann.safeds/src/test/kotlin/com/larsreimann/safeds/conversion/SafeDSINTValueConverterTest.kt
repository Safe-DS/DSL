@file:Suppress("ClassName")

package com.larsreimann.safeds.conversion

import com.google.inject.Inject
import com.larsreimann.safeds.constant.SdsFileExtension
import com.larsreimann.safeds.emf.createSdsDummyResource
import com.larsreimann.safeds.emf.createSdsInt
import com.larsreimann.safeds.emf.descendants
import com.larsreimann.safeds.emf.smlExpressionStatement
import com.larsreimann.safeds.emf.smlWorkflow
import com.larsreimann.safeds.serializer.SerializationResult
import com.larsreimann.safeds.serializer.serializeToFormattedString
import com.larsreimann.safeds.safeDS.SdsInt
import com.larsreimann.safeds.testing.ParseHelper
import com.larsreimann.safeds.testing.SimpleMLInjectorProvider
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
class SafeSDINTValueConverterTest {

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

            val int = compilationUnit.descendants<SdsInt>().toList()
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
            val int = createSdsInt(1)

            createSdsDummyResource(fileName = "test", SdsFileExtension.Test, packageName = "test") {
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
