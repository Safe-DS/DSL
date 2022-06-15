@file:Suppress("ClassName")

package com.larsreimann.safeds.naming

import com.larsreimann.safeds.emf.createSdsClass
import com.larsreimann.safeds.emf.createSdsCompilationUnit
import com.larsreimann.safeds.testing.SafeDSInjectorProvider
import io.kotest.matchers.shouldBe
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

@ExtendWith(InjectionExtension::class)
@InjectWith(SafeDSInjectorProvider::class)
class QualifiedNameProviderTest {

    @Nested
    inner class QualifiedNameOrNull {

        @Test
        fun `should handle declarations with simple names`() {
            val myClass = createSdsClass(name = "MyClass")
            createSdsCompilationUnit(packageName = "tests", members = listOf(myClass))

            myClass.qualifiedNameOrNull() shouldBe "tests.MyClass".toQualifiedName()
        }

        @Test
        fun `should handle declarations with escaped names`() {
            val myClass = createSdsClass(name = "`MyClass`")
            createSdsCompilationUnit(packageName = "`tests`", members = listOf(myClass))

            myClass.qualifiedNameOrNull() shouldBe "`tests`.`MyClass`".toQualifiedName()
        }
    }

    @Nested
    inner class toQualifiedName {

        @Test
        fun `should convert string to qualified name`() {
            val qualifiedName = "tests.MyClass".toQualifiedName()

            qualifiedName.segmentCount shouldBe 2
            qualifiedName.getSegment(0) shouldBe "tests"
            qualifiedName.getSegment(1) shouldBe "MyClass"
        }
    }
}
