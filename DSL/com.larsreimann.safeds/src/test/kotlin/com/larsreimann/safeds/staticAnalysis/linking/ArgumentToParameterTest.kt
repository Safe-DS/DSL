package com.larsreimann.safeds.staticAnalysis.linking

import com.larsreimann.safeds.emf.createSdsAnnotation
import com.larsreimann.safeds.emf.createSdsAnnotationCall
import com.larsreimann.safeds.emf.createSdsArgument
import com.larsreimann.safeds.emf.createSdsArgumentList
import com.larsreimann.safeds.emf.createSdsCall
import com.larsreimann.safeds.emf.createSdsFunction
import com.larsreimann.safeds.emf.createSdsNull
import com.larsreimann.safeds.emf.createSdsParameter
import com.larsreimann.safeds.emf.createSdsParameterList
import com.larsreimann.safeds.emf.createSdsReference
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
    private lateinit var normalParameter: SdsParameter
    private lateinit var variadicParameter: SdsParameter

    private lateinit var positionalArgument: SdsArgument
    private lateinit var namedArgument: SdsArgument

    private lateinit var function: SdsFunction
    private lateinit var call: SdsCall

    private lateinit var annotation: SdsAnnotation
    private lateinit var annotationCall: SdsAnnotationCall

    @BeforeEach
    fun reset() {
        normalParameter = createSdsParameter(name = "normalParameter")
        variadicParameter = createSdsParameter(
            name = "variadicParameter",
            isVariadic = true
        )

        positionalArgument = createSdsArgument(
            value = createSdsNull()
        )
        namedArgument = createSdsArgument(
            value = createSdsNull(),
            parameter = normalParameter,
        )

        function = createSdsFunction(name = "f")
        call = createSdsCall(
            createSdsReference(function)
        )

        annotation = createSdsAnnotation(name = "A")
        annotationCall = createSdsAnnotationCall(annotation)
    }

    @Nested
    inner class ParameterOrNull {

        @Test
        fun `should resolve argument (positional, function call, valid index)`() {
            function.parameterList = createSdsParameterList(listOf(normalParameter))
            call.argumentList = createSdsArgumentList(listOf(positionalArgument))

            positionalArgument.parameterOrNull() shouldBe normalParameter
        }

        @Test
        fun `should resolve argument (named, function call, valid index)`() {
            function.parameterList = createSdsParameterList(listOf(normalParameter))
            call.argumentList = createSdsArgumentList(listOf(namedArgument))

            namedArgument.parameterOrNull() shouldBe normalParameter
        }

        @Test
        fun `should resolve argument (positional, annotation call, valid index)`() {
            annotation.parameterList = createSdsParameterList(listOf(normalParameter))
            annotationCall.argumentList = createSdsArgumentList(listOf(positionalArgument))

            positionalArgument.parameterOrNull() shouldBe normalParameter
        }

        @Test
        fun `should resolve argument (named, annotation call, valid index)`() {
            annotation.parameterList = createSdsParameterList(listOf(normalParameter))
            annotationCall.argumentList = createSdsArgumentList(listOf(namedArgument))

            namedArgument.parameterOrNull() shouldBe normalParameter
        }

        @Test
        fun `should resolve arguments (function call, variadic)`() {
            namedArgument.parameter = variadicParameter
            function.parameterList = createSdsParameterList(listOf(variadicParameter))
            call.argumentList = createSdsArgumentList(listOf(positionalArgument, namedArgument))

            namedArgument.parameterOrNull() shouldBe variadicParameter
            positionalArgument.parameterOrNull() shouldBe variadicParameter
        }

        @Test
        fun `should resolve arguments (annotation call, variadic)`() {
            namedArgument.parameter = variadicParameter
            annotation.parameterList = createSdsParameterList(listOf(variadicParameter))
            annotationCall.argumentList = createSdsArgumentList(listOf(positionalArgument, namedArgument))

            namedArgument.parameterOrNull() shouldBe variadicParameter
            positionalArgument.parameterOrNull() shouldBe variadicParameter
        }

        @Test
        fun `should return null if named arguments precede positional arguments (function call)`() {
            function.parameterList = createSdsParameterList(listOf(normalParameter))
            call.argumentList = createSdsArgumentList(listOf(namedArgument, positionalArgument))

            positionalArgument.parameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if named arguments precede positional arguments (annotation call)`() {
            annotation.parameterList = createSdsParameterList(listOf(normalParameter))
            annotationCall.argumentList = createSdsArgumentList(listOf(namedArgument, positionalArgument))

            positionalArgument.parameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if no matching parameter exists (function call)`() {
            call.argumentList = createSdsArgumentList(listOf(positionalArgument))

            positionalArgument.parameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if no matching parameter exists (annotation call)`() {
            annotationCall.argumentList = createSdsArgumentList(listOf(positionalArgument))

            positionalArgument.parameterOrNull().shouldBeNull()
        }

        @Test
        fun `should return null if argument list cannot be matched to parameter list`() {
            createSdsArgumentList(listOf(positionalArgument))

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
            function.parameterList = createSdsParameterList(listOf(normalParameter, variadicParameter))
            call.argumentList = createSdsArgumentList(emptyList())

            call.argumentList.parametersOrNull().shouldContainExactly(normalParameter, variadicParameter)
        }

        @Test
        fun `should resolve argument list of annotation call`() {
            annotation.parameterList = createSdsParameterList(listOf(normalParameter, variadicParameter))
            annotationCall.argumentList = createSdsArgumentList(emptyList())

            annotationCall.argumentList.parametersOrNull().shouldContainExactly(normalParameter, variadicParameter)
        }

        @Test
        fun `should return null if the argument list cannot be resolved`() {
            val argumentList = createSdsArgumentList(emptyList())

            argumentList.parametersOrNull().shouldBeNull()
        }
    }
}
