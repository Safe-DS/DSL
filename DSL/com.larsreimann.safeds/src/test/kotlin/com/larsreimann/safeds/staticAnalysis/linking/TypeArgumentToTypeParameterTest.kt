package com.larsreimann.safeds.staticAnalysis.linking

import com.larsreimann.safeds.emf.createSdsCall
import com.larsreimann.safeds.emf.createSdsClass
import com.larsreimann.safeds.emf.createSdsFunction
import com.larsreimann.safeds.emf.createSdsNamedType
import com.larsreimann.safeds.emf.createSdsReference
import com.larsreimann.safeds.emf.createSdsStarProjection
import com.larsreimann.safeds.emf.createSdsTypeArgument
import com.larsreimann.safeds.emf.createSdsTypeArgumentList
import com.larsreimann.safeds.emf.createSdsTypeParameter
import com.larsreimann.safeds.emf.createSdsTypeParameterList
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
    private lateinit var typeParameter: SdsTypeParameter

    private lateinit var positionalTypeArgument: SdsTypeArgument
    private lateinit var namedTypeArgument: SdsTypeArgument

    private lateinit var function: SdsFunction
    private lateinit var call: SdsCall

    private lateinit var `class`: SdsClass
    private lateinit var namedType: SdsNamedType

    @BeforeEach
    fun reset() {
        typeParameter = createSdsTypeParameter(name = "T")

        positionalTypeArgument = createSdsTypeArgument(
            value = createSdsStarProjection()
        )
        namedTypeArgument = createSdsTypeArgument(
            value = createSdsStarProjection(),
            typeParameter = typeParameter,
        )

        function = createSdsFunction(name = "f")
        call = createSdsCall(
            createSdsReference(function)
        )

        `class` = createSdsClass(name = "C")
        namedType = createSdsNamedType(`class`)
    }

    @Nested
    inner class TypeParameterOrNull {

        @Test
        fun `should resolve type argument (positional, call, valid index)`() {
            function.typeParameterList = createSdsTypeParameterList(listOf(typeParameter))
            call.typeArgumentList = createSdsTypeArgumentList(listOf(positionalTypeArgument))

            positionalTypeArgument.typeParameterOrNull() shouldBe typeParameter
        }

        @Test
        fun `should resolve type argument (named, call, valid index)`() {
            function.typeParameterList = createSdsTypeParameterList(listOf(typeParameter))
            call.typeArgumentList = createSdsTypeArgumentList(listOf(namedTypeArgument))

            namedTypeArgument.typeParameterOrNull() shouldBe typeParameter
        }

        @Test
        fun `should resolve argument (positional, named type, valid index)`() {
            `class`.typeParameterList = createSdsTypeParameterList(listOf(typeParameter))
            namedType.typeArgumentList = createSdsTypeArgumentList(listOf(positionalTypeArgument))

            positionalTypeArgument.typeParameterOrNull() shouldBe typeParameter
        }

        @Test
        fun `should resolve argument (named, named type, valid index)`() {
            `class`.typeParameterList = createSdsTypeParameterList(listOf(typeParameter))
            namedType.typeArgumentList = createSdsTypeArgumentList(listOf(namedTypeArgument))

            namedTypeArgument.typeParameterOrNull() shouldBe typeParameter
        }

        @Test
        fun `should return null if named type arguments precede positional type argument (call)`() {
            function.typeParameterList = createSdsTypeParameterList(listOf(typeParameter))
            call.typeArgumentList = createSdsTypeArgumentList(listOf(namedTypeArgument, positionalTypeArgument))

            positionalTypeArgument.typeParameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if named type arguments precede positional type argument (named type)`() {
            `class`.typeParameterList = createSdsTypeParameterList(listOf(typeParameter))
            namedType.typeArgumentList = createSdsTypeArgumentList(listOf(namedTypeArgument, positionalTypeArgument))

            positionalTypeArgument.typeParameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if no matching type parameter exists (call)`() {
            call.typeArgumentList = createSdsTypeArgumentList(listOf(positionalTypeArgument))

            positionalTypeArgument.typeParameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if no matching type parameter exists (named type)`() {
            namedType.typeArgumentList = createSdsTypeArgumentList(listOf(positionalTypeArgument))

            positionalTypeArgument.typeParameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if type argument list cannot be matched to type parameter list`() {
            createSdsTypeArgumentList(listOf(positionalTypeArgument))

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
            function.typeParameterList = createSdsTypeParameterList(listOf(typeParameter))
            call.typeArgumentList = createSdsTypeArgumentList(listOf(positionalTypeArgument))

            call.typeArgumentList.typeParametersOrNull().shouldContainExactly(typeParameter)
        }

        @Test
        fun `should resolve type argument list of annotation call`() {
            `class`.typeParameterList = createSdsTypeParameterList(listOf(typeParameter))
            namedType.typeArgumentList = createSdsTypeArgumentList(listOf(positionalTypeArgument))

            namedType.typeArgumentList.typeParametersOrNull().shouldContainExactly(typeParameter)
        }

        @Test
        fun `should return null if the type argument list cannot be resolved`() {
            val typeArgumentList = createSdsTypeArgumentList(listOf(positionalTypeArgument))

            typeArgumentList.typeParametersOrNull().shouldBeNull()
        }
    }
}
