package com.larsreimann.safeds.stdlibAccess

import com.larsreimann.safeds.constant.SdsFileExtension
import com.larsreimann.safeds.emf.resourceSetOrNull
import com.larsreimann.safeds.scoping.allGlobalDeclarations
import com.larsreimann.safeds.safeDS.SdsAbstractDeclaration
import com.larsreimann.safeds.safeDS.SdsClass
import org.eclipse.core.runtime.FileLocator
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.EObject
import org.eclipse.emf.ecore.resource.ResourceSet
import org.eclipse.xtext.naming.QualifiedName
import java.nio.file.FileSystem
import java.nio.file.FileSystems
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.WeakHashMap

private val cache = WeakHashMap<ResourceSet, WeakHashMap<QualifiedName, EObject?>>()
private val classLoader = object {}.javaClass.classLoader

/**
 * Loads the standard library into this resource set.
 */
fun ResourceSet.loadStdlib() {
    listStdlibFiles().forEach { (path, uri) ->
        createResource(uri).load(Files.newInputStream(path), loadOptions)
    }
}

/**
 * Lists all files that comprise the standard library.
 */
fun listStdlibFiles(): Sequence<Pair<Path, URI>> {
    val resourcesUrl = classLoader.getResource("stdlib") ?: return emptySequence()
    val resourcesUri = FileLocator.resolve(resourcesUrl).toURI()

    return sequence {
        var fileSystem: FileSystem? = null
        val stdlibBase = when (resourcesUri.scheme) {

            // Without this code tests fail with a FileSystemNotFoundException since stdlib resources are in a jar
            "jar" -> {
                fileSystem = FileSystems.newFileSystem(
                    resourcesUri,
                    emptyMap<String, String>(),
                    null
                )
                fileSystem.getPath("stdlib")
            }
            else -> Paths.get(resourcesUri)
        }

        val stdlibFiles = Files.walk(stdlibBase)
            .filter { it.toString().endsWith(".${SdsFileExtension.Stub}") }

        for (path in stdlibFiles) {
            val relativePath = path.toString().replace("stdlib/", "")
            val uri = URI.createURI("$resourcesUri/$relativePath".replace("%3A", ":"))
            yield(path to uri)
        }

        fileSystem?.close()
    }
}

/**
 * Returns the [SdsClass] with the given [QualifiedName] within this context. If the declaration cannot be found, `null`
 * is returned.
 *
 * @receiver The context for the search.
 */
fun EObject.getStdlibClassOrNull(qualifiedName: QualifiedName): SdsClass? {
    return getStdlibDeclarationOrNull(qualifiedName)
}

/**
 * Returns the declaration with the given [QualifiedName] within this context. If the declaration cannot be found,
 * `null` is returned.
 *
 * @receiver The context for the search.
 */
private inline fun <reified T : SdsAbstractDeclaration> EObject.getStdlibDeclarationOrNull(
    qualifiedName: QualifiedName
): T? {
    return try {
        getStdlibDeclaration(qualifiedName)
    } catch (e: IllegalStateException) {
        null
    }
}

/**
 * Returns the declaration with the given [QualifiedName] within this context. If the declaration cannot be found an
 * exception is thrown.
 *
 * @receiver The context for the search.
 * @throws IllegalStateException If the context is not in a resource set.
 * @throws IllegalStateException If no declaration with the qualified name exists in the resource set.
 * @throws IllegalStateException If the declaration with the qualified name does not have the desired type.
 */
private inline fun <reified T : SdsAbstractDeclaration> EObject.getStdlibDeclaration(qualifiedName: QualifiedName): T {
    val resourceSet = resourceSetOrNull() ?: throw IllegalStateException("This context is not in a resource set.")
    val cacheForResourceSet = cache.getOrPut(resourceSet) { WeakHashMap() }

    val eObject = cacheForResourceSet.computeIfAbsent(qualifiedName) {
        val description = allGlobalDeclarations()
            .find { it.qualifiedName == qualifiedName }
            ?: throw IllegalStateException("Failed to load stdlib declaration '$qualifiedName'.")

        var eObject = description.eObjectOrProxy
        if (eObject != null && eObject.eIsProxy()) {
            eObject = eResource().resourceSet.getEObject(description.eObjectURI, true)
        }

        eObject
    }

    return when (eObject) {
        is T -> eObject
        else -> throw IllegalStateException("Stdlib declaration '$qualifiedName' is not an ${T::class.simpleName}.")
    }
}
