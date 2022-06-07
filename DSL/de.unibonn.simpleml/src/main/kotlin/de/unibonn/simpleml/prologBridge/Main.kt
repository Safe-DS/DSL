package de.unibonn.simpleml.prologBridge

import com.google.inject.Inject
import com.google.inject.Provider
import de.unibonn.simpleml.SimpleMLStandaloneSetup
import de.unibonn.simpleml.prologBridge.converters.AstToPrologFactbase
import de.unibonn.simpleml.prologBridge.model.facts.PlFactbase
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.stdlibAccess.loadStdlib
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.resource.ResourceSet
import org.eclipse.xtext.util.CancelIndicator
import org.eclipse.xtext.validation.CheckMode
import org.eclipse.xtext.validation.IResourceValidator
import org.eclipse.xtext.validation.Issue
import java.io.File
import java.nio.file.Files
import java.nio.file.Paths

class Main @Inject constructor(
    private val prologVisitor: AstToPrologFactbase,
    private val resourceSetProvider: Provider<ResourceSet>,
    private val validator: IResourceValidator
) {

    fun createFactbase(file: String): PlFactbase {

        // Load resource and library
        val set = resourceSetProvider.get()
        set.loadStdlib()

        val resource = set.getResource(URI.createFileURI(file), true)
        require(resource != null) { "Could not create resource for $file." }
        require(resource.contents.isNotEmpty()) { "Resource for $file is empty." }

        // Check for syntax errors
        val issues = validator.validate(resource, CheckMode.ALL, CancelIndicator.NullImpl)
        require(issues.none { it.isSyntaxError }) { syntaxErrorMessage(issues) }

        // Configure and start the visitor
        val compilationUnit = resource.contents[0] as SmlCompilationUnit
        return prologVisitor.createFactbase(listOf(compilationUnit))
    }

    private fun syntaxErrorMessage(issues: List<Issue>) = buildString {
        appendLine("Resource has syntax errors:")
        issues.filter { it.isSyntaxError }.forEach {
            appendLine("  * $it")
        }
    }
}

fun main() {
    val time0: Long = System.currentTimeMillis()
    /*if (args.isEmpty()) {
        System.err.println("Aborting: no path to EMF resource provided!")
        return
    }

    val injector = SimpleMLStandaloneSetup().createInjectorAndDoEMFRegistration()
    val main = injector.getInstance(Main::class.java)
    val factbase = main.createFactbase(args[0])

    Files.write(Paths.get("prolog_facts.pl"), factbase.toString().toByteArray())*/

    // TESTING ALL ELEMENTS
    val injector = SimpleMLStandaloneSetup().createInjectorAndDoEMFRegistration()
    val main = injector.getInstance(Main::class.java)

    File("testPrologVisitor").walkTopDown().forEach {
        if (it.isFile) {
            val factbase = main.createFactbase(it.absolutePath)
            val path = ("PrologFacts/" + it.path).replace(it.name, "")
            Files.createDirectories(Paths.get(path))
            Files.write(Paths.get(path + (it.name.replace(it.extension, "pl"))), factbase.toString().toByteArray())
        }
    }

    val time1 = System.currentTimeMillis()
    println((time1 - time0) / 1000.0)
}
