package com.larsreimann.safeds

import com.google.inject.Inject
import de.unibonn.simpleml.emf.OriginalFilePath
import de.unibonn.simpleml.stdlibAccess.listStdlibFiles
import de.unibonn.simpleml.testing.ParseHelper
import de.unibonn.simpleml.testing.SimpleMLInjectorProvider
import de.unibonn.simpleml.testing.assertions.shouldHaveNoErrorsOrWarnings
import io.kotest.matchers.nulls.shouldNotBeNull
import org.eclipse.xtext.testing.InjectWith
import org.eclipse.xtext.testing.extensions.InjectionExtension
import org.eclipse.xtext.testing.validation.ValidationTestHelper
import org.junit.jupiter.api.DynamicNode
import org.junit.jupiter.api.DynamicTest
import org.junit.jupiter.api.TestFactory
import org.junit.jupiter.api.extension.ExtendWith
import java.nio.file.Files
import java.util.stream.Stream

@ExtendWith(InjectionExtension::class)
@InjectWith(SimpleMLInjectorProvider::class)
class StdlibTest {

    @Inject
    private lateinit var parseHelper: ParseHelper

    @Inject
    private lateinit var validationHelper: ValidationTestHelper

    @TestFactory
    fun `should not have syntax or semantic errors`(): Stream<out DynamicNode> {
        val allStdlibFiles = listStdlibFiles().map { it.first.toString() }.toList()

        return listStdlibFiles()
            .map { (filePath, _) ->

                // We must do this here and not in the callback of the dynamicTest so the JAR file system is still open
                val otherStdlibFiles = allStdlibFiles - filePath.toString()
                val program = Files.readString(filePath)
                val parsingResult = parseHelper.parseProgramText(program, context = otherStdlibFiles, loadStdlib = false)

                DynamicTest.dynamicTest(filePath.toString(), filePath.toUri()) {
                    parsingResult.shouldNotBeNull()
                    parsingResult.eResource().eAdapters().add(OriginalFilePath(filePath.toString()))
                    validationHelper.validate(parsingResult).shouldHaveNoErrorsOrWarnings()
                }
            }
            .toList()
            .stream()
    }
}
