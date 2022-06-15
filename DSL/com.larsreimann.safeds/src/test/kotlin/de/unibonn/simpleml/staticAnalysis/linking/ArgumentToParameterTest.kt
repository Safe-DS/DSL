package com.larsreimann.safeds.staticAnalysis.linking

import de.unibonn.simpleml.emf.createSmlAnnotation
import de.unibonn.simpleml.emf.createSmlAnnotationCall
import de.unibonn.simpleml.emf.createSmlArgument
import de.unibonn.simpleml.emf.createSmlArgumentList
import de.unibonn.simpleml.emf.createSmlCall
import de.unibonn.simpleml.emf.createSmlFunction
import de.unibonn.simpleml.emf.createSmlNull
import de.unibonn.simpleml.emf.createSmlParameter
import de.unibonn.simpleml.emf.createSmlParameterList
import de.unibonn.simpleml.emf.createSmlReference
import com.larsreimann.safeds.safeDS.SdsAnnotation
import com.larsreimann.safeds.safeDS.SdsAnnotationCall
import com.larsreimann.safeds.safeDS.SdsArgument
import com.larsreimann.safeds.safeDS.SdsCall
import com.larsreimann.safeds.safeDS.SdsFunction
import com.larsreimann.safeds.safeDS.SdsParameter
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.nulls.shouldBeNull
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class ArgumentToParameterTest {
    private lateinit var normalParameter: SmlParameter
    private lateinit var variadicParameter: SmlParameter

    private lateinit var positionalArgument: SmlArgument
    private lateinit var namedArgument: SmlArgument

    private lateinit var function: SmlFunction
    private lateinit var call: SmlCall

    private lateinit var annotation: SmlAnnotation
    private lateinit var annotationCall: SmlAnnotationCall

    @BeforeEach
    fun reset() {
        normalParameter = createSmlParameter(name = "normalParameter")
        variadicParameter = createSmlParameter(
            name = "variadicParameter",
            isVariadic = true
        )

        positionalArgument = createSmlArgument(
            value = createSmlNull()
        )
        namedArgument = createSmlArgument(
            value = createSmlNull(),
            parameter = normalParameter,
        )

        function = createSmlFunction(name = "f")
        call = createSmlCall(
            createSmlReference(function)
        )

        annotation = createSmlAnnotation(name = "A")
        annotationCall = createSmlAnnotationCall(annotation)
    }

    @Nested
    inner class ParameterOrNull {

        @Test
        fun `should resolve argument (positional, function call, valid index)`() {
            function.parameterList = createSmlParameterList(listOf(normalParameter))
            call.argumentList = createSmlArgumentList(listOf(positionalArgument))

            positionalArgument.parameterOrNull() shouldBe normalParameter
        }

        @Test
        fun `should resolve argument (named, function call, valid index)`() {
            function.parameterList = createSmlParameterList(listOf(normalParameter))
            call.argumentList = createSmlArgumentList(listOf(namedArgument))

            namedArgument.parameterOrNull() shouldBe normalParameter
        }

        @Test
        fun `should resolve argument (positional, annotation call, valid index)`() {
            annotation.parameterList = createSmlParameterList(listOf(normalParameter))
            annotationCall.argumentList = createSmlArgumentList(listOf(positionalArgument))

            positionalArgument.parameterOrNull() shouldBe normalParameter
        }

        @Test
        fun `should resolve argument (named, annotation call, valid index)`() {
            annotation.parameterList = createSmlParameterList(listOf(normalParameter))
            annotationCall.argumentList = createSmlArgumentList(listOf(namedArgument))

            namedArgument.parameterOrNull() shouldBe normalParameter
        }

        @Test
        fun `should resolve arguments (function call, variadic)`() {
            namedArgument.parameter = variadicParameter
            function.parameterList = createSmlParameterList(listOf(variadicParameter))
            call.argumentList = createSmlArgumentList(listOf(positionalArgument, namedArgument))

            namedArgument.parameterOrNull() shouldBe variadicParameter
            positionalArgument.parameterOrNull() shouldBe variadicParameter
        }

        @Test
        fun `should resolve arguments (annotation call, variadic)`() {
            namedArgument.parameter = variadicParameter
            annotation.parameterList = createSmlParameterList(listOf(variadicParameter))
            annotationCall.argumentList = createSmlArgumentList(listOf(positionalArgument, namedArgument))

            namedArgument.parameterOrNull() shouldBe variadicParameter
            positionalArgument.parameterOrNull() shouldBe variadicParameter
        }

        @Test
        fun `should return null if named arguments precede positional arguments (function call)`() {
            function.parameterList = createSmlParameterList(listOf(normalParameter))
            call.argumentList = createSmlArgumentList(listOf(namedArgument, positionalArgument))

            positionalArgument.parameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if named arguments precede positional arguments (annotation call)`() {
            annotation.parameterList = createSmlParameterList(listOf(normalParameter))
            annotationCall.argumentList = createSmlArgumentList(listOf(namedArgument, positionalArgument))

            positionalArgument.parameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if no matching parameter exists (function call)`() {
            call.argumentList = createSmlArgumentList(listOf(positionalArgument))

            positionalArgument.parameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if no matching parameter exists (annotation call)`() {
            annotationCall.argumentList = createSmlArgumentList(listOf(positionalArgument))

            positionalArgument.parameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if argument list cannot be matched to parameter list`() {
            createSmlArgumentList(listOf(positionalArgument))

            positionalArgument.parameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null for positional arguments that are not in an argument list`() {
            positionalArgument.parameterOrNull().shouldBeNull()
        }
    }

    @Nested
    inner class ParametersOrNull {

        @Test
        fun `should resolve argument list of function call`() {
            function.parameterList = createSmlParameterList(listOf(normalParameter, variadicParameter))
            call.argumentList = createSmlArgumentList(emptyList())

            call.argumentList.parametersOrNull().shouldContainExactly(normalParameter, variadicParameter)
        }

        @Test
        fun `should resolve argument list of annotation call`() {
            annotation.parameterList = createSmlParameterList(listOf(normalParameter, variadicParameter))
            annotationCall.argumentList = createSmlArgumentList(emptyList())

            annotationCall.argumentList.parametersOrNull().shouldContainExactly(normalParameter, variadicParameter)
        }

        @Test
        fun `should return null if the argument list cannot be resolved`() {
            val argumentList = createSmlArgumentList(emptyList())

            argumentList.parametersOrNull().shouldBeNull()
        }
    }
}
