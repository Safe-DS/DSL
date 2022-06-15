package com.larsreimann.safeds.stdlibDocumentation

import com.google.inject.Inject
import com.google.inject.Provider
import com.larsreimann.safeds.SimpleMLStandaloneSetup
import com.larsreimann.safeds.emf.compilationUnitOrNull
import com.larsreimann.safeds.stdlibAccess.loadStdlib
import org.eclipse.emf.ecore.resource.ResourceSet
import org.eclipse.xtext.diagnostics.Severity
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.validation.CheckMode
import org.eclipse.xtext.validation.IResourceValidator
import java.nio.file.Path
import kotlin.system.exitProcess

@Suppress("unused")
class Main @Inject constructor(
    private val resourceSetProvider: Provider<ResourceSet>,
    private val validator: IResourceValidator
) {

    fun runStdlibDocumentationGenerator(outputDirectory: Path) {

        // Load the standard library
        val resourceSet = resourceSetProvider.get()
        resourceSet.loadStdlib()

        // Validate all resources
        var hasErrors = false
        resourceSet.resources.forEach { resource ->
            val issues = validator.validate(resource, CheckMode.ALL, CancelIndicator.NullImpl)
            if (issues.any { it.severity == Severity.ERROR }) {
                issues.forEach { println(it) }
                hasErrors = true
            }
        }

        if (hasErrors) {
            System.err.println("Aborting: A resource has errors.")
            exitProcess(20)
        } else {
            val context = resourceSet.resources.getOrNull(0)?.compilationUnitOrNull()
            if (context == null) {
                System.err.println("Aborting: Resource set is empty.")
                exitProcess(30)
            }
            context.generateDocumentation(outputDirectory)
        }

        println("Generation of stdlib documentation finished.")
    }
}

fun main(args: Array<String>) {
    if (args.isEmpty()) {
        System.err.println("Aborting: No path to output directory provided.")
        exitProcess(10)
    }

    val injector = SimpleMLStandaloneSetup().createInjectorAndDoEMFRegistration()
    val main = injector.getInstance(Main::class.java)
    main.runStdlibDocumentationGenerator(Path.of(args[0]))
}
