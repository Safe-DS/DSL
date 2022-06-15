package com.larsreimann.safeds.staticAnalysis.linking

import de.unibonn.simpleml.emf.createSmlCall
import de.unibonn.simpleml.emf.createSmlClass
import de.unibonn.simpleml.emf.createSmlFunction
import de.unibonn.simpleml.emf.createSmlNamedType
import de.unibonn.simpleml.emf.createSmlReference
import de.unibonn.simpleml.emf.createSmlStarProjection
import de.unibonn.simpleml.emf.createSmlTypeArgument
import de.unibonn.simpleml.emf.createSmlTypeArgumentList
import de.unibonn.simpleml.emf.createSmlTypeParameter
import de.unibonn.simpleml.emf.createSmlTypeParameterList
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsClass
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsNamedType
import com.larsreimann.safeds.safeDS.SdsTypeArgument
import com.larsreimann.safeds.safeDS.SdsTypeParameter
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class TypeArgumentToTypeParameterTest {
    private lateinit var typeParameter: SmlTypeParameter

    private lateinit var positionalTypeArgument: SmlTypeArgument
    private lateinit var namedTypeArgument: SmlTypeArgument

    private lateinit var function: SmlFunction
    private lateinit var call: SmlCall

    private lateinit var `class`: SmlClass
    private lateinit var namedType: SmlNamedType

    @BeforeEach
    fun reset() {
        typeParameter = createSmlTypeParameter(name = "T")

        positionalTypeArgument = createSmlTypeArgument(
            value = createSmlStarProjection()
        )
        namedTypeArgument = createSmlTypeArgument(
            value = createSmlStarProjection(),
            typeParameter = typeParameter,
        )

        function = createSmlFunction(name = "f")
        call = createSmlCall(
            createSmlReference(function)
        )

        `class` = createSmlClass(name = "C")
        namedType = createSmlNamedType(`class`)
    }

    @Nested
    inner class TypeParameterOrNull {

        @Test
        fun `should resolve type argument (positional, call, valid index)`() {
            function.typeParameterList = createSmlTypeParameterList(listOf(typeParameter))
            call.typeArgumentList = createSmlTypeArgumentList(listOf(positionalTypeArgument))

            positionalTypeArgument.typeParameterOrNull() shouldBe typeParameter
        }

        @Test
        fun `should resolve type argument (named, call, valid index)`() {
            function.typeParameterList = createSmlTypeParameterList(listOf(typeParameter))
            call.typeArgumentList = createSmlTypeArgumentList(listOf(namedTypeArgument))

            namedTypeArgument.typeParameterOrNull() shouldBe typeParameter
        }

        @Test
        fun `should resolve argument (positional, named type, valid index)`() {
            `class`.typeParameterList = createSmlTypeParameterList(listOf(typeParameter))
            namedType.typeArgumentList = createSmlTypeArgumentList(listOf(positionalTypeArgument))

            positionalTypeArgument.typeParameterOrNull() shouldBe typeParameter
        }

        @Test
        fun `should resolve argument (named, named type, valid index)`() {
            `class`.typeParameterList = createSmlTypeParameterList(listOf(typeParameter))
            namedType.typeArgumentList = createSmlTypeArgumentList(listOf(namedTypeArgument))

            namedTypeArgument.typeParameterOrNull() shouldBe typeParameter
        }

        @Test
        fun `should return null if named type arguments precede positional type argument (call)`() {
            function.typeParameterList = createSmlTypeParameterList(listOf(typeParameter))
            call.typeArgumentList = createSmlTypeArgumentList(listOf(namedTypeArgument, positionalTypeArgument))

            positionalTypeArgument.typeParameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if named type arguments precede positional type argument (named type)`() {
            `class`.typeParameterList = createSmlTypeParameterList(listOf(typeParameter))
            namedType.typeArgumentList = createSmlTypeArgumentList(listOf(namedTypeArgument, positionalTypeArgument))

            positionalTypeArgument.typeParameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if no matching type parameter exists (call)`() {
            call.typeArgumentList = createSmlTypeArgumentList(listOf(positionalTypeArgument))

            positionalTypeArgument.typeParameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if no matching type parameter exists (named type)`() {
            namedType.typeArgumentList = createSmlTypeArgumentList(listOf(positionalTypeArgument))

            positionalTypeArgument.typeParameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if type argument list cannot be matched to type parameter list`() {
            createSmlTypeArgumentList(listOf(positionalTypeArgument))

            positionalTypeArgument.typeParameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null for positional type arguments that are not in a type argument list`() {
            positionalTypeArgument.typeParameterOrNull().shouldBeNull()
        }
    }

    @Nested
    inner class TypeParametersOrNull {

        @Test
        fun `should resolve type argument list of call`() {
            function.typeParameterList = createSmlTypeParameterList(listOf(typeParameter))
            call.typeArgumentList = createSmlTypeArgumentList(listOf(positionalTypeArgument))

            call.typeArgumentList.typeParametersOrNull().shouldContainExactly(typeParameter)
        }

        @Test
        fun `should resolve type argument list of annotation call`() {
            `class`.typeParameterList = createSmlTypeParameterList(listOf(typeParameter))
            namedType.typeArgumentList = createSmlTypeArgumentList(listOf(positionalTypeArgument))

            namedType.typeArgumentList.typeParametersOrNull().shouldContainExactly(typeParameter)
        }

        @Test
        fun `should return null if the type argument list cannot be resolved`() {
            val typeArgumentList = createSmlTypeArgumentList(listOf(positionalTypeArgument))

            typeArgumentList.typeParametersOrNull().shouldBeNull()
        }
    }
}
