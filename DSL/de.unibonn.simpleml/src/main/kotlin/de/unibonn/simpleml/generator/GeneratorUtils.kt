package de.unibonn.simpleml.generator

import de.unibonn.simpleml.constant.SmlFileExtension
import de.unibonn.simpleml.emf.compilationUnitOrNull
import de.unibonn.simpleml.simpleML.SmlCompilationUnit
import de.unibonn.simpleml.stdlibAccess.pythonModuleOrNull
import org.eclipse.emf.common.util.URI
import org.eclipse.emf.ecore.resource.Resource

/**
 * Returns the base file name of the resource, i.e. the last segment of its [URI] with any Simple-ML extension removed,
 * or `null` if the resource has no [URI].
 */
fun Resource.baseFileNameOrNull(): String? {
    return uri
        ?.lastSegment()
        ?.removeSuffix(".${SmlFileExtension.Stub}")
        ?.removeSuffix(".${SmlFileExtension.Test}")
        ?.removeSuffix(".${SmlFileExtension.Flow}")
        ?.replace(Regex("%2520"), "_") // Twice URL encoded space
        ?.replace(Regex("[ .-]"), "_")
        ?.replace(Regex("\\W"), "")
}

/**
 * Returns the prefix of the path of all generated files, or `null` if this [Resource] does not provide enough
 * information to deduce this prefix. This can be caused if either
 * - the [Resource] contains no [SmlCompilationUnit],
 * - the [SmlCompilationUnit] has no package,
 * - the [Resource] has no [URI].
 */
fun Resource.baseGeneratedFilePathOrNull(): String? {
    val compilationUnit = compilationUnitOrNull() ?: return null

    val compilationUnitPythonName = compilationUnit.pythonModuleOrNull() ?: compilationUnit.name
    val packagePart = compilationUnitPythonName
        ?.replace(".", "/")
        ?: return null

    val filePart = baseFileNameOrNull() ?: return null

    return "$packagePart/gen_$filePart"
}
