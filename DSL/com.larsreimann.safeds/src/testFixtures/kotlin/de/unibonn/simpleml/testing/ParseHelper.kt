@file:Suppress("unused", "MemberVisibilityCanBePrivate")

package com.larsreimann.safeds.testing

import com.google.inject.Inject
import com.google.inject.Provider
import com.larsreimann.safeds.safeDS.SdsCompilationUnit
import de.unibonn.simpleml.stdlibAccess.loadStdlib
import org.eclipse.core.runtime.FileLocator
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.resource.Resource
import org.eclipse.emf.ecore.resource.ResourceSet
import org.eclipse.xtext.testing.util.ParseHelper
import java.nio.file.Files
import java.nio.file.Paths

/**
 * Relative path under the `resources` folder of the test source set.
 */
typealias ResourceName = String

/**
 * Utilities for tests that load their test data from files or strings.
 */
class ParseHelper @Inject constructor(
    private val parseHelper: ParseHelper<SmlCompilationUnit>,
    private val resourceSetProvider: Provider<ResourceSet>
) {

    /**
     * Parses the contents of the resource with the given [resourceName] and returns the contained [SmlCompilationUnit]
     * or `null` if something went wrong. Any resources in the [context] are included in the same [ResourceSet].
     * Likewise, if [loadStdlib] is `true`, the standard library is also included in the [ResourceSet].
     */
    fun parseResource(
        resourceName: ResourceName,
        context: List<ResourceName> = emptyList(),
        loadStdlib: Boolean = true
    ): SmlCompilationUnit? {

        val programText = readProgramTextFromResource(resourceName) ?: return null
        val uri = javaClass.classLoader.getResourceEmfUri(resourceName) ?: return null
        return parseProgramText(programText, uri, context, loadStdlib)
    }

    /**
     * Parses the given [programText] and returns the contained [SmlCompilationUnit] or `null` if something went wrong.
     * Any resources in the [context] are included in the same [ResourceSet]. Likewise, if [loadStdlib] is `true`, the
     * standard library is also included in the [ResourceSet].
     */
    fun parseProgramText(
        programText: String,
        context: List<ResourceName> = emptyList(),
        loadStdlib: Boolean = true
    ): SmlCompilationUnit? {

        val resourceSet = createResourceSetFromContext(context)
        if (loadStdlib) {
            resourceSet.loadStdlib()
        }
        return parseHelper.parse(programText, resourceSet)
    }

    /**
     * Parses the given [programText] and returns the contained [SmlCompilationUnit] or `null` if something went wrong.
     * The [URI] of the [Resource] that contains the created [SmlCompilationUnit] is set to [uriToUse]. Any resources in
     * the [context] are included in the same [ResourceSet]. Likewise, if [loadStdlib] is `true`, the standard library
     * is also included in the [ResourceSet].
     */
    fun parseProgramText(
        programText: String,
        uriToUse: URI,
        context: List<ResourceName> = emptyList(),
        loadStdlib: Boolean = true
    ): SmlCompilationUnit? {

        val resourceSet = createResourceSetFromContext(context)
        if (loadStdlib) {
            resourceSet.loadStdlib()
        }
        return parseHelper.parse(programText, uriToUse, resourceSet)
    }

    /**
     * Returns the program text within the resource with the given [resourceName] or `null` if reading failed.
     */
    private fun readProgramTextFromResource(resourceName: ResourceName): String? {
        val resourcePath = javaClass.classLoader.getResourcePath(resourceName) ?: return null
        if (!Files.isReadable(resourcePath)) {
            return null
        }

        return Files.readString(resourcePath).replace("\r\n", "\n")
    }

    /**
     * Creates a [ResourceSet] containing all resources in the [context].
     */
    private fun createResourceSetFromContext(context: List<ResourceName>): ResourceSet {
        val result = resourceSetProvider.get()
        for (resourceName in context) {
            val resourceUrl = javaClass.classLoader.getResource(resourceName) ?: continue
            val resourceFileUri = FileLocator.resolve(resourceUrl).toURI()
            val resourceEmfUri = URI.createURI(resourceFileUri.toString(), false)
            val resourcePath = Paths.get(resourceFileUri)

            result
                .createResource(resourceEmfUri)
                ?.load(Files.newInputStream(resourcePath), result.loadOptions)
        }
        return result
    }
}
